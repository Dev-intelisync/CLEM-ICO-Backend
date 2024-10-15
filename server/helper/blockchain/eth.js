import axios from "axios";
import configRes from "./config/config.json";
const bip39 = require('bip39');
const { hdkey } = require("ethereumjs-wallet");
const ethers = require('ethers');
import Web3 from 'web3';
import contractABI from "./config/erc20ABI.json";
import coinType from "../../enums/coinType";


const EthereumTx = require('ethereumjs-tx').Transaction

// const ethereumTx = require('ethereumtx')
const web3 = new Web3(new Web3.providers.HttpProvider(configRes.ETH.INFURA_URL));
const link = configRes.ETH.INFURA_URL;

const getCurrentGasPrices = async () => {
    try {
        let response = await axios.get(configRes.ETH.gasPrice);
        let prices = {
            low: response.data.safeLow / 10,
            medium: response.data.average / 10,
            high: response.data.fast / 10,
        };
        return prices;
    } catch (error) {
        console.log("Something went wrong!", error);
    }
}

const preETHTransfer = async (senderAddress, amountToSend) => {
    const { fee } = await ethHelper();
    let balance = await accountETHBalance(senderAddress);
    console.log("===balance=== for preETHTransfer", balance)
    if (balance - amountToSend - fee < 0) {
        return { status: false, message: "Low Balance" };
    } else {
        return { status: true, message: "Transfer Possible" };
    }
}

const ethHelper = async () => {
    let currentGasPrice = await getCurrentGasPrices();
    let gasPrice = currentGasPrice.high * 1000000000;
    let gasLimit = 21000;
    let fee = gasLimit * gasPrice;
    let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));
    return { fee: txFee, gasPrice: gasPrice };
}

const accountETHBalance = async (senderAddress) => {
    try {
        console.log("=====>>>>>>>>>>>req parameter")
        // const response = await axios.get(`${configRes.ETH.getBalance}${senderAddress}${configRes.ETH.apiKey}`);
        const response = await axios.get(`${configRes.ETH.getBalance}${senderAddress}${configRes.ETH.apiKey}`);
        console.log("Subhra===>>>responseresponseresponseresponseresponse======", response)
        let balance = web3.utils.fromWei(response.data.result, "ether");
        return Number(balance);
    } catch (error) {
        console.log("accountETHBalance error", error);
        return Number(0);
    }
}

async function generateAddress(count) {
    try {
        let seednew = bip39.mnemonicToSeedSync(configRes.ETH.mnemonic);
        let countvalue = count ? count : 0;
        let hdwallet = hdkey.fromMasterSeed(seednew);
        let path = `m/44'/60'/0'/0/${countvalue}`;
        let wallet = hdwallet.derivePath(path).getWallet();
        let address = "0x" + wallet.getAddress().toString("hex");
        let publicKey = "0x" + wallet.getPublicKey().toString("hex");
        let privateKey = wallet.getPrivateKey().toString("hex");
        let result = {
            address: address,
            publicKey: publicKey,
            privateKey: privateKey
        }
        return result
    } catch (error) {
        console.log('Error: ', error)
    }


}

async function getBalance(address) {
    try {
        let provider = new ethers.providers.JsonRpcProvider(configRes.ETH.INFURA_URL);
        let userBalance = await provider.getBalance(address);
        userBalance = ethers.utils.formatEther(userBalance)
        console.log("ETH balance: ", userBalance);
        return userBalance;
    } catch (error) {
        console.log('Error: ', error)
    }


}

async function withdraw(fromAddress, fromPrivateKey, toAddress, amountToSend) {
    try {
        var nonce = await web3.eth.getTransactionCount(fromAddress);
        const { gasPrice } = await ethHelper(fromAddress, amountToSend);
        const { status } = await preETHTransfer(fromAddress, amountToSend);
        if (status == false) {
            return "Low Balance."
        }
        let txObject = {
            to: toAddress,
            value: web3.utils.toHex(
                web3.utils.toWei(amountToSend.toString(), "ether")
            ),
            gasLimit: 21000,
            gasPrice: gasPrice,
            nonce: nonce,
            // "chainId": 3 // EIP 155 chainId - mainnet: 1, rinkeby: 4
        };
        const transaction = new EthereumTx(txObject, { chain: "goerli" });

        let privKey = Buffer.from(fromPrivateKey, "hex");
        transaction.sign(privKey);

        let serializedTransaction = transaction.serialize();
        serializedTransaction = `0x${serializedTransaction.toString("hex")}`;
        let data = await web3.eth.sendSignedTransaction(serializedTransaction);
        return data
    } catch (error) {
        console.log('Error: ', error)
    }
}

async function withdrawToken(privateKey, recieverAddress, amountToSend, tokenType) {
    try {

        console.log("=privateKey==>",privateKey)
        const contract = await getContractAddress(tokenType);
        console.log("contract==>>subh", contract);
        const { fee, gasPrice } = await EthHelper()

        const myContract = new web3.eth.Contract(contractABI, contract);
        // const balance = web3.utils.toWei(amountToSend.toString());
        const balance = amountToSend * 1000000 // new changes
        console.log("balance==>>164 subhra", balance);


        const Data = await myContract.methods.transfer(recieverAddress, balance.toString()).encodeABI();

        const rawTransaction = {
            to: contract,
            gasPrice: gasPrice , // Always in Wei (30 gwei)
            gas: 200000, // Always in Wei   i.e token transfer this transaction object
            // gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
            // gasLimit: web3.utils.toHex('80000'), // Always in Wei
            data: Data, // Setting the pid 12 with 0 alloc and 0 deposit fee
            value: 0

        };
        let a = (gasPrice*200000)/1000000000000000000;
        console.log(">>>>>>>>>>>>>", a);
        console.log("rawTransaction= new Subhra=>>", rawTransaction);
        const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
        console.log("signPromise== subhraRAIIIII>>", signPromise);
        let data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
        console.log("152 data=== subhra>??", data);
        return data
    } catch (error) {
        console.log('93 error==>', error)
    }

}


async function transfer(fromAddress, fromPrivateKey, toAddress) {
    try {
        let provider = new ethers.providers.JsonRpcProvider(link);
        let transferValidatorResponse = await transferValidator(fromAddress, toAddress, provider)   // returns the value subtracting tx fess(taking a buffer of 2%)
        // Should return TRUE, calculates user tx fees for the whole process
        if (transferValidatorResponse.status == false) {
            return {
                Message: `Insufficient funds.`,
                TxCost: ethers.utils.formatEther(transferValidatorResponse.value)
            };
        }
        const transferEtherResponse = await transferEther(fromPrivateKey, toAddress, transferValidatorResponse.requiredAmount, transferValidatorResponse.gasPrice, transferValidatorResponse.gasAmount, provider)
        if (transferEtherResponse.status == false) {
            return {
                Message: transferEtherResponse.message,
                Reason: transferEtherResponse.code,
            };
        }
        return { status: 200, Status: "Success", Message: transferEtherResponse.message, Hash: transferEtherResponse.hash, fee: ethers.utils.formatEther(transferValidatorResponse.txFee), 'sent-amount': ethers.utils.formatEther(transferValidatorResponse.requiredAmount) };
    } catch (error) {
        console.log('Error: ', error)
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

const transferValidator = async (fromAddress, toAddress, provider) => {
    const userBalance = await provider.getBalance(fromAddress);
    var gasPrice = await fetchGasStationPrice();
    const { txFee, gasAmount } = await transactionFees(fromAddress, toAddress, '0x00', gasPrice, provider)     // Calculates tx Fees for sending ether to User
    console.log('status', userBalance.gte(txFee));

    return { status: userBalance.gte(txFee), value: userBalance.add(txFee), txFee: txFee, gasPrice: gasPrice, gasAmount: gasAmount, requiredAmount: userBalance.sub(txFee) }
}

const fetchGasStationPrice = async () => {
    const result = await axios.get(`https://ethgasstation.info/api/ethgasAPI.json?api-key=ce8da4d2e680dad6465330e7869efe101517aad8274be133e44a8119d5c0`); // Put this api-key in the service file
    let fast = (result.data.fast) / 10  // Using `fast` as default, dividing by 10 to get in Gwei
    fast = Math.round(fast)         // Error for Decimals, round it 
    console.log(`Current Gas Price ${fast} Gwei`);
    return ethers.utils.parseUnits(fast.toString(), "gwei");        // Calculate and send in gwei amount
}

const transactionFees = async (fromAddress, toAddress, data, gasPrice, provider) => {
    try {
        const gasAmount = await provider.estimateGas({
            to: toAddress,
            from: fromAddress,
            data: data,
        });

        var txFee = gasPrice.mul(gasAmount);

        return { txFee, gasAmount }

    } catch (error) {
        console.log('transactionFees Error', error);
        return
    }
}

const transferEther = async (fromPrivKey, toAddress, valueToSend, gasPrice, gasAmount, provider) => {
    try {
        const wallet = new ethers.Wallet(fromPrivKey)
        const providerWallet = wallet.connect(provider)
        const txObject = {
            to: toAddress,
            gasLimit: gasAmount,    // Safe Limit is 21000 
            gasPrice: gasPrice,
            value: valueToSend,
        }
        console.log(txObject);
        providerWallet.signTransaction(txObject)
        const txHash = await providerWallet.sendTransaction(txObject)
        await txHash.wait()
        console.log("success");
        return { message: 'Transfer Success', hash: txHash.hash, status: true }
    } catch (error) {
        console.log(`Transfer Ether to ${toAddress} Failed`, error);
        return { message: `Transfer Ether to ${toAddress} Failed`, code: error.code, status: false }
    }
}
// async function check() {
//     // console.log(await generateAddress(1))
//     console.log(await withdraw("0x7ffb92cf99b64e5930f17ed58a59504ef940be50", "f048b20cb1514a0917e225b26b32d005d5c95c647a452ee80705ae9b9ffb8ed8", "0xd39503b3f299fc409eb03d6935b0d947636d31f1", "0.1"))
// }
// check()
module.exports = { generateAddress, getBalance, withdrawToken, withdraw, transfer }

const getContractAddress = async (tokenType) => {
    return tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
        tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
            tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}
