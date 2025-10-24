import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("prediction:address", "Prints the ZamaSportsPrediction address").setAction(async function (_, hre) {
  const { deployments } = hre;
  const deployment = await deployments.get("ZamaSportsPrediction");
  console.log("ZamaSportsPrediction address is " + deployment.address);
});

task("prediction:create", "Creates a new prediction")
  .addParam("title", "Prediction title")
  .addParam("home", "Home team name")
  .addParam("away", "Away team name")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers } = hre;
    const deployment = await deployments.get("ZamaSportsPrediction");
    const contract = await ethers.getContractAt("ZamaSportsPrediction", deployment.address);

    const tx = await contract.createPrediction(taskArguments.title, taskArguments.home, taskArguments.away);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const count = await contract.getPredictionCount();
    console.log(`Total predictions: ${count}`);
  });

task("prediction:vote", "Submits an encrypted vote for a prediction")
  .addParam("id", "Prediction identifier")
  .addParam("choice", "Prediction choice: 1=home, 2=away, 3=draw")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers, fhevm } = hre;

    const predictionId = parseInt(taskArguments.id, 10);
    if (!Number.isInteger(predictionId) || predictionId < 0) {
      throw new Error(`Argument --id must be a non-negative integer`);
    }

    const choice = parseInt(taskArguments.choice, 10);
    if (![1, 2, 3].includes(choice)) {
      throw new Error(`Argument --choice must be 1 (home), 2 (away), or 3 (draw)`);
    }

    await fhevm.initializeCLIApi();

    const deployment = await deployments.get("ZamaSportsPrediction");
    console.log(`ZamaSportsPrediction: ${deployment.address}`);

    const signers = await ethers.getSigners();
    const caller = signers[0];
    const contract = await ethers.getContractAt("ZamaSportsPrediction", deployment.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(deployment.address, caller.address)
      .add32(choice === 1 ? 1 : 0)
      .add32(choice === 2 ? 1 : 0)
      .add32(choice === 3 ? 1 : 0)
      .encrypt();

    const tx = await contract
      .connect(caller)
      .submitPrediction(
        predictionId,
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.handles[2],
        encryptedInput.inputProof,
      );

    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("prediction:close", "Closes a prediction and attempts to decrypt results")
  .addParam("id", "Prediction identifier")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers, fhevm } = hre;

    const predictionId = parseInt(taskArguments.id, 10);
    if (!Number.isInteger(predictionId) || predictionId < 0) {
      throw new Error(`Argument --id must be a non-negative integer`);
    }

    await fhevm.initializeCLIApi();

    const deployment = await deployments.get("ZamaSportsPrediction");
    console.log(`ZamaSportsPrediction: ${deployment.address}`);

    const signers = await ethers.getSigners();
    const caller = signers[0];
    const contract = await ethers.getContractAt("ZamaSportsPrediction", deployment.address);

    const tx = await contract.connect(caller).closePrediction(predictionId);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const prediction = await contract.getPrediction(predictionId);

    try {
      const homeVotes = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        prediction.homeVotes,
        deployment.address,
        caller,
      );
      const awayVotes = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        prediction.awayVotes,
        deployment.address,
        caller,
      );
      const drawVotes = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        prediction.drawVotes,
        deployment.address,
        caller,
      );

      console.log("Decrypted totals:");
      console.log(`  Home: ${homeVotes}`);
      console.log(`  Away: ${awayVotes}`);
      console.log(`  Draw: ${drawVotes}`);
    } catch (error) {
      console.warn("Failed to decrypt prediction results. Did you close the prediction with this account?", error);
    }
  });

task("prediction:show", "Displays prediction metadata and encrypted counters")
  .addParam("id", "Prediction identifier")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { deployments, ethers } = hre;

    const predictionId = parseInt(taskArguments.id, 10);
    if (!Number.isInteger(predictionId) || predictionId < 0) {
      throw new Error(`Argument --id must be a non-negative integer`);
    }

    const deployment = await deployments.get("ZamaSportsPrediction");
    const contract = await ethers.getContractAt("ZamaSportsPrediction", deployment.address);

    const prediction = await contract.getPrediction(predictionId);

    console.log(`Prediction #${predictionId}`);
    console.log(`  Title    : ${prediction.title}`);
    console.log(`  Home Team: ${prediction.homeTeam}`);
    console.log(`  Away Team: ${prediction.awayTeam}`);
    console.log(`  Creator  : ${prediction.creator}`);
    console.log(`  Active   : ${prediction.isActive}`);
    console.log(`  HomeVotes: ${prediction.homeVotes}`);
    console.log(`  AwayVotes: ${prediction.awayVotes}`);
    console.log(`  DrawVotes: ${prediction.drawVotes}`);
  });
