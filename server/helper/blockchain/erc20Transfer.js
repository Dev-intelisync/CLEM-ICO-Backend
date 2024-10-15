const axios = require('axios')
const bip39 = require('bip39')
const ethers = require('ethers');
import configRes from "./config/config.json";
import coinType from '../../enums/coinType';



const AdminAddress = configRes.MATIC.address;
const AdminPrivateKey = configRes.MATIC.privateKey;
const balanceURL = configRes.ERC20.balanceURL;
const apiKey = configRes.ERC20.apiKey;
const RPC = configRes.ERC20.INFURA_URL;
const RPCMATIC = configRes.MATIC.rpc;

const gasPriceURL = configRes.ERC20.gasPriceURL;
const gasPriceURLMatic = configRes.MATIC.gasPrice;


const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
var web3 = new Web3(new Web3.providers.HttpProvider(RPC));
var web3Matic = new Web3(new Web3.providers.HttpProvider(RPCMATIC));

const contractABI = require("./config/erc20ABI.json");


const getCurrentGasPrices = async () => {
    let response = await axios.get(`${gasPriceURL}`);
    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10
    };
    return prices;
}

const getCurrentGasPricesMatic = async () => {
    let response = await axios.get(`${gasPriceURLMatic}`);
    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10
    };
    console.log("===price in functyion==",prices)
    return prices;
}

const ethHelper = async () => {
    let currentGasPrice = await getCurrentGasPrices();
    let gasPrice = currentGasPrice.high * 1000000000;
    let gasLimit = 21000;
    let fee = gasLimit * gasPrice;
    let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));
    console.log("=======$===>>>>>38", gasPrice)
    return { fee: txFee, gasPrice: gasPrice }
}

const maticHelper = async () => {
    let currentGasPrice = await getCurrentGasPricesMatic();
    let gasPrice = currentGasPrice.high * 1000000000;
    let gasLimit = 21000;
    let fee = gasLimit * gasPrice;
    let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));
    console.log("====================***********======>>>>>38", gasPrice)
    return { fee: txFee, gasPrice: gasPrice }
}

const ethHelperCurrentGasPrice = async () => {
    let currentGasPrice = await getCurrentGasPrices();
    let gasPrice = currentGasPrice.high * 1000000000;
    gasPrice = 21000 * gasPrice
    gasPrice = web3.utils.fromWei(gasPrice.toString(), "ether")
    gasPrice = Number(gasPrice).toFixed(9)
    gasPrice = Number(gasPrice) * 2
    return { gasPrice: gasPrice }
}

const accountETHBalance = async (senderAddress) => {
    try {
        const response = await axios.get(`${balanceURL}${senderAddress}&tag=latest&apikey=${apiKey}`);
        let balance = web3.utils.fromWei(response.data.result, "ether");
        return Number(balance);
    } catch (error) {
        console.log("accountETHBalance error", error);
        return Number(0);
    }
}


const preETHTransfer = async (senderAddress, amountToSend) => {
    const { fee } = await ethHelper();
    let balance = await accountETHBalance(senderAddress);

    if (balance - amountToSend - fee < 0) {
        console.log("insufficient funds", balance, senderAddress);
        return { status: false, message: "Low Balance" };
    } else {
        console.log("Transfer Possible==>", balance);
        return { status: true, message: "Transfer Possible" };
    }
}

const transferValidator = async (fromAddress, toAddress, provider) => {
    const userBalance = await provider.getBalance(fromAddress);
    var gasPrice = await fetchGasStationPrice();
    const { txFee, gasAmount } = await transactionFees(fromAddress, toAddress, '0x00', gasPrice, provider) // Calculates tx Fees for sending ether to User
    console.log('status', userBalance.gte(txFee));

    return { status: userBalance.gte(txFee), value: userBalance.add(txFee), gasPrice: gasPrice, gasAmount: gasAmount, requiredAmount: userBalance.sub(txFee) }
}

const fetchGasStationPrice = async () => {
    const result = await axios.get(`${gasPriceURL}`); // Put this api-key in the service file
    let fast = (result.data.fast) / 10 // Using `fast` as default, dividing by 10 to get in Gwei
    fast = Math.round(fast) // Error for Decimals, round it 
    console.log(`Current Gas Price ${fast} Gwei`);
    return ethers.utils.parseUnits(fast.toString(), "gwei") // Calculate and send in gwei amount
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
            gasLimit: gasAmount, // Safe Limit is 21000 
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

const transferAdminToUserForGasFee = async (adminAddress, adminPrivateKey, userAddress, amountToSend) => {
    try {
        var nonce = await web3.eth.getTransactionCount(adminAddress);
        const { gasPrice } = await maticHelper(adminAddress, amountToSend);
        console.log("gass Price", gasPrice);
        const { status } = await preETHTransfer(adminAddress, amountToSend);
        console.log("status===>>", status);
        if (status == false) {
            return ({ status: 404, responseMessage: "Low Balance.", responseResult: [] });
        }

        let txObject = {
            to: userAddress,
            value: web3.utils.toHex(
                web3.utils.toWei(amountToSend.toString(), "ether")
            ),
            gasLimit: 21000,
            gasPrice: gasPrice,
            nonce: nonce,
            // "chainId": 3 // EIP 155 chainId - mainnet: 1, rinkeby: 4
        };
        const signPromise = await web3.eth.accounts.signTransaction(txObject, adminPrivateKey.toString());

        let signTransaction = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
        console.log({
            status: 200,
            Status: "Success",
            Hash: signTransaction.transactionHash,
        });
        return {
            Status: true,
            Hash: signTransaction.transactionHash,
            message: "Success",
        };
    } catch (error) {
        console.log("error", error);
        return {
            Status: false,
            message: "Something went wrong!"
        };
    }
}


const tokenTransferUserToUser = async (recieverAddress, privateKey, amountToSend, contract) => {
    try {
        if (recieverAddress || privateKey || amountToSend) {
        }
        const myContract = new web3.eth.Contract(contractABI, contract);
        const decimals = await myContract.methods.decimals().call()
        const balance = ethers.utils.parseUnits(amountToSend.toString(), decimals);
        const Data = await myContract.methods.transfer(recieverAddress, balance.toString()).encodeABI();
        const rawTransaction = {
            to: contract,
            gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
            gasLimit: web3.utils.toHex('200000'), // Always in Wei for native currency
            data: Data // Setting the pid 12 with 0 alloc and 0 deposit fee
        };
        const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
        let data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
        if (data) {
            console.log({ status: 200, Status: "Success", Hash: signPromise.transactionHash });
            return { status: 200, responseMessage: "Success", responseResult: data };
        }
    }
    catch (error) {
        console.log({ status: 501, responseMessage: "Something went wrong!", error: error.message })

    }
}

const remeningAmountTransferToAdmin = async (senderAddress, privateKey, recieverAddress) => {
    try {
        let provider = new ethers.providers.JsonRpcProvider(RPC); // testnet
        let transferValidatorResponse = await transferValidator(senderAddress, recieverAddress, provider)   // returns the value subtracting tx fess(taking a buffer of 2%)
        if (transferValidatorResponse.status == false) {
            return ({
                status: 404,
                responseMessage: `Insufficient funds.`,
                responseResult: { TxCost: Number(ethers.utils.formatEther(transferValidatorResponse.value)) }
            })
        }
        const transferEtherResponse = await transferEther(privateKey, recieverAddress, transferValidatorResponse.requiredAmount, transferValidatorResponse.gasPrice, transferValidatorResponse.gasAmount, provider)
        if (transferEtherResponse.status == false) {
            return ({
                status: 404,
                responseMessage: transferEtherResponse.message,
                responseResult: transferEtherResponse,
            })
        }
        return ({ status: 200, responseMessage: "Transfer Successful", responseResult: transferEtherResponse });
    } catch (error) {
        console.log(error)
        return ({ status: 501, responseMessage: "Something went wrong!!!", responseResult: `${error}` });
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
        console.log("==result1==", result1, result1.status)
        if (result1 && result1.Status == true) {
            let result2 = await tokenTransferUserToUser(receiverAddress, privateKey, token, contract)
            console.log("&&&&&&&&&=====result2$$$$$$", result2)
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


module.exports = { transferTokenUserToUser, transferAdminToUserForGasFee, ethHelperCurrentGasPrice }

const getContractAddress = async (tokenType) => {
    return tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
        tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
            tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}