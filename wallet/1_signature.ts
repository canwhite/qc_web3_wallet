import { ethers } from "hardhat";
import { Web3 } from "web3";
const web3 = new Web3();

const web3Test = () => {
  //1）创建账户
  const account = web3.eth.accounts.create();
  console.log(account);
  /*
  {
      address: '0x5b25cA84372Ca609F6b82A0E23Ba3062Aa67DEBf',
      privateKey: '0x01af8a9388715a72a10399323cec527bac390f8ca49f95d66603e753fbf69904',
      signTransaction: [Function: signTransaction],
      sign: [Function: sign], //this method is sign function
      encrypt: [Function: encrypt]
  }
  */

  const privateKey = account.privateKey;

  //2）通过私钥生成一个账户对象
  const accountFromPrivateKey =
    web3.eth.accounts.privateKeyToAccount(privateKey);

  console.log("Address from Private Key:", accountFromPrivateKey.address);
  //Address from Private Key: 0x07F5b6CE946805eF625Ce9E9b33bdCcB54D229Ed

  //3）给消息signature
  const data = "Hello, Web3.js!";
  const signature = account.sign(data);
  console.log("sign:", signature);
  //hash是固定长度产出的，而且结果稳定
  /*
  sign: {
    message: 'hello web3',
    messageHash: '0xe3e360a2dfdc192aab166c39d3a71be74e5c4dd62e634696bd60abc215aae8c8',
    v: '0x1b',
    r: '0x61bc90bc60ba8eef211cb8dca657dec7c11e7a9d9b0e321d44f8ec61762eecb1',
    s: '0x697e4b8746fa4762549e2459fdeb91345278b7a43814d5e4b3ee298f9ed2e70b',
    signature: '0x61bc90bc60ba8eef211cb8dca657dec7c11e7a9d9b0e321d44f8ec61762eecb1697e4b8746fa4762549e2459fdeb91345278b7a43814d5e4b3ee298f9ed2e70b1b'
  }
  */

  //4）从签名中恢复签名者的地址
  //椭圆曲线数字签名算法
  const sigObj = web3.eth.accounts.sign(data, privateKey);
  console.log(sigObj);
  /*
  {
    message: 'Hello, Web3.js!',
    messageHash: '0xc0f5f7ee704f1473acbb7959f5f925d787a9aa76dccc1b4914cbe77c09fd68d5',
    v: '0x1c',
    r: '0x373bc49982717fc6bb4fc472354bac250e79240a6cdf531332f36efed404c3b8',
    s: '0x3c006be0d59ad630e85b324689c106c57177c4435dea0b99b2e93e59ab0a0220',
    signature: '0x373bc49982717fc6bb4fc472354bac250e79240a6cdf531332f36efed404c3b83c006be0d59ad630e85b324689c106c57177c4435dea0b99b2e93e59ab0a02201c'
  }
  */
  const r = web3.eth.accounts.recover(data, sigObj.v, sigObj.r, sigObj.s);
  console.log(r);
  //account: 0x03ABfF9e9572eAaA56BB8F8208Bf29C472153129
};

// 需要加await的方法：
// 1. ethersWallet.signMessage(data) - 因为这是一个异步操作，需要等待签名完成
// 2. ethers.verifyMessage(data, ethersSignature) - 虽然这个方法本身是同步的，但通常建议在异步函数中使用await来保持代码一致性

// 不需要加await的方法：
// 1. ethers.Wallet.createRandom() - 这是一个同步操作
// 2. new ethers.Wallet(privateKey) - 这也是一个同步操作
// 3. console.log() - 所有日志输出都是同步的

const ethersTest = async () => {
  // 私钥的生成过程：
  // 1. 使用加密安全的随机数生成器生成256位随机数
  // 2. 这个随机数就是私钥，通常表示为64个十六进制字符
  // 3. 私钥必须满足椭圆曲线加密算法的要求（在secp256k1曲线上有效）
  // 4. 私钥需要严格保密，因为拥有私钥就等于拥有对应地址的控制权

  const data = "hello world";

  // 使用ethers生成私钥
  const ethersWallet = ethers.Wallet.createRandom();
  const privateKey = ethersWallet.privateKey;
  console.log("Ethers Generated Private Key:", privateKey);

  // 1) 使用私钥创建钱包
  const ethersWalletByPrivateKey = new ethers.Wallet(privateKey);
  console.log("Ethers Wallet Address:", ethersWalletByPrivateKey.address);

  // 2) 使用ethers对消息进行签名
  const ethersSignature = await ethersWallet.signMessage(data);
  console.log("Ethers Signature:", ethersSignature);

  // 3) 使用ethers从签名中恢复地址
  const recoveredAddress = await ethers.verifyMessage(data, ethersSignature);
  console.log("Recovered Address:", recoveredAddress);

  /*
  输出示例：
  Ethers Wallet Address: 0x03ABfF9e9572eAaA56BB8F8208Bf29C472153129
  Ethers Signature: 0x373bc49982717fc6bb4fc472354bac250e79240a6cdf531332f36efed404c3b83c006be0d59ad630e85b324689c106c57177c4435dea0b99b2e93e59ab0a02201c
  Recovered Address: 0x03ABfF9e9572eAaA56BB8F8208Bf29C472153129
  */
};

ethersTest();
