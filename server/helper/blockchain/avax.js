import axios from "axios";
import configRes from "./config/config.json";
const bip39 = require("bip39");
const ethers = require("ethers");
const EthereumTx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common");
const Web3 = require("web3");

const avaxconfig = configRes.AVAX
const RPCURL = avaxconfig.rpc;
const mnemonic = avaxconfig.mnemonic;
const networkId = avaxconfig.networkId;
const chainId = avaxconfig.chainId;


const web3 = new Web3(new Web3.providers.HttpProvider(RPCURL));
module.exports = {

    async generateAddress(count) {
        const countValue = count ? count : 0;
        let path = `m/44'/60'/0'/0/${countValue}`;
        let secondMnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);
        let address = secondMnemonicWallet.address;
        let publicKey = secondMnemonicWallet.publicKey;
        let privateKey = secondMnemonicWallet.privateKey;
        const obj = {
            address: address,
            publicKey: publicKey,
            privateKey: privateKey.substring(2),
        };
        console.log("Avax", obj);
        return obj

    },

    async getBalance(address) {
        const bal = await web3.eth.getBalance(address);
        let balance = web3.utils.fromWei(bal);
        console.log("=====balance in avax====",balance)
        return Number(balance);

    },


    async withdraw(senderAddress, privateKey, recieverAddress, amountToSend) {

        try {
            var nonce = await web3.eth.getTransactionCount(senderAddress);
            const { gasPrice } = await ethHelper();

            const { status } = await preTransfer(senderAddress, amountToSend);
            if (status == false) {
                console.log({ status: status, message: "Low Balance" });
            }

            let txObject = {
                to: recieverAddress,
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
                    name: "avax",
                    networkId: "0xA869",  // testnet
                    // networkId: "0xA86A", // mainet
                    chainId: "0xA869",  // testnet
                    // chainId: "0xA86A", // mainet

                },
                "petersburg"
            );
            const transaction = new EthereumTx(txObject, { common: common });
            let pvtKey = privateKey;
            if (pvtKey.startsWith('0x')) {
                pvtKey = pvtKey.slice(2);
            }
            let privKey = Buffer.from(pvtKey, "hex");
            transaction.sign(privKey);
            const serializedTransaction = transaction.serialize();
            const raw = "0x" + Buffer.from(serializedTransaction).toString("hex");
            const signTransaction = await web3.eth.sendSignedTransaction(raw);
            console.log("signTransaction", signTransaction)
            return signTransaction;
        } catch (error) {
            console.log("avax error ===>>>", error);
        }
    },


    async transfer(senderAddress, privateKey, recieverAddress) {

        try {
            var nonce = await web3.eth.getTransactionCount(senderAddress);
            const { fee, gasPrice } = await ethHelper();
            let balance = await getAvaxBalance1(senderAddress) - fee;
            console.log('Transfer total balance =200=>', balance)
            const { status } = await preTransfer(senderAddress, balance);
            if (status == false) {
                console.log({ status: status, message: "Low Balance" });
            }

            let txObject = {
                to: recieverAddress,
                value: web3.utils.toHex(
                    web3.utils.toWei(balance.toString(), "ether")
                ),
                gas: 21000,
                gasPrice: gasPrice,
                nonce: nonce,
            };
            const common = Common.default.forCustomChain(
                "mainnet",
                {
                    name: "avax",
                    networkId: networkId, 
                    chainId: chainId 
                },
                "petersburg"
            );
            const transaction = new EthereumTx(txObject, { common: common });
            let pvtKey = privateKey;
            if (pvtKey.startsWith('0x')) {
                pvtKey = pvtKey.slice(2);
            }
            let privKey = Buffer.from(pvtKey, "hex");
            transaction.sign(privKey);
            const serializedTransaction = transaction.serialize();
            const raw = "0x" + Buffer.from(serializedTransaction).toString("hex");
            const signTransaction = await web3.eth.sendSignedTransaction(raw);
            return { status: 200, responseMessage: "Transfer Successful.", responseResult: signTransaction };

        } catch (error) {
            console.log("avax error ===>>>", error);
        }
    }


}


const getAvaxBalance1 = async (address) => {
    try {
      const bal = await web3.eth.getBalance(address);
      let balance = web3.utils.fromWei(bal);
      return Number(balance);
    } catch (error) {
      console.log({
        Status: "Avax",
        Message: `Internal Server Error`,
        Error: `${error}`,
      });
      return "error";
    }
  }


const preTransfer = async (senderAddress, amountToSend) => {
    const { fee } = await ethHelper();
    let balance = await getAvaxBalance1(senderAddress);

    if (balance - amountToSend - fee < 0) {
        console.log("insufficient funds", balance);
        return "Low Balance";
    } else {
        return "Transfer Possible";
    }
}

const ethHelper = async () => {
    let currentGasPrice = await getCurrentGasPrices();

    let gasPrice = currentGasPrice.high * 10000000000;

    let gasLimit = 21000;
    let fee = gasLimit * gasPrice;

    let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));
    let obj = { fee: txFee, gasPrice: gasPrice }
    console.log(obj)
    return obj;
}

const getCurrentGasPrices = async () => {
    let response = await axios.get(avaxconfig.gasPrice);
    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10,
    };
    console.log(prices)
    return prices;
}




//*************************************************************************************** */
const getContractAddress = async (tokenType) => {
    return tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
            tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
                tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}



