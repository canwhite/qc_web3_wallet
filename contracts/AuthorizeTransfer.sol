// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;
contract AuthorizeTransfer {
    address public A;
    address public B;
    address public C;

    //record
    mapping(address => bool) public authorized;

    //event

    event Authorized(address indexed by, bool status);
    event TransferToC(address indexed from, uint256 amount,string info);

    constructor(address _C){
        A = msg.sender; // 部署合约的人默认是A
        C = _C; // 传入C的地址
    }

    //B设置，单独调用
    function setB(address _B) external {
        require(msg.sender == A, "Only A can set B");
         B = _B;
    }

    //A或B转账授权
    function authorize() external{
        require(msg.sender == A || msg.sender == B ,"Only A or B can authorize");
        //做好记录
        authorized[msg.sender] = true;
        emit Authorized(msg.sender, true);
    }

    //取消授权
    function revokeAuthorization() external{
        require(msg.sender == A || msg.sender == B, "Only A or B can revoke authorization");
        authorized[msg.sender] = false;
        emit Authorized(msg.sender, false);
    }

    //A或者B向C转账，需要双方都授权
    function transferToC(uint256 amount) external{
        require(authorized[A] && authorized[B], "Both A and B must authorize the transfer");
        // 重置授权状态
        authorized[A] = false;
        authorized[B] = false;

        // 转账给C
        emit TransferToC(msg.sender, amount,"DeeLMind");
    }


    // 接收以太币
    receive() external payable {
        // 记录接收的以太币金额和发送者
        // emit TransferToC(msg.sender, msg.value, "Received Ether");
    }


    function getBalance() external view  returns (uint256) {
        // 在Solidity中，address类型可以直接映射到Ethers.js中的Account对象
        // 因为Ethers.js的Account对象本质上就是一个包含地址和私钥的包装
        // 在Solidity中，address类型表示一个20字节的以太坊地址
        // 在Ethers.js中，可以通过new ethers.Wallet(privateKey)来创建Account对象
        // 然后通过account.address获取对应的地址
        // 因此，Solidity中的address可以直接对应到Ethers.js中的Account.address
        return address(this).balance;
    }







    



}