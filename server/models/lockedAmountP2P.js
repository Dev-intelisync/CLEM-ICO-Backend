import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import transactionStatusType from '../enums/transactionStatusType';

const options = {
    collection: "lockedAmountP2P",
    timestamps: true
};

const schemaDefination = new schema(
    {
        userId: { type: schema.Types.ObjectId, ref: 'user' },
        p2pAdvertisementId: { type: schema.Types.ObjectId, ref: 'p2pAdvertisement' },
        quantity: { type: Number },
        price: { type: Number },
        lockTime: { type: Date },
        isTransfered: { type: Boolean, default: false },
        isPaid: { type: Boolean, default: false },
        status: { type: String, default: status.ACTIVE },
        tradeStatus: { type: String, default: transactionStatusType.PENDING }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("lockedAmountP2P", schemaDefination);