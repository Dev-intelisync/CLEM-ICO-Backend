
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import coinType from '../enums/coinType';
import coinIndex from "../enums/coinIndex";
import coinImage from "../enums/coinImage";

const options = {
    collection: "coin",
    timestamps: true,
};

const coinSchema = new Schema(
    {
        coinName: {
            type: String
        },
        coinType: {
            type: String
        },
        coinImage: {
            type: String
        },
        index: { type: Number },
        status: { type: String, default: status.ACTIVE },
    },
    options
);
coinSchema.plugin(mongoosePaginate);
coinSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("coin", coinSchema);


(async () => {
    let result = await Mongoose.model("coin", coinSchema).find({});
    if (result.length != 0) {
        console.log("Default coin content already created.");
    }
    else {
        const object1 = {
            coinName: coinType.USDT,
            coinType: coinType.USDT,
            index:coinIndex.USDT,
            coinImage: coinImage.USDT
        };
        const object2 = {
            coinName: coinType.USDC,
            coinType: coinType.USDC,
            index:coinIndex.USDC,
            coinImage: coinImage.USDC
        };
        const object3 = {
            coinName: coinType.BUSD,
            coinType: coinType.BUSD,
            index:coinIndex.BUSD,
            coinImage: coinImage.BUSD
        };
        const object4 = {
            coinName: coinType.BTC,
            coinType: coinType.BTC,
            index:coinIndex.BTC,
            coinImage: coinImage.BTC
        };
        const object5 = {
            coinName: coinType.ETH,
            coinType: coinType.ETH,
            index:coinIndex.ETH,
            coinImage: coinImage.ETH
        };
        const object6 = {
            coinName: coinType.BNB,
            coinType: coinType.BNB,
            index:coinIndex.BNB,
            coinImage: coinImage.BNB
        };
        const object7 = {
            coinName: coinType.MATIC,
            coinType: coinType.MATIC,
            index:coinIndex.MATIC,
            coinImage: coinImage.MATIC
        };
        const object8 = {
            coinName: coinType.AVAX,
            coinType: coinType.AVAX,
            index:coinIndex.AVAX,
            coinImage: coinImage.AVAX
        };
        const object9 = {
            coinName: coinType.VD,
            coinType: coinType.VD,
            index:coinIndex.VD,
            coinImage: coinImage.VD
        };


        let coinResult = await Mongoose.model("coin", coinSchema).create(object1, object2, object3, object4, object5, object6, object7, object8, object9);
        if (coinResult) {
            console.log("DEFAULT coin created.", coinResult)
        }
    }
}).call();