const stripe = require('stripe')
('sk_test_51J40NISHXHqrNtWa5vKHV24aCJuhIcD7s7UCldOgxeeML6NyI9Ds3eZoZIiodt4yXZcjpSaJJOlym7WSoX2RyT1e00yeMC47LU')
//subhra
var public_key = 'pk_test_51J40NISHXHqrNtWaQfDOPit9Xj16CJ1ybkm8BOZ14tb85N5oMvKazZoDZhlz18O1KvQAAzynMWrD4cA7X6cZeXx100tu636jhH'
token = 
module.exports = {

    /**
     * Function Name: stripe createToken API
     * Description: stripe createToken API creates a token
     * @return response
     */

    createToken: (cardObj) => {
        return new Promise((resolve, reject) => {
            try {
                stripe.tokens.create(cardObj, (err, result) => {
                    if (err) {
                        reject("Token not created.");
                        // return res.send({ responseCode: 500, responseMessage: "Token not created." })
                    }
                    else if (!result) {
                        reject("Token not found.")
                        //   return res.send({responseCode:404,responseMessage:"Token not found."})
                    }
                    else {
                        resolve("token Create successfully",result._id)
                        //   return res.send({responseCode:200, responseMessage: "token created successfully.", result})
                    }
                })
            }
            catch (error) {
                reject("Sonmething went wrong.");
                //   return res.send({ responseCode:203, responseMessage:"Something wrong."})
            }
        })
    },

    /**
     * Function Name: stripe createCustomer API
     * Description: stripe createCustomer API creates a new customer
     * @return response
     */

    createCustomer: (token, userDetails) => {
        return new Promise((resolve, reject) => {
            try {
                let obj = {
                    //description:req.body.email,
                    email: userDetails.email,
                    name: userDetails.fullName,
                    // source:"tok_1HZFasLMb1HL1i61KcI0Ts2o" // "tok_1HZE2mLMb1HL1i61TfuQRI46" 
                    source: token,
                }
                stripe.customers.create(obj, (err, result) => {
                    if (err) {
                        console.log("Error in create customer", err)
                        reject("Customer not created.");
                        // return res.send({ responseCode: 500, responseMessage: "Customer not created."})
                    }
                    else if (!result) {
                        reject("Customer not found.");
                        // return res.send({ responseCode: 404, responseMessage: "Customer not found."})
                    }
                    else {
                        console.log("Customer id is", result)
                        resolve(result.id)
                        // return res.send({ responseCode: 200, responseMessage: "Customer successfully created.", result})
                    }
                })
            }
            catch (error) {
                reject(error);
                // return res.send({ responseCode:203, responseMessage:"Something went wrong."})
            }
        })
    },

    /**
     * Function Name: stripe createCharge API
     * Description: stripe createCharge API makes a payment
     * @return response
     */

    createCharge: (obj1) => {
        return new Promise((resolve, reject) => {
            try {
                stripe.charges.create(obj1, (err, charge) => {
                    if (err) {
                        console.log("Error in charge", err)
                        reject("Charge not created.");
                        // return res.send({ responseCode: 500, responseMessage: "Charge not created"})
                    }
                    else if (!charge) {
                        reject("Cannot charge a customer that has no active card.");
                        // return res.send({ responseCode: 404, responseMessage: "Cannot charge a customer that has no active card."})
                    }
                    else {
                        console.log("Transaction id", charge)
                        resolve(charge.id);
                        // return res.send({ responseCode: 200, responseMessage: "Payment done successfully", charge})

                    }
                })
            }
            catch (error) {
                reject("Something went wrong.")
                // return res.send({ responseCode:203, responseMessage:"Something wrong."})
            }
        })
    },

    /**
     * Function Name: stripe refundPayment API
     * Description: stripe refundPayment API refund payment to customer account
     * @return response
     */

    refundPayment: (req, res) => {
        try {
            stripe.refunds.create({
                charge: req.body.charge,
                amount: req.body.amount * 100, //Math.round(amount),
            }, function (err, refund) {
                console.log("Payment refund", err, refund)
                if (err) {
                    return res.send({ responseCode: 501, responseMessage: "Something went wrong.", error: err })
                }
                else {
                    return res.send({ responseCode: 200, responseMessage: "Refund successfully done." })
                }
            })
        }
        catch (error) {
            return res.send({ responseCode: 203, responseMessage: "Something wrong." })
        }
    },


    /**
     * Function Name: stripe totalBalance API
     * Description: stripe totalBalance API retrieve total balance
     * @return response
     */
    /*
    totalBalance: (req, res)=> {
        stripe.balanceTransactions.retrieve(function (err, balance){
            console.log("Balance is", balance)
        })
    }
    */
    // End of exports
}