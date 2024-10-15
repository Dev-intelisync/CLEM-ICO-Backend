import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import transactionType from '../enums/transactionType';
import transStatusType from '../enums/transactionStatusType';
import changelyTransactionStatus from '../enums/changelyTransactionStatus';

const options = {
    collection: "transaction",
    timestamps: true
};

const schemaDefination = new schema(
    {
        title: { type: String },
        userId: { type: mongoose.Types.ObjectId, ref: 'user' },
        p2pAdvertisementId: { type: schema.Types.ObjectId, ref: 'p2pAdvertisement' },
        coinName: { type: String },
        fromAddress: { type: String },
        toAddress: { type: String },
        quantity: { type: Number },
        amount: { type: String },
        tokenAmount: { type: String },
        tokenId: { type: String },
        transactionHash: { type: String },
        transactionFee: { type: Number },
        receipt: schema.Types.Mixed,
        failedReason: schema.Types.Mixed,
        isAdminTransaction: { type: Boolean },
        interest: { type: Number },
        interest: { type: String },
        paymentType: { type: String },
        fromSymbol:{type:String},
        toSymbol:{type:String},
        stakeId: { type: mongoose.Types.ObjectId, ref: 'stake' },
        transactionType: { type: String, enum: [transactionType.TRANSFER, transactionType.WITHDRAW, transactionType.DEPOSIT,transactionType.STAKE_RECEIVE,transactionType.STAKE_TRANSFER,transactionType.RECEIVE_MONEY] },
        transStatusType: { type: String, enum: [transStatusType.PENDING, transStatusType.SUCCESS, transStatusType.FAILED, transStatusType.CANCEL] },
        changelyTransactionStatus:{type:String,enum:[changelyTransactionStatus.PENDING,changelyTransactionStatus.SUCCESS,changelyTransactionStatus.FAILED,changelyTransactionStatus.CANCEL]},

        status: { type: String, default: status.ACTIVE }
    },
    options
);


schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("transaction", schemaDefination);

