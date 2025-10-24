import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { ZamaSportsPrediction } from "../types";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("ZamaSportsPredictionSepolia", function () {
  let signers: Signers;
  let contract: ZamaSportsPrediction;
  let contractAddress: string;
  let step = 0;
  let steps = 0;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn("This hardhat test suite can only run on Sepolia Testnet");
      this.skip();
    }

    try {
      const deployment = await deployments.get("ZamaSportsPrediction");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("ZamaSportsPrediction", contractAddress);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const accounts: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: accounts[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("creates, votes, closes, and decrypts a prediction", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    progress("Creating prediction...");
    const createTx = await contract.connect(signers.alice).createPrediction("Friendly", "Home", "Away");
    await createTx.wait();

    progress("Encrypting vote...");
    const encryptedVote = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(1)
      .add32(0)
      .add32(0)
      .encrypt();

    progress("Submitting encrypted vote...");
    const voteTx = await contract
      .connect(signers.alice)
      .submitPrediction(
        0,
        encryptedVote.handles[0],
        encryptedVote.handles[1],
        encryptedVote.handles[2],
        encryptedVote.inputProof,
      );
    await voteTx.wait();

    progress("Closing prediction...");
    const closeTx = await contract.connect(signers.alice).closePrediction(0);
    await closeTx.wait();

    progress("Fetching prediction...");
    const prediction = await contract.getPrediction(0);

    progress("Decrypting home votes...");
    const homeVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      prediction.homeVotes,
      contractAddress,
      signers.alice,
    );

    progress("Decrypting away votes...");
    const awayVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      prediction.awayVotes,
      contractAddress,
      signers.alice,
    );

    progress("Decrypting draw votes...");
    const drawVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      prediction.drawVotes,
      contractAddress,
      signers.alice,
    );

    expect(homeVotes).to.eq(1);
    expect(awayVotes).to.eq(0);
    expect(drawVotes).to.eq(0);
  });
});
