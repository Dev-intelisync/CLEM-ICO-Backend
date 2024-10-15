import util from "../helper/util";
import notificationModel from "../models/notification";

module.exports = {

    promiseNotification(userId, deviceToken, deviceType, subject, body, notificationType, notifyId) {
        return new Promise((resolve, reject) => {
            let notifyObj = {
                userId: userId,
                subject: subject,
                body: body,
                stackId: notifyId,
                notificationType: notificationType
            }
            switch (notificationType) {
                case "STACK_REPLY":
                    notifyObj.userId = userId
                    break;
                case "PAY_WITH_CRYPTO":
                    notifyObj.userId = userId
                    break;
                case "KYC_STATUS":
                    notifyObj.userId = userId
                    break;
                case "MONEY_TRANSFER_DEPOSITE":
                    notifyObj.userId = userId
                    break;
                default:
                    break;
            }
            if (deviceToken != null || deviceToken != undefined) {
                console.log("devicetoken in notification util===>", deviceToken)
                util.pushNotification(deviceToken, subject, body, (err, result) => {
                    if (err) {
                        console.log(err)
                        new notificationModel(notifyObj).save((saveErr, saveResult) => {
                            if (saveErr) {
                                console.log(saveErr)
                                return reject(saveErr)
                            } else {
                                console.log(err)
                                return resolve(saveResult)
                            }
                        })
                    } else {
                        new notificationModel(notifyObj).save((saveErr, saveResult) => {
                            if (saveErr) {
                                console.log(saveErr)
                                return reject(saveErr)
                            } else {
                                console.log(err)
                                return resolve(saveResult)
                            }
                        })
                    }
                })
            } else {
                new notificationModel(notifyObj).save((saveErr, saveResult) => {
                    if (saveErr) {
                        console.log(saveErr)
                        return reject(saveErr)
                    } else {
                        return resolve(saveResult)
                    }
                })
            }
        })
    },


}