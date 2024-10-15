import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import auth from "../../../../helper/auth";
import { userServices } from '../../services/user';
const { userCheck, findUser, } = userServices;
import { notificationServices } from '../../services/notification';
const { createNotification, findNotification, updateNotification, multiUpdateNotification, notificationList, notificationListWithSort } = notificationServices;

export class notificationController {


    async getNotificationList(req) {
        let responses, unReadCount = 0;
        try {
            return new Promise(async (resolve, reject) => {
                const responseData = await notificationListWithSort({ userId: req.userId, status: { $ne: status.DELETE } })
                for (let i = 0; i < responseData.length; i++) {
                    if (responseData[i].isRead === false) {
                        unReadCount += 1;
                    }
                }
                let obj = {
                    data: responseData,
                    unReadCount: unReadCount
                }
                responses = ({ responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: obj });
                resolve(responses);
            })
        } catch (error) {
            responses = (error);
            reject(responses);
        }
    }


    async createNotification(req, res, next) {
        const validationSchema = {
            title: Joi.string().required(),
            description: Joi.string().optional(),
            notificationType: Joi.string().optional(),
            image: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            var notificationResult = await createNotification(validatedBody);
            return res.json(new response(notificationResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /notification/notification/{_id}:
     *   get:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: get details of particular notification with _id
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async viewNotification(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var notificationResult = await findNotification({ _id: _id, status: { $ne: status.DELETE } });
            if (!notificationResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(notificationResult, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /notification/notification:
     *   delete:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: deleteNotification with _id 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async deleteNotification(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const { _id } = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var notificationResult = await findNotification({ _id: _id, status: { $ne: status.DELETE } });
            if (!notificationResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            var result = await updateNotification({ _id: notificationResult._id }, { status: status.DELETE });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /notification/listNotification:
     *   get:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: listNotification
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async listNotification(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            // let dataResults = await notificationList({ userId: userResult._id, status: { $ne: status.DELETE } });
            // if (dataResults.length == 0) {
            //     throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            // } else {
            //     return res.json(new response(dataResults, responseMessage.DATA_FOUND));
            // }
            let unReadCount = 0
            const responseData = await notificationListWithSort({ userId: userResult._id, status: { $ne: status.DELETE } })
            for (let i = 0; i < responseData.length; i++) {
                if (responseData[i].isRead === false) {
                    unReadCount += 1;
                }
            }
            let obj = {
                data: responseData,
                unReadCount: unReadCount
            }
            return res.json(new response(obj, responseMessage.DATA_FOUND));

        }
        catch (error) {
            console.log(error)
            return next(error);
        }

    }

    /**
     * @swagger
     * /notification/readNotification:
     *   get:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: readNotification for user when he See the notification isRead for that notification will be true
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async readNotification(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await multiUpdateNotification({ userId: userResult._id }, { isRead: true });
            return res.json(new response(result, responseMessage.DETAILS_FETCHED));
        }
        catch (error) {
            return next(error);
        }
    }

}

export default new notificationController()
