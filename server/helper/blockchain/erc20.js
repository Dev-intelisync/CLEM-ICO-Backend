import axios from "axios";
import coinType from "../../enums/coinType";
import configRes from "./config/config.json";

var Web3 = require('web3');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const INFURA_URL = configRes.ERC20.INFURA_URL
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
import contractABI from "./config/erc20ABI.json";

const gasPriceURL = configRes.MATIC.gasPrice;


module.exports = {

    async generateAddress(count) {
        try {
            const seed = bip39.mnemonicToSeedSync(configRes.ERC20.mnemonic)
            let hdwallet = hdkey.fromMasterSeed(seed);
            let countvalue = count ? count : 0;
            let path = `m/44'/60'/0'/0/${countvalue}`;

            let wallet = hdwallet.derivePath(path).getWallet();
            let address = "0x" + wallet.getAddress().toString("hex");
            let privateKey = wallet.getPrivateKey().toString("hex");
            let obje = { address: address, privateKey: privateKey }
            console.log("obje", obje)
            return obje;
        } catch (error) {
            console.log('31 ==>', error)
        }
    },

    async getBalance(address, tokenType) {
        try {
            const contract = await getContractAddress(tokenType);
            const myContract = new web3.eth.Contract(contractABI, contract);
            var userBalance = await myContract.methods.balanceOf(address).call();

            const decimals = await myContract.methods.decimals().call()
            console.log("balamve in decimal==>>",decimals)
            // userBalance = web3.utils.formatUnits(userBalance, decimals)

            // userBalance = web3.utils.fromWei(userBalance)


            userBalance = await fromWeiDecimals(userBalance, decimals)

            console.log("==balanace==>>", userBalance)


            return Number(userBalance)
        } catch (error) {
            console.log('57 error==>', error)
        }
    },



    async withdraw(privateKey, recieverAddress, amountToSend, tokenType) {
        try {
            const contract = await getContractAddress(tokenType);
            // const contract = "0x92E28a68F440747252828A56C581B1295628eB64";
            const { fee, gasPrice } = await EthHelper()

            console.log("token type=>>>", tokenType)
            console.log("contract==>>", contract);
            const myContract = new web3.eth.Contract(contractABI, contract);
            const balance = web3.utils.toWei(amountToSend.toString());
            console.log("balance==>>", balance);
            console.log("sdfsdf", gasPrice);

            const Data = await myContract.methods.transfer(recieverAddress, balance.toString()).encodeABI();

            const rawTransaction = {
                // from: "0x7c26779C03459BFc46149F27B3e216C612831008",
                to: contract,
                gasPrice: gasPrice * 2, // Always in Wei (30 gwei)
                gas: 80000, // Always in Wei
                // gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
                // gasLimit: web3.utils.toHex('80000'), // Always in Wei
                data: Data, // Setting the pid 12 with 0 alloc and 0 deposit fee
                value: 0

            };
            console.log("rawTransaction==>>", rawTransaction);
            console.log("152 privateKey====??", privateKey);


            const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
            console.log("signPromise==>>suni", signPromise, privateKey);
            let data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
            console.log("152 data===>??", data);

            return data
            // .then((data) => {
            //     console.log("152 data===>??", data);
            //     return data
            // }).catch((error) => {
            //     console.log("Something went wrong!", error);
            //     return error
            // })
        } catch (error) {
            console.log('93 error==>', error)
        }

    },




    async transferTokenUserToUser(senderAddress, senderPrivateKey, receiverAddress, token, tokenType) {
        try {
            return new Promise(async function (resolve, reject) {
                const contract = await getContractAddress(tokenType);
                var data = JSON.stringify({
                    "senderAddress": senderAddress,
                    "senderPrivateKey": senderPrivateKey,
                    "receiverAddress": receiverAddress,
                    "token": token,
                    "contract": contract  // contract address
                });

                var config = {
                    method: 'post',
                    url: 'http://13.233.44.156:3030/erc20/withdraw',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: data
                };
                axios(config)
                    .then(function (response) {
                        console.log("ERC20 response===>>", response.data)
                        resolve(response.data);
                    })
                    .catch(function (error1) {
                        reject(error1);
                    });
            })
        } catch (error) {
            console.log('129 error==>', error)
        }
    }





}

const fromWeiDecimals = (balance, decimals) => {
    if (balance) {
        const balanceOfFromWei =
            Number(balance.toString()) / 10 ** Number(decimals);
        return balanceOfFromWei;
    } else {
        return balance;
    }
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

const EthHelper = async () => {
    let currentGasPrice = await getCurrentGasPrices();

    let gasPrice = currentGasPrice.high * 1000000000


    let gasLimit = 21000;
    let fee = gasLimit * gasPrice;

    let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));


    return { fee: txFee, gasPrice: gasPrice }
}


const getContractAddress = async (tokenType) => {
    return tokenType === coinType.VD ? configRes.MATIC.contractAddress.VD :
        tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
            tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
                tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}

//***************************************************************************************************** /


