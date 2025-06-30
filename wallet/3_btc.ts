// 这是一个比特币钱包生成和操作的示例代码
// 使用了以下库：
// 1. bip39 - 用于生成和操作BIP39助记词
// 2. bitcoinjs-lib - 用于处理比特币相关操作的核心库
// 3. tiny-secp256k1 - 用于椭圆曲线加密的轻量级实现
// 4. bip32 - 用于实现BIP32分层确定性钱包
// 这些库共同用于生成比特币地址、管理私钥和进行交易签名等操作
const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");
const ecc = require("tiny-secp256k1");
const { BIP32Factory } = require("bip32");

//---------1）创建address和通过助记词恢复----------------
//generate mnemonic
//当然你也可以假设这里是一个确切的助记册，你可以用它恢复
const mnemonic = bip39.generateMnemonic();
console.log(mnemonic);
//note tornado balcony setup garage cross width pen cabbage steel wisdom vacant

//generate seed by mnemonic
// 使用bip39库将助记词转换为种子
// 种子是一个确定性的二进制数据，用于生成HD钱包的根密钥
// 这个过程是同步的，使用mnemonicToSeedSync方法
// 种子是生成所有比特币地址和私钥的基础
const seed = bip39.mnemonicToSeedSync(mnemonic);
console.log("种子:", seed);

//end ： 助记词 => 稳定种子， use to generate address and private key
const isValid = bip39.validateMnemonic(mnemonic);
console.log("助记词是否有效:", isValid);

// 创建 bip32 实例
const bip32 = BIP32Factory(ecc);

// 使用种子生成bip32根私钥
// 使用种子生成 BIP32 根私钥
const root = bip32.fromSeed(seed);
console.log("助记词:", mnemonic);
// WIF 是 Wallet Import Format 的缩写，即钱包导入格式
// 它是一种用于表示比特币私钥的编码格式
// WIF 格式的特点：
// 1. 以5开头（主网）或9开头（测试网）
// 2. 使用Base58Check编码
// 3. 包含版本号和校验和
// 4. 比原始私钥更易读且包含错误检测
// WIF 格式常用于：
// 1. 在不同钱包之间导入/导出私钥
// 2. 备份私钥
// 3. 以人类可读的形式存储私钥
console.log("根私钥 (WIF):", root.toWIF());
console.log("根公钥:", root.publicKey.toString("hex"));
const rootPublicKey = root.publicKey;

//根共邀对应的比特币地址
// 为什么使用根公钥生成地址：
// 1. 根公钥是HD钱包的起点，从它可以派生出所有子密钥
// 2. 使用根公钥生成地址可以确保地址与整个HD钱包体系一致
// 3. 根公钥对应的地址可以作为主接收地址，方便管理
// 4. 从根公钥派生的地址具有确定性，可以通过助记词恢复

// P2PKH 解释：
// P2PKH 是 Pay-to-Public-Key-Hash 的缩写，即支付到公钥哈希
// 这是比特币最常用的交易脚本类型，特点如下：
// 1. 使用公钥的哈希值（而不是直接使用公钥）作为地址
// 2. 提供更好的隐私保护，因为公钥在交易前不会暴露
// 3. 交易验证时需要提供签名和完整的公钥
// 4. 地址格式通常以1开头（主网）或m/n开头（测试网）
// 5. 交易脚本结构：OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG

const { address: rootAddress } = bitcoin.payments.p2pkh({
  pubkey: Buffer.from(rootPublicKey, "hex"),
});
console.log("根公钥对应的比特币地址:", rootAddress);

//派生
//m / purpose' / coin_type' / account' / change / address_index
const child = root.derivePath("m/44'/0'/0'/0/0");
console.log("子私钥 (WIF):", child.toWIF());
console.log("子公钥:", child.publicKey.toString("hex"));

const { address } = bitcoin.payments.p2pkh({
  pubkey: Buffer.from(child.publicKey, "hex"),
});

console.log("子公钥比特币地址:", address);

//--------------2）交易信息----------------
//获取资金信息 - 查询资金信息
const axios = require("axios");

const btcAddress = "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo"; // 替换为你要查询的比特币地址
axios
  .get(`https://blockchain.info/rawaddr/${btcAddress}`)
  .then((response) => {
    // console.log(response.data); //包含每个块儿信息
    const finalBalance = response.data.final_balance; // 余额是以 satoshis 为单位
    console.log(
      `地址: ${btcAddress} 的余额为: ${finalBalance / 100000000} BTC`
    );
  })
  .catch((error) => {
    console.error("获取余额时发生错误:", error);
  });

// 发送交易
const createTransaction = async () => {
  try {
    // 构建交易对象
    const txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet); // 使用测试网

    // 添加输入（未花费的交易输出UTXO）
    const utxo = {
      txId: "previous_tx_id", // 前一笔交易的ID
      vout: 0, // 输出索引
      scriptPubKey: "76a914...", // 锁定脚本
      amount: 100000, // 金额（单位：satoshi）
    };
    txb.addInput(utxo.txId, utxo.vout);

    // 添加输出
    const recipientAddress = "recipient_address"; // 接收方地址
    const amountToSend = 50000; // 发送金额（单位：satoshi）
    txb.addOutput(recipientAddress, amountToSend);

    // 计算找零
    const changeAmount = utxo.amount - amountToSend - 1000; // 减去手续费
    const changeAddress = "change_address"; // 找零地址
    txb.addOutput(changeAddress, changeAmount);

    // 使用私钥签名交易
    const privateKey = child.toWIF(); // 使用派生出的子私钥
    txb.sign(0, privateKey);

    // 构建并获取原始交易数据
    const tx = txb.build();
    const rawTx = tx.toHex();

    // 广播交易
    const broadcastResponse = await axios.post(
      "https://blockstream.info/testnet/api/tx",
      rawTx
    );
    console.log("交易已广播，交易ID:", broadcastResponse.data);
  } catch (error) {
    console.error("创建或发送交易时出错:", error);
  }
};
