//Hierarchical Deterministic Wallet
//hierarchical adj 分等级的 => hier神圣的 arch 统治者 ical
//deterministic determine => de向下 term边界
console.log("分层确定性钱包");
console.log("通常通过一个根种子(助记词)生成一系列的公钥和私钥");
console.log(
  "feature:可以通过单一的种子生成整个密钥对层次结构，且所有的密钥都可以被轻松恢复。"
);
console.log("分层结构，用户可以轻松管理多个账户和地址");
console.log(
  `
structure:
m / purpose' / coin_type' / account' / change / address_index
------
purpose：表示使用的规范，如 BIP44 为 44'。
--BIP（Bitcoin Improvement Proposal，比特币改进提案）
--BIP32：HD（Hierarchical Deterministic）钱包的标准，用于定义分层确定性钱包的生成方式。
--BIP39：助记词标准，用于生成钱包的助记词，并通过助记词恢复私钥。
--BIP44：用于描述 HD 钱包的路径标准，用于确定不同加密货币和账户的密钥推导路径。

coin_type：代表加密货币的类型（
--例如，
--比特币是 0'，
--以太坊是 60'， 
--Solana 501
--
--）。
account：账户编号。change：0 表示外部地址（接收地址），1 表示内部地址（找零地址）。
address_index：实际生成的地址索引。
------
e.g.
m/44'/0'/0'/0/0
`
);

// 导入ethers库
import { ethers } from "ethers";

// 1) 生成助记词
//mnemon 记忆，前边的m不发音，ic adj助记的，n 助记词
const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
console.log("助记词:", mnemonic);

// 2) 从助记词创建HD钱包
const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
console.log("HD节点:", hdNode);

// 3) 根据BIP44路径生成子钱包
// m/44'/60'/0'/0/0
const path = "44'/60'/0'/0/0"; // 去掉 m/ 前缀
const childWallet = hdNode.derivePath(path);
console.log("子钱包地址:", childWallet.address);
console.log("子钱包私钥:", childWallet.privateKey);

// 4) 生成多个地址
for (let i = 0; i < 3; i++) {
  const wallet = hdNode.derivePath(`44'/60'/0'/0/${i}`);
  console.log(`地址${i}:`, wallet.address);
}
