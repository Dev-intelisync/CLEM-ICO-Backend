import config from 'config';
var stripe = require('stripe')(config.get('stripeSecret'));


const createToken = async (cardNumber,expireMonth,expireYear,cvc) => {
    const token = await stripe.tokens.create({
        card: {
            number: cardNumber,
            exp_month: expireMonth,
            exp_year: expireYear,
            cvc: cvc,
        },
    });
    return token;
};


const createCustomer = async (stripeToken) => {
    const customer = await stripe.customers.create({
        description: 'Stripe API customer create',
        source: stripeToken
    });
    return customer;
};

const createCharge = async (amount, tokenId, currency) => {
    const charge = await stripe.charges.create({
        amount: amount * 100,
        currency: currency,
        source: tokenId,
        description: 'Stripe API charge create',
    });
    return charge;
};

const retrieveToken = async (stripeToken) => {
    const result = await stripe.tokens.retrieve(stripeToken);
    return result;
};

const paymentIntent = async (amount, cardId, customerId) => {
    const result = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        payment_method_types: ['card'],
        payment_method: cardId,
        customer: customerId
    });
    return result;
}


module.exports = {
    createToken,
    createCustomer,
    createCharge,
    retrieveToken,
    paymentIntent
};