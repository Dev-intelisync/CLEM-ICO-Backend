import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import mongoosePaginate from "mongoose-paginate";
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

const options = {
    collection: "chat",
    timestamps: true
};
const chatSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        chatType: {
            type: String
        },
        blockedBy: [{
            userId: {
                type: Mongoose.Types.ObjectId,
                ref: "user"
            },
            time: {
                type: Date
            }
        }],
        userReport: [{
            type: Mongoose.Types.ObjectId,
            ref: "user",

        }],
        chatDeleted: [{
            type: Mongoose.Types.ObjectId,
            ref: "user",

        }],
        isChatDeleted: {
            type: Boolean
        },
        isChatBlocked: {
            type: Boolean
        },
        lockTime: { type: Date },
        messages: [
            {
                senderId: {
                    type: Schema.Types.ObjectId,
                    ref: "user"
                },
                receiverId: {
                    type: Schema.Types.ObjectId,
                    ref: "user"
                },
                mediaType: {
                    type: String,
                    enum: ["text", "image", "file", "emoji"],
                    default: "text"
                },
                messageStatus: {
                    type: String,
                    enum: ["Read", "Unread"],
                    default: "Unread"
                },
                message: {
                    type: String
                },
                thumbnail: {
                    type: String
                },
                type: {
                    type: String
                },
                messageId: {
                    type: Schema.Types.ObjectId,
                    ref: "chat"
                },
                replyMessage: {
                    type: String
                },
                replyMessageType: {
                    type: String
                },
                replySenderId: {
                    type: Schema.Types.ObjectId,
                    ref: "user"
                },
                senderDelete: {
                    type: Boolean,
                    default: false
                },
                receiverDelete: {
                    type: Boolean,
                    default: false
                },
                createdAt: {
                    type: Date
                },
                isDeleted: {
                    type: Boolean,
                    default: false
                }
            },
        ],
        p2pAdvertisementId: { type: Schema.Types.ObjectId, ref: 'p2pAdvertisement' },
        lockedAmountP2PId: { type: Schema.Types.ObjectId, ref: 'lockedAmountP2P' },
        clearStatus: { type: Boolean, default: false },
        status: { type: String, default: status.ACTIVE }
    },
    options
);



chatSchema.plugin(mongoosePaginate);
chatSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("chat", chatSchema);
