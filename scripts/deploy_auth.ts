import { AuthorizeTransfer } from "./../typechain-types/contracts/AuthorizeTransfer";
import { ethers } from "hardhat";

const C = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

async function main() {
  const AuthorizeTransfer = await ethers.getContractFactory(
    "AuthorizeTransfer"
  );
  const authorize = await AuthorizeTransfer.deploy(C);
  console.log("ClassToken deployed to:", authorize.target); // Use .target instead of .address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
