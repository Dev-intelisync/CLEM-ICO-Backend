import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';

const options = {
    collection: "wallet",
    timestamps: true
};

const schemaDefination = new schema(
    {
        coinName: { type: String },
        balance: { type: Number, default: 0 },
        lockedBalance: [{
            type: new schema(
                {
                    title: { type: String },
                    balance: { type: Number }
                },
                { timestamps: true }
            )
        }],
        index: { type: Number },
        coinImage: { type: String },
        address: { type: String },
        privateKey: { type: String },
        publicKey: { type: String },
        coinType: { type: String },
        userId: { type: schema.Types.ObjectId, ref: 'user' },
        status: { type: String, status: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("wallet", schemaDefination);

