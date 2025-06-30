import { ethers } from "hardhat";
import { Web3 } from "web3";
const web3 = new Web3();

//发送交易
async function sendTransaction() {
  const fromAddress = "0xfb0bc05F1aC61a566E70890e0e000E66F147ae66";
  //需要privateKey
  const privateKey = "";
  // 获取当前交易计数 (nonce)
  // 获取当前交易计数（nonce）的原因：
  // 1. 防止重放攻击：每个账户的每笔交易都有唯一的nonce值，确保交易按顺序执行
  // 2. 保证交易顺序：nonce值必须严格递增，确保交易按发送顺序被处理
  // 3. 防止双花：通过nonce机制可以防止同一笔资金被多次使用
  // 4. 交易唯一性：即使交易内容相同，不同的nonce值也会使交易哈希不同
  // 5. 网络同步：帮助节点跟踪账户的交易状态，确保全网一致性
  const nonce = await web3.eth.getTransactionCount(fromAddress, "latest");
  // 设置交易参数
  const tx = {
    from: fromAddress,
    to: "0x9Ae9119e614BEdffbd0B66756Cf2F4F4CFdb7ca9",
    value: web3.utils.toWei("0.1", "ether"), // 发送 0.1 ETH
    gas: 21000, // 用于简单的 ETH 转账
    gasPrice: await web3.eth.getGasPrice(), // 获取当前网络的 gas 价格
    nonce: nonce,
  };
  // 签名交易的时候是需要私钥的
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

  // 发送已签名的交易
  web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .on("receipt", (receipt) => {
      console.log("交易成功:", receipt);
    })
    .on("error", (err) => {
      console.error("交易失败:", err);
    });
}

async function main() {
  const ethersWallet = ethers.Wallet.createRandom();
  console.log("以太坊钱包地址:", ethersWallet.address);
  console.log("以太坊公钥:", ethersWallet.publicKey);
  console.log("以太坊私钥:", ethersWallet.privateKey);
  //   console.log(ethersWallet);
  if (ethersWallet.mnemonic) {
    console.log("钱包包含助记词:", ethersWallet.mnemonic.phrase);
  } else {
    console.log("该钱包不包含助记词");
  }
  const mnemonic = ethersWallet.mnemonic.phrase;

  //账户恢复
  /*
  const accountFromPrivateKey = web3.eth.accounts.privateKeyToAccount(
    'privateKey'
  );
  */

  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  console.log("地址:", wallet.address);
  console.log("私钥:", wallet.privateKey);

  //至于读取balance，ethers就需要借助provider了
  const address = "0xfb0bc05F1aC61a566E70890e0e000E66F147ae66";
  web3.eth
    .getBalance(address)
    .then((balance) => {
      //讲wei转化为eth
      console.log("Balance:", web3.utils.fromWei(balance, "ether"), "ETH");
    })
    .catch((err) => {
      console.error(err);
    });

  // 使用ethers查询余额，主要是借助alchemy,容易exceed request rate
  const provider = ethers.getDefaultProvider(); // 获取默认的provider
  const balance = await provider.getBalance(address); // 查询指定地址的余额
  console.log("使用ethers查询的余额:", ethers.formatEther(balance), "ETH"); // 将wei转换为ETH
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
