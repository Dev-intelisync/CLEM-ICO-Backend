import axios from "axios";
import configRes from "./config/config.json";
const btc_baseURL = configRes.BTC.baseURL;



module.exports = {

    async generateAddress(count) {
        return new Promise(function (resolve, reject) {
            const config = {
                method: 'get',
                url: `${btc_baseURL}/newaddress/${count}`,
                headers: {
                    'accept': 'application/json'
                }
            }
            axios(config)
                .then(function (response) {
                    console.log("BTC response===>>", response.data)
                    resolve({ address: response.data.address });
                })
                .catch(function (error1) {
                    reject(error1);
                });
        })

    },

    async getBalance(address) {
        return new Promise(function (resolve, reject) {
            const config = {
                method: 'get',
                url: `${btc_baseURL}/addr_balance/${address}`,
                headers: {
                    'accept': 'application/json'
                }
            }
            axios(config)
                .then(function (response) {
                    console.log("BTC response===>>", response.data)
                    resolve(response.data.balance);
                })
                .catch(function (error1) {
                    reject(error1);
                });
        })

    },

    async withdraw(SendFrom, SendTo, AmountToTransfer) {
        return new Promise(function (resolve, reject) {
            var data = JSON.stringify({
                "SendFrom": SendFrom,
                "SendTo": SendTo,
                "AmountToTransfer": AmountToTransfer,
                "ChangeAddress": SendTo  // as per cpp-ayush
            });

            var config = {
                method: 'post',
                url: `${btc_baseURL}/withdraw`,
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: data
            };
            axios(config)
                .then(function (response) {
                    console.log("BTC response===>>", response.data)
                    resolve(response.data);
                })
                .catch(function (error1) {
                    reject(error1);
                });
        })


    },

    async transfer(SendFrom, SendTo) {
        return new Promise(function (resolve, reject) {
            var data = JSON.stringify({
                "SendFrom": SendFrom,
                "SendTo": SendTo
            });

            var config = {
                method: 'post',
                url: `${btc_baseURL}/transfer`,
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: data
            };
            axios(config)
                .then(function (response) {
                    console.log("BTC response===>>", response.data)
                    resolve(response.data);
                })
                .catch(function (error1) {
                    reject(error1);
                });
        })





    }

}



//***************************************************************************************************/

const getContractAddress = async (tokenType) => {
    return tokenType === coinType.USDT ? configRes.ERC20.contractAddress.USDT :
            tokenType === coinType.USDC ? configRes.ERC20.contractAddress.USDC :
                tokenType === coinType.TUSDC ? configRes.ERC20.contractAddress.TUSDC : configRes.ERC20.contractAddress.BUSD;
}