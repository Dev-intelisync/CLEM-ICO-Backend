
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import coinType from "../enums/coinType";
import feeType from "../enums/fee";

const options = {
    collection: "fee",
    timestamps: true,
};

const feeSchema = new Schema(
    {
        amount: {
            type: Number
        },
        coinType: {
            type: String
        },
        feeType: { type: String, enum: [feeType.MIN_WITHDRAWAL, feeType.WITHDRAWAL_FEE] },
        status: { type: String, default: status.ACTIVE },
    },
    options
);
feeSchema.plugin(mongoosePaginate);
feeSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("fee", feeSchema);


(async () => {
    let result = await Mongoose.model("fee", feeSchema).find({});
    if (result.length != 0) {
        console.log("Default fee content already created.");
    }
    else {
        var object1 = {
            amount: 0,
            coinType: coinType.AVAX,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object2 = {
            amount: 0,
            coinType: coinType.BNB,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object3 = {
            amount: 0,
            coinType: coinType.BTC,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object4 = {
            amount: 0,
            coinType: coinType.ETH,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object5 = {
            amount: 0,
            coinType: coinType.LTC,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object6 = {
            amount: 0,
            coinType: coinType.MATIC,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object7 = {
            amount: 0,
            coinType: coinType.SOLANA,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object8 = {
            amount: 0,
            coinType: coinType.USDC,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object9 = {
            amount: 0,
            coinType: coinType.USDT,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object10 = {
            amount: 0,
            coinType: coinType.VD,
            feeType: feeType.MIN_WITHDRAWAL
        };
        var object11 = {
            amount: 0,
            coinType: coinType.AVAX,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object12 = {
            amount: 0,
            coinType: coinType.BNB,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object13 = {
            amount: 0,
            coinType: coinType.BTC,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object14 = {
            amount: 0,
            coinType: coinType.ETH,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object15 = {
            amount: 0,
            coinType: coinType.LTC,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object16 = {
            amount: 0,
            coinType: coinType.MATIC,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object17 = {
            amount: 0,
            coinType: coinType.SOLANA,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object18 = {
            amount: 0,
            coinType: coinType.USDC,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object19 = {
            amount: 0,
            coinType: coinType.USDT,
            feeType: feeType.WITHDRAWAL_FEE
        };
        var object20 = {
            amount: 0,
            coinType: coinType.VD,
            feeType: feeType.WITHDRAWAL_FEE
        };
        let feeResult = await Mongoose.model("fee", feeSchema).create(object1, object2, object3, object4, object5, object6, object7, object8, object9, object10, object11, object12, object13, object14, object15, object16, object17, object18, object19, object20);
        if (feeResult) {
            console.log("DEFAULT fee created.", feeResult)
        }
    }
}).call();