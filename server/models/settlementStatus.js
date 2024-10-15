import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import settlementType from "../enums/settlementType";
import settlementStatus from '../enums/settlementStatus';

const options = {
    collection: "settlementStatus",
    timestamps: true
};

const settlementSchema = new schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    coinTypeName: {
        type: String
    },
    transactionId: {
        type: schema.Types.ObjectId,
        ref: 'transaction'
    },
    walletAddress: {
        type: String
    },
    coinAmount: {
        type: String
    },
    fromAddress: { type: String },
    toAddress: { type: String },
    comment: {
        type: String
    },

    settlementStatus: {
        type: String,
        enum: [settlementStatus.INPROCESS, settlementStatus.APPROVE]
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    settlementType: {
        type: String,
        enum: [settlementType.WITHDRAW, settlementType.DEPOSITE, settlementType.PAYWITHFIET, settlementType.PAYWITHCRYPTO, settlementType.SENDMONEY]
    }
}, { timestamps: true })

settlementSchema.plugin(mongoosePaginate);
settlementSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("settlementStatus", settlementSchema);
