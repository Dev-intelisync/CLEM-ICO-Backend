import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import appealStatus from '../enums/appeal';

const options = {
    collection: "appeal",
    timestamps: true
};

const schemaDefination = new schema(
    {
        userId: { type: schema.Types.ObjectId, ref: 'user' },
        chatId: { type: schema.Types.ObjectId, ref: 'chat' },
        p2pAdvertisementId: { type: schema.Types.ObjectId, ref: 'p2pAdvertisement' },
        mobileNumber: { type: String },
        reason: { type: String },
        description: { type: String },
        image: { type: String },
        appealStatus: { type: String, default: appealStatus.PENDING },
        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("appeal", schemaDefination);