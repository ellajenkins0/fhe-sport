import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPrediction = await deploy("ZamaSportsPrediction", {
    from: deployer,
    log: true,
  });

  console.log(`ZamaSportsPrediction contract: `, deployedPrediction.address);
};
export default func;
func.id = "deploy_prediction"; // id required to prevent reexecution
func.tags = ["ZamaSportsPrediction"];
