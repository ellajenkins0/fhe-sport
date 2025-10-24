import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { ZamaSportsPrediction, ZamaSportsPrediction__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ZamaSportsPrediction")) as ZamaSportsPrediction__factory;
  const contract = (await factory.deploy()) as ZamaSportsPrediction;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("ZamaSportsPrediction", function () {
  let signers: Signers;
  let contract: ZamaSportsPrediction;
  let contractAddress: string;

  before(async function () {
    const accounts: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: accounts[0], alice: accounts[1], bob: accounts[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    ({ contract, address: contractAddress } = await deployFixture());
  });

  async function encryptChoice(signer: HardhatEthersSigner, choice: number) {
    const builder = fhevm.createEncryptedInput(contractAddress, signer.address);
    builder.add32(choice === 1 ? 1 : 0);
    builder.add32(choice === 2 ? 1 : 0);
    builder.add32(choice === 3 ? 1 : 0);
    return builder.encrypt();
  }

  it("creates a prediction with zeroed encrypted counters", async function () {
    const tx = await contract.connect(signers.deployer).createPrediction("Derby", "Lions", "Tigers");
    await tx.wait();

    const count = await contract.getPredictionCount();
    expect(count).to.eq(1n);

    const prediction = await contract.getPrediction(0);
    expect(prediction.title).to.eq("Derby");
    expect(prediction.homeTeam).to.eq("Lions");
    expect(prediction.awayTeam).to.eq("Tigers");
    expect(prediction.isActive).to.eq(true);
    expect(prediction.homeVotes).to.eq(ethers.ZeroHash);
    expect(prediction.awayVotes).to.eq(ethers.ZeroHash);
    expect(prediction.drawVotes).to.eq(ethers.ZeroHash);
  });

  it("records encrypted votes and decrypts totals after closing", async function () {
    const createTx = await contract.connect(signers.deployer).createPrediction("Final", "Home", "Away");
    await createTx.wait();

    const encryptedAlice = await encryptChoice(signers.alice, 1);
    await contract
      .connect(signers.alice)
      .submitPrediction(
        0,
        encryptedAlice.handles[0],
        encryptedAlice.handles[1],
        encryptedAlice.handles[2],
        encryptedAlice.inputProof,
      )
      .then((tx) => tx.wait());

    const encryptedBob = await encryptChoice(signers.bob, 2);
    await contract
      .connect(signers.bob)
      .submitPrediction(
        0,
        encryptedBob.handles[0],
        encryptedBob.handles[1],
        encryptedBob.handles[2],
        encryptedBob.inputProof,
      )
      .then((tx) => tx.wait());

    const closeTx = await contract.connect(signers.deployer).closePrediction(0);
    await closeTx.wait();

    const prediction = await contract.getPrediction(0);
    const homeVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      prediction.homeVotes,
      contractAddress,
      signers.deployer,
    );
    const awayVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      prediction.awayVotes,
      contractAddress,
      signers.deployer,
    );
    const drawVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      prediction.drawVotes,
      contractAddress,
      signers.deployer,
    );

    expect(homeVotes).to.eq(1);
    expect(awayVotes).to.eq(1);
    expect(drawVotes).to.eq(0);
  });

  it("prevents duplicate predictions from the same account", async function () {
    const createTx = await contract.connect(signers.deployer).createPrediction("League", "Sharks", "Eagles");
    await createTx.wait();

    const encryptedAlice = await encryptChoice(signers.alice, 3);
    await contract
      .connect(signers.alice)
      .submitPrediction(
        0,
        encryptedAlice.handles[0],
        encryptedAlice.handles[1],
        encryptedAlice.handles[2],
        encryptedAlice.inputProof,
      )
      .then((tx) => tx.wait());

    await expect(
      contract
        .connect(signers.alice)
        .submitPrediction(
          0,
          encryptedAlice.handles[0],
          encryptedAlice.handles[1],
          encryptedAlice.handles[2],
          encryptedAlice.inputProof,
        ),
    ).to.be.revertedWithCustomError(contract, "AlreadyPredicted");
  });
});
