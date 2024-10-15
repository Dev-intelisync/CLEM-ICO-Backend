import axios from "axios";
import configRes from "./config/config.json";
var bip39 = require('bip39');

import Web3 from "web3"
const EthereumTx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common");
const { hdkey } = require('ethereumjs-wallet');

const BNB_URL = configRes.BNB;
const mnemonic = configRes.BNB.mnemonic;
const chainId = configRes.BNB.chainId;
const networkId = configRes.BNB.networkId;

var web3 = new Web3(new Web3.providers.HttpProvider(BNB_URL.rpc));


module.exports = {

  async generateAddress(count) {
    const seed = bip39.mnemonicToSeedSync(mnemonic)

    let hdwallet = hdkey.fromMasterSeed(seed);
    let countvalue = count ? count : 0;
    let path = `m/44'/60'/0'/0/${countvalue}`;

    let wallet = hdwallet.derivePath(path).getWallet();
    let address = "0x" + wallet.getAddress().toString("hex");
    let privateKey = wallet.getPrivateKey().toString("hex");
    let obj = {
      address: address,
      privateKey: privateKey
    }
    return obj

  },


  async getBalance(address) {
    try {
      const response = await web3.eth.getBalance(address);
      let balance = web3.utils.fromWei(response, "ether")
      console.log("balance=====in bnb-=====>", balance)
      return Number(balance)
    } catch (error) {
      console.log("error balanace ===>", error);
    }

  },


  async withdraw(fromAddress, fromPrivateKey, toAddress, amountToSend) {
    var nonce = await web3.eth.getTransactionCount(fromAddress);
    const { gasPrice } = await EthHelper();

    const { status } = await preTransfer(fromAddress, amountToSend);
    if (status == false) {
      console.log("Low Balance");
      return "Low Balance"
    }

    let txObject = {
      to: toAddress,
      value: web3.utils.toHex(
        web3.utils.toWei(amountToSend.toString(), "ether")
      ),
      gas: 21000,
      gasPrice: gasPrice,
      nonce: nonce,
    };
    const common = Common.default.forCustomChain(
      "mainnet",
      {
        name: 'bnb',
        networkId: chainId,
        chainId: networkId

      },
      "petersburg"
    );
    const transaction = new EthereumTx(txObject, { common: common });
    let privKey = Buffer.from(fromPrivateKey, "hex");
    transaction.sign(privKey);
    const serializedTransaction = transaction.serialize();
    const raw = "0x" + Buffer.from(serializedTransaction).toString("hex");
    const signTransaction = await web3.eth.sendSignedTransaction(raw);
    console.log({
      Hash: signTransaction.transactionHash,
    });
    return { Hash: signTransaction.transactionHash }

  },

  async transfer(fromAddress, fromPrivateKey, toAddress) {
    var nonce = await web3.eth.getTransactionCount(fromAddress);

    const { fee, gasPrice } = await EthHelper()

    let balance = await accountBalance(fromAddress)
    console.log("===balance in bnb function===>>",balance)

    let amountToSend = balance - fee;

    if (amountToSend > 0) {
      let txObject = {
        "to": toAddress,
        "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
        "gas": 21000,
        "gasPrice": gasPrice,
        "nonce": nonce,

      };

      const common = Common.default.forCustomChain(
        'mainnet', {
        name: 'bnb',
        networkId: networkId,
        chainId: chainId

      },
        "petersburg",
      );


      const transaction = new EthereumTx(txObject, { common: common });

      let privKey = Buffer.from(fromPrivateKey, 'hex');

      transaction.sign(privKey);

      const serializedTransaction = transaction.serialize();
      const signTransaction = await web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'))

      console.log(signTransaction.transactionHash);

      console.log({ status: 200, Status: "Success", Hash: signTransaction.transactionHash });
      return { status: 200, Status: "Transfer Successful", responseResult: signTransaction };
    }
  }



}



const getCurrentGasPrices = async () => {
  let response = await axios.get(BNB_URL.gasPrice);
  let prices = {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10
  };
  return prices;
}

const EthHelper = async () => {
  let currentGasPrice = await getCurrentGasPrices();

  let gasPrice = currentGasPrice.high * 1000000000
  let gasLimit = 21000;
  let fee = gasLimit * gasPrice;

  let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));


  return { fee: txFee, gasPrice: gasPrice }
}

const accountBalance = async (senderAddress) => {

  const response = await axios.get(`${BNB_URL.getBalance}${senderAddress}${BNB_URL.apiKey}`)

  console.log(response.data.result);
  let balance = web3.utils.fromWei(response.data.result, "ether");
  return Number(balance)



}

const preTransfer = async (senderAddress, amountToSend) => {

  const { fee } = await EthHelper()
  let balance = await accountBalance(senderAddress)

  if (balance - amountToSend - fee < 0) {
    console.log('insufficient funds', balance);
    return { status: false, message: 'Low Balance', balance: balance }
  } else {
    return { status: true, message: 'Transfer Possible' }

  }

}

const transferTokenUserToUser = async (senderAddress, privateKey, receiverAddress, coinTypeName) => {
  try {
      const contract = await getContractAddress(coinTypeName);
      const myContract = new web3.eth.Contract(contractABI, contract);
      var userBalance = await myContract.methods.balanceOf(senderAddress).call();
      const decimals = await myContract.methods.decimals().call()
      const token = ethers.utils.formatUnits(userBalance, decimals);
      if (token <= 0) {
          return { status: 401, responseMessage: 'Please provide token value must be greater then to 0.' };
      }
      let tranferETH = 0.01;
      let result1 = await transferAdminToUserForGasFee(AdminAddress, AdminPrivateKey, senderAddress, tranferETH);
      if (result1 && result1.Status == true) {
          let result2 = await tokenTransferUserToUser(receiverAddress, privateKey, token, contract)
          if (result2 && result2.status == 200) {
              let data = await remeningAmountTransferToAdmin(senderAddress, privateKey, AdminAddress)
              if (data) {
                  return { status: 200, responseMessage: 'Success', responseResult: data.responseResult };
              }
          }
      }

  } catch (error) {
      console.log(error)
      return { status: 501, responseMessage: "Something went wrong!", responseResult: error.message };
  }
}


const getContractAddress = async (tokenType) => {
  return tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
          tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
              tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}
