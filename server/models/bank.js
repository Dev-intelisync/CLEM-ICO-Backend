import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status'
import bankType from '../enums/bankType';
import bankCode from '../enums/bankCode';
const bankSchema = new schema({

    accountNumber: {
        type: String
    },
    ifscCode: {
        type: String
    },
    micr: {
        type: String
    },
    holderName: {
        type: String
    },
    upiId: {
        type: String
    },
    googleId: {
        type: String
    },
    appleId: {
        type: String
    },
    bankName: {
        type: String
    },
    swiftCode: {
        type: String
    },
    shortCode: {
        type: String
    },
    bankAddress: { type: String },
    userId: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    bankType: {
        type: String,
        enum: [bankType.BANK, bankType.UPI]
    },
    bankCode: {
        type: String,
        enum: [bankCode.IFSC, bankCode.MICR,bankCode.SHORTCODE]
    },
    approveStatus: {
        type: String,
        enum: ["PENDING", "REJECT", "APPROVE"],
        default: "PENDING"
    },
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    }
}, { timestamps: true })

bankSchema.plugin(mongoosePaginate);
bankSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("bank", bankSchema);