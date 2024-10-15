import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
const options = {
    collection: "notification",
    timestamps: true
};

const noficationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        stackId: {
            type: Schema.Types.ObjectId,
            ref: 'stack'
        },
        title: {
            type: String
        },
        body: {
            type: String
        },
        subject: {
            type: String
        },
        description: {
            type: String
        },
        image: {
            type: String
        },
        notificationType: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        },
        coinName:{type: String},
        quantity:{type: String},
        fromAddress:{type: String},
        toAddress:{type: String},
        transactionType:{type: String},
        chatId: { type: Schema.Types.ObjectId, ref: 'chat' },
        p2pAdvertisementId: { type: Schema.Types.ObjectId, ref: 'p2pAdvertisement' },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

noficationSchema.plugin(mongoosePaginate);
noficationSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("notification", noficationSchema);


