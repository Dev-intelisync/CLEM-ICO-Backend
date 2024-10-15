import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import p2pStatus from '../enums/p2pStatus';
import priceType from '../enums/priceType';
import currency from '../enums/currency';

const options = {
    collection: "p2pAdvertisement",
    timestamps: true,
};
const p2pAdvertisementSchema = new schema({

    userId: { type: schema.Types.ObjectId, ref: 'user' },
    chatId: { type: schema.Types.ObjectId, ref: 'chat' },
    tradeType: { type: String, enum: ['BUY', 'SELL'] },
    country: { type: String },
    asset: { type: String },
    paymentGateway: { type: String },
    currency: { type: String, enum: [currency.INR, currency.USD] },
    price: { type: Number },
    quantity: { type: Number },
    priceType: { type: String, enum: [priceType.FIXED, priceType.FLOATING] },
    margin: { type: Number },
    paymentWindowTime: { type: String },
    minOrderLimit: { type: Number },
    maxOrderLimit: { type: Number },
    bankId: { type: schema.Types.ObjectId, ref: 'bank' },
    remark: { type: String },
    remark: { type: String },
    greetingMessage: { type: String },
    lockedAmountP2PId: { type: Array },
    p2pStatus: { type: String, enum: [p2pStatus.Enabled, p2pStatus.Disabled], default: p2pStatus.Enabled },
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    }
}, options)

p2pAdvertisementSchema.plugin(mongoosePaginate);
p2pAdvertisementSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("p2pAdvertisement", p2pAdvertisementSchema);