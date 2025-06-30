const solanaWeb3 = require("@solana/web3.js");
const bip39 = require("bip39");
const { derivePath } = require("ed25519-hd-key");

//---------1）密钥对儿和助记词生成--------------
//生成新的密钥对儿
const keypair = solanaWeb3.Keypair.generate();

console.log("公钥:", keypair.publicKey.toBase58());
console.log("私钥:", keypair.secretKey);

//生成助记词
const mnemonic = bip39.generateMnemonic();
console.log("助记词:", mnemonic);

// 从助记词生成种子
const seed = bip39.mnemonicToSeedSync(mnemonic);

//派生
const path = "m/44'/501'/0'/0'";
// derivePath 的作用是从种子和路径派生出子密钥
// 具体功能包括：
// 1. 根据BIP44路径规范从主种子派生出子密钥
// 2. 使用ed25519曲线进行密钥派生
// 3. 确保派生过程是确定性的，即相同的种子和路径总是生成相同的密钥
// 4. 支持分层确定性钱包（HD Wallet）的密钥派生
// 5. 路径格式：m/purpose'/coin_type'/account'/change/address_index
// 6. 在Solana中，通常使用路径 m/44'/501'/0'/0' 来派生主账户
const { key } = derivePath(path, seed.toString("hex"));

//根据派生的seed生成密钥对儿
const new_keypair = solanaWeb3.Keypair.fromSeed(key);

console.log("公钥:", new_keypair.publicKey.toBase58());
console.log("私钥:", new_keypair.secretKey);

//---------------2）私钥和助记词恢复--------------------
//私钥恢复：
// 假设你有一个现有的私钥
const secretKey = Uint8Array.from([
  65, 86, 171, 59, 137, 44, 233, 114, 136, 154, 240, 5, 135, 32, 11, 89, 202,
  114, 102, 11, 152, 15, 224, 164, 91, 149, 252, 5, 180, 159, 198, 242, 165,
  136, 90, 8, 18, 108, 65, 211, 216, 76, 87, 117, 155, 64, 64, 77, 170, 132,
  247, 67, 57, 73, 89, 51, 118, 145, 3, 186, 160, 124, 82, 54,
]);

//根据私钥还原keypair
const rkeypair = solanaWeb3.Keypair.fromSecretKey(secretKey);

console.log("公钥:", rkeypair.publicKey.toBase58());
console.log("私钥:", rkeypair.secretKey);

//助记词恢复
/** 
const rmnemonic =
  "chunk view deal hen horse visual cook below dish recall awesome upgrade";

// 从助记词生成种子
const seed = bip39.mnemonicToSeedSync(rmnemonic);
// 使用 Solana 的派生路径 m/44'/501'/0'/0'
const path = "m/44'/501'/0'/0'";
const { key } = derivePath(path, seed.toString("hex"));

// 通过种子还原密钥对
const keypair = solanaWeb3.Keypair.fromSeed(key);

console.log("还原的公钥:", keypair.publicKey.toBase58());
console.log("还原的私钥:", keypair.secretKey);
*/

//-----------------3)交易信息------------------
//1）获取资金

// 连接到 Solana 的主网
// 使用可靠的 RPC 节点 (示例使用公共节点)
const connection = new solanaWeb3.Connection(
  "https://api.mainnet-beta.solana.com",
  {
    commitment: "confirmed",
    disableRetryOnRateLimit: false,
    confirmTransactionInitialTimeout: 60000,
  }
);

// 使用示例钱包地址
const publicKey = new solanaWeb3.PublicKey(
  "9wH4KrvfVSubh2wA4Zdx6rHUMeDzfwQ1Qx4MoD1TK3pY" // 示例地址
);

// 查询账户余额并添加错误处理
async function checkBalance() {
  try {
    const balance = await connection.getBalance(publicKey);
    console.log("余额:", balance / solanaWeb3.LAMPORTS_PER_SOL, "SOL");
  } catch (error) {
    console.error("获取余额失败:", error);
    // 可以尝试备用节点
    const backupConnection = new solanaWeb3.Connection(
      "https://solana-api.projectserum.com",
      "confirmed"
    );
    try {
      const balance = await backupConnection.getBalance(publicKey);
      console.log(
        "使用备用节点获取余额:",
        balance / solanaWeb3.LAMPORTS_PER_SOL,
        "SOL"
      );
    } catch (backupError) {
      console.error("备用节点也失败:", backupError);
    }
  }
}

// checkBalance();

//2）发送交易
const tryTransaction = () => {
  //建立连接
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("mainnet-beta"),
    "confirmed"
  );

  // 从密钥创建一个 Keypair（假设你已有私钥）
  const secretKey = Uint8Array.from([
    154, 35, 110, 47, 158, 126, 70, 105, 3, 100, 41, 146, 66, 47, 35, 193, 147,
    138, 234, 165, 233, 10, 43, 134, 136, 58, 0, 246, 141, 168, 61, 74, 234, 36,
    236, 140, 191, 121, 202, 247, 68, 36, 214, 26, 217, 250, 231, 148, 185, 65,
    213, 101, 232, 110, 123, 252, 151, 34, 118, 229, 183, 31, 80, 95,
  ]);
  const senderKeypair = solanaWeb3.Keypair.fromSecretKey(secretKey);

  // 接收者公钥（将 SOL 发送到的地址）
  const recipientPublicKey = new solanaWeb3.PublicKey(
    "Gm14JyqRqPqMr8go2myLbvB4nSX4y3toqmv1kpJCR1A6"
  );

  // 创建一笔交易
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: recipientPublicKey,
      lamports: 1000000, // 发送的金额，单位是 lamports，1 SOL = 1,000,000,000 lamports
    })
  );

  //创建之后签署并发送交易
  // 签署并发送交易
  (async () => {
    try {
      const signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [senderKeypair]
      );
      console.log("交易成功，签名:", signature);
    } catch (err) {
      console.error("交易失败:", err);
    }
  })();
};
