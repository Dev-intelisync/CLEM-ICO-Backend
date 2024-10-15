import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import stake from "../enums/stake";
import stakeType from "../enums/stakeType";
const options = {
    collection: "stake",
    timestamps: true
};
const schema = Mongoose.Schema;
var stakeSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        price: { type: Number },
        coinId: {
            type: schema.Types.ObjectId,
            ref: 'wallet'
        },
        message: { type: String },
        documentUrl: { type: String },
        reason: { type: String },
        fromDate: { type: Date },
        toDate: { type: Date },
        payoutAmount:{ type: Number },
        earning: { type: Number, default: 0 },
        expectEarning: { type: Number, default: 0 },
        interest: {
            type: String,
            enum: ["WITH_INTEREST", "WITHOUT_INTEREST"]
        },
        stakeType: { type: String, default: stakeType.STAKE },
        stakeStatus: { type: String, default: stake.INPROGRESS },
        isStakeRequestStatus: { type: Boolean, default: false },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

stakeSchema.plugin(mongoosePaginate);
stakeSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("stake", stakeSchema);