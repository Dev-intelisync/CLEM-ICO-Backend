import axios from "axios";
import configRes from "./config/config.json";
const MATIC_URL = configRes.MATIC.rpc; // testnet
const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common');
const { hdkey } = require('ethereumjs-wallet');
import contractABI from "./config/erc20ABI.json";
import coinType, { XRP } from '../../enums/coinType';



var web3 = new Web3(new Web3.providers.HttpProvider(MATIC_URL));


const getBalanceBaseURL = configRes.MATIC.getBalance;
const apiKey = configRes.MATIC.apiKey;
const gasPriceURL = configRes.MATIC.gasPrice;
const networkId = configRes.MATIC.networkId;
const chainId = configRes.MATIC.chainId;



module.exports = {

    async generateAddress(count) {
        let hdwallet = hdkey.fromMasterSeed(configRes.MATIC.mnemonic);

        let path = `m/44'/60'/0'/0/${count}`;
        let wallet = hdwallet.derivePath(path).getWallet();
        let address = "0x" + wallet.getAddress().toString("hex");
        let privateKey = wallet.getPrivateKey().toString("hex");
        return { address: address, privateKey: privateKey };

    },

    async getBalance(address) {
        const response = await axios.get(`${getBalanceBaseURL}${address}${apiKey}`);
        let balance = web3.utils.fromWei(response.data.result, "ether");
        console.log("balance==>", balance)
        return Number(balance);
    },


    async withdraw(senderAddress, privateKey, recieverAddress, amountToSend) {
        try {
            var nonce = await web3.eth.getTransactionCount(senderAddress);
            const { gasPrice } = await EthHelper();
            console.log("gas fee SUBHRA...PRINCE", gasPrice)
            console.log("==SUBHRA====PRInve", amountToSend, "for toString----", amountToSend.toString())
            const { status } = await preMaticTransfer(senderAddress, amountToSend);
            if (status == false) {
                return { status: status, message: "Low Balance" };
            }
            let txObject = {
                to: recieverAddress,
                value: web3.utils.toHex(
                    web3.utils.toWei(amountToSend.toString(), "ether")
                ),
                gas: 21000,
                gasPrice: gasPrice * 2,
                nonce: nonce,
            };
            const common = Common.default.forCustomChain(
                "mainnet",
                {
                    name: 'matic',
                    networkId: configRes.MATIC.networkId,
                    chainId: configRes.MATIC.chainId,
                },
                "petersburg"
            );
            const transaction = new EthereumTx(txObject, { common: common });
            console.log("==transaction ==>>>>>>>>>>", transaction)
            let pvtKey = privateKey;

            if (pvtKey.startsWith('0x')) {
                pvtKey = pvtKey.slice(2);
            }
            let privKey = Buffer.from(pvtKey, "hex");
            transaction.sign(privKey);
            const serializedTransaction = transaction.serialize();
            console.log("==serializedTransaction===>", serializedTransaction)
            const raw = "0x" + Buffer.from(serializedTransaction).toString("hex");
            const signTransaction = await web3.eth.sendSignedTransaction(raw);
            console.log("===signTransaction==>>", signTransaction)
            return {
                status: 200,
                responseMessage: "Success",
                responseResult: { Hash: signTransaction }
            };
        } catch (error) {
            console.log("error===in matic=>>", error);
        }



    },

    async transfer(senderAddress, privateKey, recieverAddress) {
        try {
            var nonce = await web3.eth.getTransactionCount(senderAddress);
            const { fee, gasPrice } = await EthHelper()
            let balance = await accountBalance(senderAddress)
            let amountToSend = balance - fee * 2 // I.M- it will change when it goes on client server comment by puneet
                ;
            if (amountToSend > 0) {
                let txObject = {
                    "to": recieverAddress,
                    "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
                    "gas": 21000,
                    "gasPrice": gasPrice * 2, // I.M- it will change when it goes on client server comment by puneet
                    "nonce": nonce,
                };
                const common = Common.default.forCustomChain(
                    'mainnet', {
                    name: 'matic',
                    networkId: configRes.MATIC.networkId, //testnet
                    chainId: configRes.MATIC.chainId, //testnet
                    // networkId: chainId, // mainnet
                    // chainId: '0x89', // mainnet
                },
                    "petersburg",
                );
                let transaction = new EthereumTx(txObject, { common: common });
                let privKey = Buffer.from(privateKey, 'hex');
                transaction.sign(privKey);
                let serializedTransaction = transaction.serialize();
                serializedTransaction = "0x" + Buffer.from(serializedTransaction).toString("hex");
                console.log("serializedTransaction==>", serializedTransaction)
                const signTransaction = await web3.eth.sendSignedTransaction(serializedTransaction);
                console.log("sign transaction=====>>", signTransaction);
                return { status: 200, responseMessage: "Success", responseResult: { Hash: signTransaction } };
            } else {
                return { status: false, message: 'Transfer not Possible because insufficient balance for gas fee' };
            }
        } catch (error) {
            console.log("error line 140====>>", error);
        }
    },

    async withdrawToken(privateKey, recieverAddress, amountToSend, tokenType) {
        try {
            const userAddress = web3.eth.accounts.privateKeyToAccount(privateKey);
            console.log("userAddress SUBHRA RAI IS IN WIPRO",userAddress.address)
            var nonce = await web3.eth.getTransactionCount(userAddress.address);
            console.log("SUBHPUNEETTT+++ nonce====",nonce)
            const contract = await getContractAddress(tokenType);
            const { fee, gasPrice } = await EthHelper()
            console.log("SUBHRA RAI IN MOBILOITTE++", gasPrice)
            const myContract = new web3.eth.Contract(contractABI, contract);
            const balance = web3.utils.toWei(amountToSend.toString());
            console.log("SUBHRA ARAI IN MOBILOITTE BALANCEBDBBDBD ", balance)
            const Data = await myContract.methods.transfer(recieverAddress, balance.toString()).encodeABI();

            const rawTransaction = {
                // from: "0x7c26779C03459BFc46149F27B3e216C612831008",
                to: contract,
                gasPrice: gasPrice*3, // Always in Wei (30 gwei)
                gas: 200000, // Always in Wei   i.e token transfer this transaction object
                // gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
                // gasLimit: web3.utils.toHex('80000'), // Always in Wei
                data: Data, // Setting the pid 12 with 0 alloc and 0 deposit fee
                value: 0,
                // nonce: nonce,
            
            };
            const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
            console.log("signPromise== subhra>> 13 Dec", signPromise);
            let data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
            console.log("152 data===>", data);
            return data
        } catch (error) {
            console.log('93 error==>', error)
        }

    },

}

const preMaticTransfer = async (senderAddress, amountToSend) => {
    const { fee } = await EthHelper();
    let balance = await accountBalance(senderAddress);
    if (balance - amountToSend - fee < 0) {
        return { status: false, message: "Low Balance" };
    } else {
        return { status: true, message: "Transfer Possible" };
    }
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
    const response = await axios.get(`${getBalanceBaseURL}${senderAddress}${apiKey}`);
    console.log(response.data.result);
    let balance = web3.utils.fromWei(response.data.result, "ether");
    return Number(balance);
}

const getCurrentGasPrices = async () => {
    let response = await axios.get(`${gasPriceURL}`);
    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10
    };
    return prices;
}

const getContractAddress = async (tokenType) => {
    return tokenType === coinType.VD ? configRes.MATIC.contractAddress.VD :
        tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
            tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
                tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}