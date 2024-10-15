var axios = require("axios");

const url = "https://api.changelly.com";

const api_key = "16b15ccce9ef48a9b7e98dfb9508c6c3";

const crypto = require("crypto");
const secret =
    "9ee94fd1936718fc60fd8f81e81ad8fdd72cbca393a563cbc48b8345e7f5292d";


module.exports = {

    async getExchangeAmount(from, to, amount) {
        const finalFrom = getTokenName(from);
        const finalTo = getTokenName(to);
        try {
            const data = JSON.stringify({
                id: "test",
                jsonrpc: "2.0",
                method: "getExchangeAmount",
                params: {
                    from: finalFrom,
                    to: finalTo,
                    amount: amount,
                },
            });

            const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

            const getExchange = await axios({
                method: "post",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    "api-key": api_key,
                    sign: sign,
                },
                data: data,
            });

            console.log("getExchange======>", getExchange);
            if (getExchange.data.error) {
                return getExchange.data;
            }

            return getExchange.data.result;
        } catch (error) {
            console.log("error===2===>", error);
            return error;
        }
    },

   async createTransaction (from, to, address, amount) {
        const finalFrom = getTokenName(from);
        const finalTo = getTokenName(to);
    
        try {
            console.log(
                "console in fubction============>from, to , address, amount",
                finalFrom,
                finalTo,
                address,
                amount
            );
            const data = JSON.stringify({
                id: "test",
                jsonrpc: "2.0",
                method: "createTransaction",
                params: {
                    from: finalFrom,
                    to: finalTo,
                    address: address,
                    amount: amount,
                },
            });
    
            const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");
    
            const signTrx = await axios({
                method: "post",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    "api-key": api_key,
                    sign: sign,
                },
                data: data,
            });
    
            console.log("signTrx=====>", signTrx.data);
            return signTrx.data;
        } catch (error) {
            console.log("error====1=>", error);
            return;
        }
    }



}









// export const getExchangeAmount = async (from, to, amount) => {
//   const finalFrom = getTokenName(from);
//   const finalTo = getTokenName(to);
//   try {
//     const data = JSON.stringify({
//       id: "test",
//       jsonrpc: "2.0",
//       method: "getExchangeAmount",
//       params: {
//         from: finalFrom,
//         to: finalTo,
//         amount: amount,
//       },
//     });

//     const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

//     const getExchange = await axios({
//       method: "post",
//       url: url,
//       headers: {
//         "Content-Type": "application/json",
//         "api-key": api_key,
//         sign: sign,
//       },
//       data: data,
//     });

//     console.log("getExchange======>", getExchange);
//     if (getExchange.data.error) {
//       return getExchange.data;
//     }

//     return getExchange.data.result;
//   } catch (error) {
//     console.log("error===2===>", error);
//     return error;
//   }
// };

const getTokenName = (name) => {
    let finalName;
    switch (name) {
        case "usdt":
            finalName = "usdt20";
            break;
        case "busd":
            finalName = "busdbsc";
            break;
        case "bnb":
            finalName = "bnbbsc";
            break;
        default:
            finalName = name;
    }
    return finalName;
};

// Main Function
// export const createTransaction = async (from, to, address, amount) => {
//     const finalFrom = getTokenName(from);
//     const finalTo = getTokenName(to);

//     try {
//         console.log(
//             "console in fubction============>from, to , address, amount",
//             finalFrom,
//             finalTo,
//             address,
//             amount
//         );
//         const data = JSON.stringify({
//             id: "test",
//             jsonrpc: "2.0",
//             method: "createTransaction",
//             params: {
//                 from: finalFrom,
//                 to: finalTo,
//                 address: address,
//                 amount: amount,
//             },
//         });

//         const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

//         const signTrx = await axios({
//             method: "post",
//             url: url,
//             headers: {
//                 "Content-Type": "application/json",
//                 "api-key": api_key,
//                 sign: sign,
//             },
//             data: data,
//         });

//         console.log("signTrx=====>", signTrx.data);
//         return signTrx.data;
//     } catch (error) {
//         console.log("error====1=>", error);
//         return;
//     }
// };

export const validateAddress = async (currency, address) => {
    try {
        const data = JSON.stringify({
            id: "test",
            jsonrpc: "2.0",
            method: "validateAddress",
            params: {
                currency: currency,
                address: address,
            },
        });

        const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

        const signTrx = await axios({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "api-key": api_key,
                sign: sign,
            },
            data: data,
        });

        console.log("signTrx=====>", signTrx.data);
    } catch (error) {
        console.log("error====1=>", error);
    }
};

export const getStatus = async (transId) => {
    try {
        var data = JSON.stringify({
            id: "test",
            jsonrpc: "2.0",
            method: "getStatus",
            params: {
                id: transId,
            },
        });

        const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

        var response = await axios({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "api-key": api_key,
                sign: sign,
            },
            data: data,
        });
        console.log("response=====>", response.data);
        if (response.data.result) {
            return {
                status: true,
                Hash: response.data.result,
                message: "Success",
            };
        } else {
            return {
                status: false,
                message: "Something went wrong!",
            };
        }
    } catch (error) {
        console.log("error====1=>", error);
        return {
            status: false,
            message: "Something went wrong!",
        };
    }
};

export const getCurrency = async () => {
    try {
        var data = JSON.stringify({
            id: "test",
            jsonrpc: "2.0",
            method: "getCurrencies",
            params: {},
        });

        const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

        var config = await axios({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "api-key": api_key,
                sign: sign,
            },
            data: data,
        });

        console.log("response=====>", config.data);
    } catch (error) {
        console.log("error====1=>", error);
    }
};

export const getCurrenciesFull = async () => {
    try {
        var data = JSON.stringify({
            id: "test",
            jsonrpc: "2.0",
            method: "getCurrenciesFull",
            params: {},
        });

        const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

        var config = await axios({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "api-key": api_key,
                sign: sign,
            },
            data: data,
        });

        console.log("response=====>", config);
    } catch (error) {
        console.log("error====1=>", error);
    }
};

export const getMinAmount = async () => {
    try {
        const data = JSON.stringify({
            id: "test",
            jsonrpc: "2.0",
            method: "getMinAmount",
            params: {
                from: "bnbbsc",
                to: "trx",
            },
        });

        const sign = crypto.createHmac("sha512", secret).update(data).digest("hex");

        const getExchange = await axios({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "api-key": api_key,
                sign: sign,
            },
            data: data,
        });

        console.log("getExchange======>", getExchange.data);
    } catch (error) {
        console.log("error===2===>", error);
    }
};

// getExchangeAmount('busdbsc', 'trx', 0.3);
// getMinAmount()

// createTransaction('bnb','trx','TFZkDNa4QSDGmDXwCQr5aXH4ST2XurfZPQ', 0.3)

// validateAddress('bnb','bnb1jwr79maxff06p07n4qfm33asv60gnnfe5fpw32')
// validateAddress('usdt20','0xD1720744122783451897237Fc7F70fef802Be6f2')
// validateAddress('bnbbsc','0xA93647C91133454fB265821334083375b12F06e5')

// validateAddress('bnbbsc','0xA93647C91133454fB265821334083375b12F06e5')

// getStatus('7zwz8xjhymjk2r6q');

// getCurrency();

// getCurrenciesFull();

// ETH
// Bsc
// Polygon
// Tron
// BTC