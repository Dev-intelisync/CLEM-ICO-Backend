import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import coinIndex from "../../../../enums/coinIndex";
import kycApprove from '../../../../enums/kyc'
import stake from "../../../../enums/stake";
import transactionTitle from "../../../../enums/transactionTitle";
import appealStatus from '../../../../enums/appeal';
import notification from '../../../../helper/notificationUtil';

import { userServices } from '../../services/user';
import { kycServices } from '../../services/kyc';
import { stakeServices } from '../../services/stake'
import { coinServices } from '../../services/coin';
import { stakeInterestServices } from '../../services/stakeInterest'
import { walletServices } from '../../services/wallet'
import { tutorialServices } from '../../services/tutorial'
import { bannerServices } from '../../services/banner'

const { createBanner, findBanner, updateBanner, bannerList } = bannerServices
const { createTutorial, findTutorial, updateTutorial, updateTutorialById, tutorialList } = tutorialServices
const { createWallet, findWallet, updateWallet, walletList, paginateSearchWallet } = walletServices
const { createStakeInterest, findStakeInterest, updateStakeInterest, stakeInterestList } = stakeInterestServices
const { createCoin, findCoin, updateCoin, coinList } = coinServices
const { createStake, findStake, updateStake, stakeList, paginateSearchStake, aggregateSearchStake } = stakeServices
const { createKYC, findKYC, updateKYC, KYCList, paginateSearchKYC, aggregateSearchKyc, KYCCount } = kycServices
const { checkUserExists, userFindList, userList, emailMobileExist, createUser, userCount, findUser, findUserData, updateUser, updateUserById, paginateSearch, insertManyUser, dealerPaginateSearch, walletAddressExist, findCount } = userServices;

import { logHistoryServices } from '../../services/logHistory';
const { createLogHistory, findLogHistory, updateLogHistory, logHistoryList, logHistoryWithPagination, paginateSearchLogHistory } = logHistoryServices;

import { virtualDenaroServices } from '../../services/virtualDenaro';
const { findVirtualDenaro, updateVirtualDenaro } = virtualDenaroServices

import { stakeRequestServices } from '../../services/stakeRequest'
const { createStakeRequest, findStakeRequest, updateStakeRequest, stakeRequestList, paginateSearchStakeRequest } = stakeRequestServices;

import { transactionServices } from '../../services/transaction';
const { createTransaction, findTransaction, updateTransaction, transactionList, transactionHistory } = transactionServices;

import { p2pAdvertisementServices } from '../../services/p2pAdvertisement';
const { createP2PAdvertisement, findP2PAdvertisement, updateP2PAdvertisement, p2pAdvertisementList } = p2pAdvertisementServices;

import { bankServices } from '../../services/bank'
const { createBank, findBank, updateBank, bankList, paginateSearchBank, aggregateSearchBank } = bankServices;

import transStatusType from '../../../../enums/transactionStatusType'
import transactionType from '../../../../enums/transactionType'

import { feeServices } from '../../services/fee'
const { createFee, findFee, updateFee, feeList } = feeServices;

import { subscribeServices } from '../../services/subscribe'
const { createSubscribe, findSubscribe, updateSubscribe, subscribeList, paginateSearchSubscribe } = subscribeServices;

import ip from 'ip';
import coinType, { XRP } from '../../../../enums/coinType';

import { appealServices } from '../../services/appeal';
const { createAppeal, findAppeal, updateAppeal, listAppeal, paginateAppeal, aggregateSearchAppeal } = appealServices;

import { chatServices } from '../../services/chat';
const { createChat, findChat, updateChat, findChatWithPopulate, findChatAndPopulate, viewChat, updateManyChat, chatList, findChatMessage, chatBlock, findChatMessages, updateMessage } = chatServices;

import { lockedAmountP2PServices } from '../../services/lockedAmountP2P';
const { createLockedAmountP2P, findLockedAmountP2P, updateLockedAmountP2P, listLockedAmountP2P, paginateLockedAmountP2P, totalLockedAmount } = lockedAmountP2PServices;

import { settlementStatusServices } from '../../services/settlementStatus';
const { createSettlementStatus, findSettlementStatus, updateSettlementStatus, settlementStatusList, paginateSearchSettlementStatus } = settlementStatusServices;
import settlementStatus from "../../../../enums/settlementStatus";

import { notificationServices } from '../../services/notification';
const { createNotification, findNotification, updateNotification, multiUpdateNotification, notificationList, notificationListWithSort } = notificationServices;

//****************************** blockchain funtion ********************************** */
import btcFunc from '../../../../helper/blockchain/btc';
import ethFunc from '../../../../helper/blockchain/eth';
import bnbFunc from '../../../../helper/blockchain/bnb';
import maticFunc from '../../../../helper/blockchain/matic';
import avaxFunc from '../../../../helper/blockchain/avax';
import erc20Func from '../../../../helper/blockchain/erc20';
import erc20TransferFunc from '../../../../helper/blockchain/erc20Transfer';
import changellyFunc from '../../../../helper/changelly';
import vdTokenFunc from '../../../../helper/blockchain/vdToken';
//****************************** blockchain funtion ********************************** */
export class adminController {

    /**
     * @swagger
     * /admin/login:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: Admin login with email and Password
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: login
     *         description: login  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/login'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async login(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required(),
        }
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var results
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, password } = validatedBody;
            let userResult = await findUser({ email: email, userType: userType.ADMIN, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            if (!bcrypt.compareSync(password, userResult.password)) {
                throw apiError.conflict(responseMessage.INCORRECT_LOGIN)
            } else {
                var token = await commonFunction.getToken({ id: userResult._id, email: userResult.email, mobileNumber: userResult.mobileNumber, userType: userResult.userType });
                results = {
                    _id: userResult._id,
                    email: email,
                    speakeasy: userResult.speakeasy,
                    userType: userResult.userType,
                    token: token,
                }
            }
            await createLogHistory({ userId: userResult._id, ip_Address: ip.address(), browser: req.headers['user-agent'], userType: userResult.userType, email: userResult.email })
            return res.json(new response(results, responseMessage.LOGIN));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/updateAdminProfile:
   *   put:
   *     tags:
   *       - ADMIN
   *     description: updateAdminProfile with all basic details he Want to update in future
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: email
   *         description: email
   *         in: formData     
   *         required: false
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: false
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         description: profilePic     
   *         in: formData
   *         type: file
   *         required: false
   *       - name: address
   *         description: address     
   *         in: formData
   *         required: false
   *       - name: city
   *         description: city     
   *         in: formData
   *         required: false
   *       - name: country
   *         description: country     
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async updateAdminProfile(req, res, next) {
        const validationSchema = {
            firstName: Joi.string().allow('').optional(),
            lastName: Joi.string().allow('').optional(),
            email: Joi.string().allow('').optional(),
            countryCode: Joi.string().allow('').optional(),
            mobileNumber: Joi.string().allow('').optional(),
            profilePic: Joi.string().allow('').optional(),
            address: Joi.string().allow('').optional(),
            city: Joi.string().allow('').optional(),
            country: Joi.string().allow('').optional(),
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var updated;
            let validatedBody = await Joi.validate(req.body, validationSchema);

            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let userExist = await emailMobileExist(validatedBody.mobileNumber, validatedBody.email, userResult._id)
            if (userExist) {
                if (userExist.email == validatedBody.email) {
                    throw apiError.notFound(responseMessage.EMAIL_EXIST)
                } else {
                    throw apiError.notFound(responseMessage.MOBILE_EXIST)
                }
            }
            var { files } = req;
            if (files) {
                validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
            }
            updated = await updateUserById(userResult._id, validatedBody);
            return res.json(new response(updated, responseMessage.PROFILE_UPDATED));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/viewUser:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: view basic Details of any USER with _id
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
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async viewUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(userInfo, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/verifyOTP:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: verifyOTP by DMIN on plateform when he want to reset Password
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: verifyOTP
     *         description: verifyOTP
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/verifyOTP'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async verifyOTP(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
            otp: Joi.number().required()
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, otp } = validatedBody;
            var userResult = await findUserData({ email: email, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (new Date().getTime() > userResult.otpTime) {
                throw apiError.badRequest(responseMessage.OTP_EXPIRED);
            }
            if (userResult.otp != otp) {
                throw apiError.badRequest(responseMessage.INCORRECT_OTP);
            }
            var updateResult = await updateUser({ _id: userResult._id }, { accountVerify: true })
            var token = await commonFunction.getToken({ id: updateResult._id, email: updateResult.email, mobileNumber: updateResult.mobileNumber, userType: updateResult.userType });
            var obj = {
                _id: updateResult._id,
                email: updateResult.email,
                token: token
            }
            return res.json(new response(obj, responseMessage.OTP_VERIFY));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/forgotPassword:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: forgotPassword by ADMIN on plateform when he forgot password
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: forgotPassword
     *         description: forgotPassword  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/forgotPassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async forgotPassword(req, res, next) {
        var validationSchema = {
            email: Joi.string().required()
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            var userResult = await findUser({ email: email, status: { $ne: status.DELETE } })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                var otp = commonFunction.getOTP();
                var newOtp = otp;
                var time = Date.now() + 180000;
                await commonFunction.sendMailOtpForgetAndResendAWS(email, otp);
                var updateResult = await updateUser({ _id: userResult._id }, { $set: { otp: newOtp, otpTime: time } })
                return res.json(new response(updateResult, responseMessage.OTP_SEND));
            }
        }
        catch (error) {
            console.log(error)
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/resetPassword:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: Change password or reset password When ADMIN need to chnage
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: password
     *         description: password
     *         in: formData
     *         required: true
     *       - name: confirmPassword
     *         description: confirmPassword
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Your password has been successfully changed.
     *       404:
     *         description: This user does not exist.
     *       422:
     *         description: Password not matched.
     *       500:
     *         description: Internal Server Error
     *       501:
     *         description: Something went wrong!
     */
    async resetPassword(req, res, next) {
        const validationSchema = {
            password: Joi.string().required(),
            confirmPassword: Joi.string().required()
        };
        try {
            const { password, confirmPassword } = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });;
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                if (password == confirmPassword) {
                    let update = await updateUser({ _id: userResult._id }, { password: bcrypt.hashSync(password) });
                    return res.json(new response(update, responseMessage.PWD_CHANGED));
                }
                else {
                    throw apiError.notFound(responseMessage.PWD_NOT_MATCH);
                }
            }
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/resendOTP:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: after OTP expire or not get any OTP with that frameOfTime ADMIN resendOTP for new OTP
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: resendOTP
     *         description: resendOTP
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/resendOTP'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async resendOTP(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            var userResult = await findUser({ email: email, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var otp = commonFunction.getOTP();
            var otpTime = new Date().getTime() + 180000;
            await commonFunction.sendMailOtpForgetAndResendAWS(email, otp);
            var updateResult = await updateUser({ _id: userResult._id }, { otp: otp, otpTime: otpTime });
            return res.json(new response(updateResult, responseMessage.OTP_SEND));
        }
        catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/changePassword:
     *   patch:
     *     tags:
     *       - ADMIN
     *     description: changePassword By ADMIN when ADMIN want to change his password on Plateform
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: changePassword
     *         description: changePassword
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/changePassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async changePassword(req, res, next) {
        const validationSchema = {
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (!bcrypt.compareSync(validatedBody.oldPassword, userResult.password)) {
                throw apiError.badRequest(responseMessage.PWD_NOT_MATCH);
            }
            let updated = await updateUserById(userResult._id, { password: bcrypt.hashSync(validatedBody.newPassword) });
            return res.json(new response(updated, responseMessage.PWD_CHANGED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/adminProfile:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: get his own profile details with adminProfile API
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
    async adminProfile(req, res, next) {
        try {
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            return res.json(new response(adminResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/deleteUser:
     *   delete:
     *     tags:
     *       - ADMIN
     *     description: deleteUser When Admin want to delete Any USER from plateform
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: deleteUser
     *         description: deleteUser
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/deleteUser'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async deleteUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, userType: { $ne: "ADMIN" }, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let deleteRes = await updateUser({ _id: userInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/blockUnblockUser:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: blockUnblockUser When ADMIN want to block User or Unblock USER on Plateform
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: blockUnblockUser
     *         description: blockUnblockUser
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/blockUnblockUser'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async blockUnblockUser(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var userInfo = await findUser({ _id: validatedBody._id, userType: { $ne: "ADMIN" }, status: { $ne: status.DELETE } });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (userInfo.status == status.ACTIVE) {
                let blockRes = await updateUser({ _id: userInfo._id }, { status: status.BLOCK });
                return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
            } else {
                let activeRes = await updateUser({ _id: userInfo._id }, { status: status.ACTIVE });
                return res.json(new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN));
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/listUser:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: List of all USER on plateform by ADMIN Call this listuser API
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: status1
     *         description: status1
     *         in: query
     *         required: false
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: fromDate
     *         description: fromDate
     *         in: query
     *         required: false
     *       - name: toDate
     *         description: toDate
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *       - name: userType1
     *         description: userType1
     *         in: query
     *         required: false
     *       - name: country
     *         description: country
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async listUser(req, res, next) {
        const validationSchema = {
            status1: Joi.string().allow('').optional(),
            userType1: Joi.string().allow('').optional(),
            search: Joi.string().allow('').optional(),
            fromDate: Joi.string().allow('').optional(),
            toDate: Joi.string().allow('').optional(),
            page: Joi.number().allow('').optional(),
            limit: Joi.number().allow('').optional(),
            country: Joi.string().allow('').optional(),
        };
        try {

            const validatedBody = await Joi.validate(req.query, validationSchema);

            let userResult = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let dataResults = await paginateSearch(validatedBody);
            if (dataResults.docs.length == 0) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }






















    //********************************* TRANSACTION MANAGEMENT API ********************************/

    /**
   * @swagger
   * /admin/transactionList:
   *   post:
   *     tags:
   *       - ADMIN TRANSACTION MANAGEMENT
   *     description: All USER to USER , USER to ADMIN ,ADMIN to USER,USER To OUTSIDER transaction that goes on Plateform will  get from this API transactionList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token .e ADMIn auth_token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: transactionType
   *         description: transactionType ?? Swap, Buy
   *         in: formData
   *         required: false
   *       - name: transactionStatus
   *         description: transactionStatus ?? Pending, Failed, Success, Cancelled
   *         in: formData
   *         required: false
   *       - name: coinName
   *         description: coinName ?? BNB, ETH, ETC, ERC20, AVAX, SOL, BTC
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async transactionList(req, res, next) {
        const validationSchema = {
            search: Joi.string().allow('').optional(),
            transactionType: Joi.string().allow('').optional(),
            transactionStatus: Joi.string().allow('').optional(),
            coinName: Joi.string().allow('').optional(),
            fromDate: Joi.string().allow('').optional(),
            toDate: Joi.string().allow('').optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id
            let result = await transactionHistory(validatedBody);
            if (result.docs.length === 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/viewTransaction/{_id}:
     *   get:
     *     tags:
     *       - ADMIN TRANSACTION MANAGEMENT
     *     description: ADMIN will see particular transaction details by viewTransaction API
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
    async viewTransaction(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            let userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await findTransaction({ _id: validatedBody._id });
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



    //********************************* SUBSCRIBE MANAGEMENT API ********************************/


    /**
   * @swagger
   * /admin/subscribeList:
   *   post:
   *     tags:
   *       - ADMIN SUBSCRIBE
   *     description: All subscriber that subscribe on Plateform will get with subscribeList by ADMIN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async subscribeList(req, res, next) {
        const validationSchema = {
            search: Joi.string().allow('').optional(),
            fromDate: Joi.string().allow('').optional(),
            toDate: Joi.string().allow('').optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let result = await paginateSearchSubscribe(validatedBody);
            if (result.docs.length === 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/subscribeView:
   *   get:
   *     tags:
   *       - ADMIN SUBSCRIBE
   *     description: In this particular subscriber details will get by ADMIN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: subscribeId
   *         description: subscribeId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async subscribeView(req, res, next) {
        const validationSchema = {
            subscribeId: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let result = await findSubscribe({ _id: validatedBody.subscribeId, status: { $ne: status.DELETE } });
            if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/logHistoryList:
   *   post:
   *     tags:
   *       - LOG HISTORY
   *     description: logHistoryList for all the user when he logIN on plateform and what kind of browser he use for this project login, will store and display with this API logHistoryList 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: userType
   *         description: userType
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async logHistoryList(req, res, next) {
        const validationSchema = {
            search: Joi.string().allow('').optional(),
            fromDate: Joi.string().allow('').optional(),
            toDate: Joi.string().allow('').optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            userType: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let result = await paginateSearchLogHistory(validatedBody);
            if (result.docs.length === 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/logHistoryView:
   *   get:
   *     tags:
   *       - LOG HISTORY
   *     description: logHistoryView with particular log details of USER with logId
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: logId
   *         description: logId
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async logHistoryView(req, res, next) {
        const validationSchema = {
            logId: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let result = await findLogHistory({ _id: validatedBody.logId });
            if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/userRefferalCountEarning:
    *   get:
    *     tags:
    *       - ADMIN
    *     description: userRefferalCountEarning by ADMIN for USER
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: userId
    *         description: userId
    *         in: query
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async userRefferalCountEarning(req, res, next) {

        try {
            let userResult = await findUser({ _id: req.query.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var earning = 0
            let [dataRes, totalRefferalUser] = await Promise.all([stakeList({ userId: userResult._id, status: { $ne: status.DELETE } }), findCount({ refereeCode: userResult.referralCode })])
            if (!dataRes) {
                earning = 0
            }
            for (let i = 0; i < dataRes.length; i++) {
                earning += dataRes[i].earning
            }
            let obj = {
                totalRefferalUserShare: totalRefferalUser,
                Totalearning: earning
            }
            return res.json(new response(obj, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    //********************************* APPEAL MANAGEMENT API ********************************/


    /**
    * @swagger
    * /admin/appeal:
    *   get:
    *     tags:
    *       - APPEAL MANAGEMENT
    *     description: list appeal by ADMIN that requested by USER
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: page
    *         description: page
    *         in: query
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: query
    *         required: false
    *       - name: appealStatus
    *         description: appealStatus
    *         in: query
    *         enum: ["PENDING","CANCELLED","COMPLETED"]
    *         required: false
    *       - name: bankType
    *         description: bankType
    *         in: query
    *         enum: ["UPI","BANK"]
    *         required: false
    *       - name: country
    *         description: country
    *         in: query
    *         required: false
    *       - name: fromDate
    *         description: fromDate
    *         in: query
    *         required: false
    *       - name: toDate
    *         description: toDate
    *         in: query
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async listAppeal(req, res, next) {
        const validationSchema = {
            country: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            appealStatus: Joi.string().optional(),
            bankType: Joi.string().optional(),
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await aggregateSearchAppeal(validatedBody);
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        }
        catch (error) {
            console.log('Error: ', error)
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/appeal/{_id}:
    *   get:
    *     tags:
    *       - APPEAL MANAGEMENT
    *     description: view appeal by admin with _id
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: _id
    *         description: _id of appeal
    *         in: path
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async viewAppeal(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        }
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let result = await findAppeal({ _id: validatedBody._id });
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log('Error: ', error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/chat/{chatId}:
     *   get:
     *     tags:
     *       - CHAT
     *     description: view single chat by admin
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: chatId
     *         description: chatId
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async viewChat(req, res, next) {
        const validationSchema = {
            chatId: Joi.string().required(),
        }
        try {

            const { chatId } = await Joi.validate(req.params, validationSchema);

            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            var chatResult = await viewChat({ _id: chatId, status: status.ACTIVE });
            if (!chatResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(chatResult, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log('Error: ', error)
            return next(error)
        }
    }


    /**
     * @swagger
     * /admin/confirmP2PAdvertisementPayment:
     *   patch:
     *     tags:
     *       - P2P_ADVERTISEMENT MANAGEMENT
     *     description: p2pAdvertisementPayment received
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: p2pAdvertisementId
     *         description: _id of p2pAdvertisement
     *         in: formData
     *         required: true
     *       - name: chatId
     *         description: _id of chat
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async confirmP2PAdvertisementPayment(req, res, next) {
        const validationSchema = {
            p2pAdvertisementId: Joi.string().required(),
            chatId: Joi.string().required(),
        }
        try {
            let result;
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let p2pAdvertisementResult = await findP2PAdvertisement({ _id: validatedBody.p2pAdvertisementId, status: { $ne: status.DELETE } });
            if (!p2pAdvertisementResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let chatDetails = await findChat({ _id: validatedBody.chatId, status: status.ACTIVE })
            let receiverId = chatDetails.receiverId._id;
            let lockedAmountResult = await findLockedAmountP2P({ _id: chatDetails.lockedAmountP2PId._id, status: status.ACTIVE });
            if (lockedAmountResult.isTransfered == true) {
                throw apiError.conflict(responseMessage.TRANSACTION_EXIST);
            }
            let [senderWallet, receiverWallet] = await Promise.all([
                findWallet({ userId: p2pAdvertisementResult.userId._id, coinName: p2pAdvertisementResult.asset }),
                findWallet({ userId: receiverId, coinName: p2pAdvertisementResult.asset }),
            ])
            let [updateSender, updateReceiver, transferSuccess, updateP2P] = await Promise.all([
                updateWallet({ _id: senderWallet._id }, { $inc: { balance: -lockedAmountResult.quantity } }),
                updateWallet({ _id: receiverWallet._id }, { $inc: { balance: lockedAmountResult.quantity } }),
                updateLockedAmountP2P({ _id: lockedAmountResult._id }, { $set: { isTransfered: true, tradeStatus: transStatusType.SUCCESS } }),
                updateP2PAdvertisement({ _id: p2pAdvertisementResult._id }, { $inc: { quantity: -lockedAmountResult.quantity } })
            ]);
            if (updateP2P.quantity < updateP2P.minOrderLimit) {
                await updateP2PAdvertisement({ _id: updateP2P._id }, { $set: { p2pStatus: p2pStatus.Disabled } });
                await updateWallet({ _id: senderWallet._id }, { $inc: { balance: updateP2P.quantity } });
            }
            let senderObj = {
                title: transactionTitle.P2P_TRANSACTION,
                userId: p2pAdvertisementResult.userId._id,
                p2pAdvertisementId: p2pAdvertisementResult._id,
                coinName: p2pAdvertisementResult.asset,
                amount: lockedAmountResult.price,
                quantity: lockedAmountResult.quantity,
                fromAddress: senderWallet.address,
                toAddress: receiverWallet.address,
                transactionType: transactionType.TRANSFER,
                transStatusType: transStatusType.SUCCESS
            }
            let receiverObj = {
                title: transactionTitle.P2P_TRANSACTION,
                userId: receiverId,
                p2pAdvertisementId: p2pAdvertisementResult._id,
                coinName: p2pAdvertisementResult.asset,
                amount: lockedAmountResult.price,
                quantity: lockedAmountResult.quantity,
                fromAddress: senderWallet.address,
                toAddress: receiverWallet.address,
                transactionType: transactionType.DEPOSIT,
                transStatusType: transStatusType.SUCCESS
            }
            await Promise.all([createTransaction(senderObj), createTransaction(receiverObj), updateAppeal({ chatId: validatedBody.chatId }, { $set: { appealStatus: appealStatus.COMPLETED } })]);
            return res.json(new response(updateReceiver, responseMessage.TRANSACTION_SUCCESS));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/dashboard:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: dashboard section for all counts of USER,PENDING_KYC,APPROVE_KYC,STAKE,ACTIVE_USER,BLOCK_USER,TOTAL_STAKE_FUNCD_TOTAL_EARN,TOTAL_COINS Counts
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
    async dashboard(req, res, next) {
        try {
            let [adminResult, activeUser, blockUser, totalRegisterUser, pendingKYC, approveKYC, rejectKYC, dataRes] = await Promise.all([
                findUser({ _id: req.userId, status: { $ne: status.DELETE } }),
                findCount({ status: status.ACTIVE, otpVerification: true }),
                findCount({ status: status.BLOCK, otpVerification: true }),
                findCount({ status: { $ne: status.DELETE }, otpVerification: true }),
                KYCCount({ approveStatus: kycApprove.PENDING, status: { $ne: status.DELETE } }),
                KYCCount({ approveStatus: kycApprove.APPROVE, status: { $ne: status.DELETE } }),
                KYCCount({ approveStatus: kycApprove.REJECT, status: { $ne: status.DELETE } }),
                stakeList({ status: { $ne: status.DELETE } })])
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let earning = 0
            let totalStake = 0
            if (dataRes.length != 0) {
                for (let i = 0; i < dataRes.length; i++) {
                    earning += dataRes[i].earning
                    totalStake += dataRes[i].price
                }
            }
            let obj = {
                activeUser: activeUser,
                blockUser: blockUser,
                totalRegisterUser: totalRegisterUser,
                pendingKYC: pendingKYC,
                approveKYC: approveKYC,
                rejectKYC: rejectKYC,
                totalCoin: 10,
                totalToken: 3,
                earning: earning,
                tolatStake: totalStake
            }
            return res.json(new response(obj, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



    /**
   * @swagger
   * /admin/transfer:
   *   get:
   *     tags:
   *       - ADMIN
   *     description: transfer money/COINS/TOKEN i.e USDT,MATIC,VD  to INSIDE plateform USER as well as OutSide plteform USER too by ADMIN in which inside USER case databse also maintain for ADMIN and USER ,For Outside User(i.e not exist in database) only ADMIN will update in database for balance
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: userId
   *         in: query
   *         required: true
   *       - name: coinTypeName
   *         description: coinTypeName ? USDT || USDC || LTC || BTC || ETH || BNB || MATIC || AVAX || SOLANA || VD
   *         in: query
   *         required: true
   *       - name: hotWalletAddress
   *         description: hotWalletAddress  i.e ADMIN walletAddress
   *         in: query
   *         required: true
   *       - name: coldWalletAddress
   *         description: coldWalletAddress  i.e Receiver wallet Address
   *         in: query
   *         required: true
   *       - name: coinAmount
   *         description: coinAmount
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async transfer(req, res, next) {
        // const validationSchema = {
        //     coinTypeName: Joi.string().valid([coinType.USDT, coinType.USDC, coinType.BUSD, coinType.BTC, coinType.ETH, coinType.BNB, coinType.MATIC, coinType.AVAX, coinType.VD]).required(),
        //     hotWalletAddress: Joi.string().required(),
        //     coldWalletAddress: Joi.string().required(),
        //     coinAmount: Joi.string().required(),
        //     userId: Joi.string().required()
        // };
        try {
            let transferRes;
            const { userId, hotWalletAddress, coldWalletAddress, coinTypeName, walletAddress, coinAmount } = req.query;
            let [userResult, adminResult, adminPrivateKey] = await Promise.all([
                findUser({ _id: userId, status: { $ne: status.DELETE } }),
                findUser({ userType: userType.ADMIN, status: { $ne: status.DELETE } }),
            ]);

            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const [userWalletDetails, receiverWalletDetails, adminWalletDetails] = await Promise.all([
                findWallet({ userId: adminResult._id, coinType: coinTypeName }),
                findWallet({ address: coldWalletAddress, coinType: coinTypeName }),
            ]);
            if (userWalletDetails.balance < coinAmount) throw apiError.notAllowed(responseMessage.INSUFFICIENT_FUND);
            if (coinTypeName == coinType.VD) {
                const balance = await getBalanceFunction(userWalletDetails.address, coinTypeName);
                if (balance < coinAmount) throw apiError.notAllowed(responseMessage.INSUFFICIENT_FUND);
                const transactionRes = await findTransaction({ userId: adminResult._id, coinName: coinTypeName, fromAddress: userWalletDetails.address, transStatusType: transStatusType.PENDING });
                if (!receiverWalletDetails) {
                    transferRes = await transferFunction(adminResult._id, coldWalletAddress, coinAmount, coinTypeName);
                    if (transferRes.status === true) {
                        await Promise.all([
                            updateWallet({ _id: userWalletDetails._id }, { $inc: { balance: -coinAmount } }),
                            createTransaction({
                                userId: userWalletDetails.userId,
                                coinName: coinTypeName,
                                quantity: coinAmount,
                                fromAddress: userWalletDetails.address,
                                toAddress: coldWalletAddress,
                                transactionType: transactionType.TRANSFER
                            }),

                            createNotification({
                                title: 'MONEY_TRANSFER',
                                description: `${coinAmount} ${coinTypeName} Money Transfer.`,
                                userId: userResult._id,
                                coinName: coinTypeName,
                                quantity: coinAmount,
                                fromAddress: userWalletDetails.address,
                                toAddress: walletAddress,
                                amount: coinAmount,
                                transactionType: transactionType.TRANSFER
                            })
                        ]);
                        return res.json(new response({}, responseMessage.TRANSACTION_SUCCESS));
                    }

                    throw apiError.notAllowed(responseMessage.TRANSACTION_FAILED);
                }

                transferRes = await transferFunction(adminResult._id, coldWalletAddress, coinAmount, coinTypeName);
                if (transferRes.status === true) {
                    await Promise.all([
                        updateWallet({ _id: userWalletDetails._id }, { $inc: { balance: -coinAmount } }),
                        updateWallet({ _id: receiverWalletDetails._id }, { $inc: { balance: coinAmount } }),
                        createTransaction({
                            userId: userWalletDetails.userId,
                            coinName: coinTypeName,
                            quantity: coinAmount,
                            fromAddress: userWalletDetails.address,
                            toAddress: receiverWalletDetails.address,
                            transactionType: transactionType.TRANSFER
                        }),
                        createTransaction({
                            userId: receiverWalletDetails.userId,
                            coinName: coinTypeName,
                            quantity: coinAmount,
                            fromAddress: receiverWalletDetails.address,
                            toAddress: userWalletDetails.address,
                            transactionType: transactionType.TRANSFER
                        }),
                        createNotification({
                            title: 'MONEY_TRANSFER',
                            description: `${coinAmount} ${coinTypeName} Money Transfer.`,
                            userId: userResult._id,
                            coinName: coinTypeName,
                            quantity: coinAmount,
                            fromAddress: userWalletDetails.address,
                            toAddress: receiverWalletDetails.address,
                            transactionType: transactionType.TRANSFER
                        })
                    ]);
                    return res.json(new response({}, responseMessage.TRANSACTION_SUCCESS));
                }
                throw apiError.notAllowed(responseMessage.TRANSACTION_FAILED);
            }
            const transactionRes = await findTransaction({ userId: userId, coinName: coinTypeName, fromAddress: userWalletDetails.address, transStatusType: transStatusType.PENDING });
            // console.log("==transaction check=subhra=", transactionRes)
            // if (!transactionRes || transactionRes === null) throw apiError.notAllowed(responseMessage.ALREADY_COMPLETED);

            if (!receiverWalletDetails || receiverWalletDetails === null) {
                transferRes = await transferFunction(adminResult._id, coldWalletAddress, coinAmount, coinTypeName);
                if (transferRes.status === true) {
                    await Promise.all([
                        updateWallet({ _id: userWalletDetails._id }, { $inc: { balance: -coinAmount } }),
                        // updateTransaction({ _id: transactionRes._id }, {
                        //     transactionType: transactionType.TRANSFER,
                        //     transStatusType: transStatusType.SUCCESS
                        // }),

                        createNotification({
                            title: 'MONEY_TRANSFER',
                            description: `${coinAmount} ${coinTypeName} Money Transfer.`,
                            userId: userResult._id,
                            coinName: coinTypeName,
                            quantity: coinAmount,
                            fromAddress: userWalletDetails.address,
                            toAddress: walletAddress,
                            amount: coinAmount,
                            transactionType: transactionType.TRANSFER
                        })
                    ]);
                    console.log("after transaction here it will reflect==")
                    return res.json(new response({}, responseMessage.TRANSACTION_SUCCESS));
                }

                throw apiError.notAllowed(responseMessage.TRANSACTION_FAILED);
            }
            await Promise.all([
                updateWallet({ _id: userWalletDetails._id }, { $inc: { balance: -coinAmount } }),
                updateWallet({ _id: receiverWalletDetails._id }, { $inc: { balance: coinAmount } }),
                // createTransaction({
                //     userId: userWalletDetails.userId,
                //     coinName: coinTypeName,
                //     quantity: coinAmount,
                //     fromAddress: userWalletDetails.address,
                //     toAddress: receiverWalletDetails.address,
                //     transactionType: transactionType.TRANSFER
                // }),
                // createTransaction({
                //     userId: receiverWalletDetails.userId,
                //     coinName: coinTypeName,
                //     quantity: coinAmount,
                //     fromAddress: receiverWalletDetails.address,
                //     toAddress: userWalletDetails.address,
                //     transactionType: transactionType.TRANSFER
                // }),
                createNotification({
                    title: 'MONEY_TRANSFER',
                    description: `${coinAmount} ${coinTypeName} Money Transfer.`,
                    userId: userResult._id,
                    coinName: coinTypeName,
                    quantity: coinAmount,
                    fromAddress: userWalletDetails.address,
                    toAddress: receiverWalletDetails.address,
                    transactionType: transactionType.TRANSFER
                })
            ]);
            return res.json(new response({}, responseMessage.TRANSACTION_SUCCESS));
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/rejectP2PAdvertisementPayment:
     *   patch:
     *     tags:
     *       - P2P_ADVERTISEMENT MANAGEMENT
     *     description: p2pAdvertisementPayment reject by ADMIN 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: p2pAdvertisementId
     *         description: _id of p2pAdvertisement
     *         in: formData
     *         required: true
     *       - name: chatId
     *         description: _id of chat
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async rejectP2PAdvertisementPayment(req, res, next) {
        const validationSchema = {
            p2pAdvertisementId: Joi.string().required(),
            chatId: Joi.string().required(),
        }
        try {
            let result;
            const validatedBody = await Joi.validate(req.body, validationSchema);
            var adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
            }
            let chatDetails = await findChat({ _id: validatedBody.chatId, status: status.ACTIVE })
            let p2pAdvertisementResult = await findP2PAdvertisement({ _id: validatedBody.p2pAdvertisementId, status: { $ne: status.DELETE } });
            if (!p2pAdvertisementResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let lockedAmountResult = await findLockedAmountP2P({ _id: chatDetails.lockedAmountP2PId._id, status: { $ne: status.DELETE } });
            if (lockedAmountResult.tradeStatus == transStatusType.CANCEL) {
                throw apiError.conflict(responseMessage.P2P_TRADE_CANCELLED)
            }
            result = await updateLockedAmountP2P({ _id: lockedAmountResult._id }, { $set: { tradeStatus: transStatusType.CANCEL } });
            await updateAppeal({ chatId: validatedBody.chatId }, { $set: { appealStatus: appealStatus.CANCELLED } })
            return res.json(new response(result, responseMessage.TRANSACTION_SUCCESS));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/referralCountReferralAmount:
     *   get:
     *     tags:
     *       - ADMIN 
     *     description: referralCountReferralAmount by ADMIN
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
    async referralCountReferralAmount(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let [userRes, dataRes] = await Promise.all([findCount({ refereeCode: { $ne: "" }, otpVerification: true }), userFindList({ status: { $ne: status.DELETE }, otpVerification: true })])
            let amount = 0;
            if (dataRes.length != 0) {
                for (let i = 0; i < dataRes.length; i++) {
                    amount += dataRes[i].referralEaring
                }
            }
            let obje = {
                totalReferralAmount: amount,
                totalReferralCount: userRes
            }
            return res.json(new response(obje, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/addTutorial:
   *   post:
   *     tags:
   *       - Tutorial
   *     description: addTutorial on plateform by ADMIN for get tutorial details for USER on plateform how work functionality of this plateform woks
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: title
   *         description: title
   *         in: formData
   *         required: true
   *       - name: description
   *         description: description
   *         in: formData
   *         required: true
   *       - name: mediaUrl
   *         description: mediaUrl
   *         in: formData
   *         type: file
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async addTutorial(req, res, next) {
        const validationSchema = {
            title: Joi.string().required(),
            description: Joi.string().required(),
            mediaUrl: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var { files } = req;
            if (files.length != 0) {
                validatedBody.mediaUrl = await commonFunction.getImageUrl(req.files);
            }
            let savaRes = await createTutorial(validatedBody)
            return res.json(new response(savaRes, responseMessage.TUTORIAL_ADDED));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/editTutorial:
   *   put:
   *     tags:
   *       - Tutorial
   *     description: editTutorial ADMIN will able to update already added tutorial on Plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: tutorialId
   *         description: tutorialId
   *         in: formData
   *         required: true
   *       - name: title
   *         description: title
   *         in: formData
   *         required: false
   *       - name: description
   *         description: description
   *         in: formData
   *         required: false
   *       - name: mediaUrl
   *         description: mediaUrl
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async editTutorial(req, res, next) {
        const validationSchema = {
            tutorialId: Joi.string().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            mediaUrl: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let tutorialRes = await findTutorial({ _id: validatedBody.tutorialId, status: { $ne: status.DELETE } })
            if (!tutorialRes) {
                throw apiError.notFound(responseMessage.TUTORIAL_NOT_FOUND);
            }
            var { files } = req;
            if (files.length != 0) {
                validatedBody.mediaUrl = await commonFunction.getImageUrl(req.files);
            }
            let updateRes = await updateTutorial({ _id: tutorialRes._id }, validatedBody)
            return res.json(new response(updateRes, responseMessage.TUTORIAL_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/viewTutorial:
   *   get:
   *     tags:
   *       - Tutorial
   *     description: get particular tutorial details with tutorialId
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: tutorialId
   *         description: tutorialId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async viewTutorial(req, res, next) {
        const validationSchema = {
            tutorialId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let tutorialRes = await findTutorial({ _id: validatedBody.tutorialId, status: { $ne: status.DELETE } })
            if (!tutorialRes) {
                throw apiError.notFound(responseMessage.TUTORIAL_NOT_FOUND);
            }
            return res.json(new response(tutorialRes, responseMessage.TUTORIAL_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/listTutorial:
     *   get:
     *     tags:
     *       - Tutorial
     *     description: all tutorials details will list out with this API listTutorial
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: fromDate
     *         description: fromDate
     *         in: query
     *         required: false
     *       - name: toDate
     *         description: toDate
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async listTutorial(req, res, next) {
        const validationSchema = {
            search: Joi.string().allow('').optional(),
            fromDate: Joi.string().allow('').optional(),
            toDate: Joi.string().allow('').optional(),
            page: Joi.number().allow('').optional(),
            limit: Joi.number().allow('').optional()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let dataResults = await tutorialList(validatedBody);
            if (dataResults.docs.length == 0) {
                throw apiError.notFound(responseMessage.TUTORIAL_NOT_FOUND)
            }
            return res.json(new response(dataResults, responseMessage.TUTORIAL_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/updateContactUs:
   *   put:
   *     tags:
   *       - ADMIN
   *     description: updateContactUs by ADMIN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: twitter
   *         description: twitter
   *         in: formData
   *         required: false
   *       - name: facebook
   *         description: facebook
   *         in: formData
   *         required: false
   *       - name: website
   *         description: website
   *         in: formData
   *         required: false
   *       - name: instagram
   *         description: instagram
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async updateContactUs(req, res, next) {
        const validationSchema = {
            countryCode: Joi.string().allow('').optional(),
            mobileNumber: Joi.string().allow('').optional(),
            twitter: Joi.string().allow('').optional(),
            facebook: Joi.string().allow('').optional(),
            website: Joi.string().allow('').optional(),
            instagram: Joi.string().allow('').optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let updateRes = await updateUser({ _id: userResult._id }, { contactUs: validatedBody })
            return res.json(new response(updateRes, responseMessage.CONTACTUS_UPDATE));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/addBanner:
   *   post:
   *     tags:
   *       - BANNER
   *     description: addBanner for Users on plateform by ADMIN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: title
   *         description: title
   *         in: formData
   *         required: true
   *       - name: description
   *         description: description
   *         in: formData
   *         required: true
   *       - name: mediaUrl
   *         description: mediaUrl
   *         in: formData
   *         type: file
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async addBanner(req, res, next) {
        // const validationSchema = {
        //     title: Joi.string().required(),
        //     description: Joi.string().required(),
        //     mediaUrl: Joi.string().optional(),
        // };
        try {
            const validatedBody = await Joi.validate(req.body);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var { files } = req;
            if (files.length != 0) {
                validatedBody.mediaUrl = await commonFunction.getImageUrl(req.files);
            }
            let savaRes = await createBanner(validatedBody)
            return res.json(new response(savaRes, responseMessage.TUTORIAL_ADDED));
        } catch (error) {
            console.log("error", error)
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/editBanner:
   *   put:
   *     tags:
   *       - BANNER
   *     description: editBanner by ADMIn that already added on platform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: bannerId
   *         description: bannerId
   *         in: formData
   *         required: true
   *       - name: title
   *         description: title
   *         in: formData
   *         required: false
   *       - name: description
   *         description: description
   *         in: formData
   *         required: false
   *       - name: mediaUrl
   *         description: mediaUrl
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async editBanner(req, res, next) {
        const validationSchema = {
            bannerId: Joi.string().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            mediaUrl: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let bannerRes = await findBanner({ _id: validatedBody.bannerId, status: { $ne: status.DELETE } })
            if (!bannerRes) {
                throw apiError.notFound(responseMessage.BANNER_NOT_FOUND);
            }
            var { files } = req;
            if (files.length != 0) {
                validatedBody.mediaUrl = await commonFunction.getImageUrl(req.files);
            }
            let updateRes = await updateBanner({ _id: bannerRes._id }, validatedBody)
            return res.json(new response(updateRes, responseMessage.BANNER_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/viewBanner:
   *   get:
   *     tags:
   *       - BANNER
   *     description: viewBanner for particular banner details
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: bannerId
   *         description: bannerId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async viewBanner(req, res, next) {
        const validationSchema = {
            bannerId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let bannerRes = await findBanner({ _id: validatedBody.bannerId, status: { $ne: status.DELETE } })
            if (!bannerRes) {
                throw apiError.notFound(responseMessage.BANNER_NOT_FOUND);
            }
            return res.json(new response(bannerRes, responseMessage.BANNER_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
   * @swagger
   * /admin/listBanner:
   *   get:
   *     tags:
   *       - BANNER
   *     description: listBanner In which all banner listing will display
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async listBanner(req, res, next) {
        try {
            let bannerRes = await bannerList({ status: { $ne: status.DELETE } })
            if (bannerRes.length == 0) {
                throw apiError.notFound(responseMessage.BANNER_NOT_FOUND);
            }
            return res.json(new response(bannerRes, responseMessage.BANNER_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    //**********************Settlement Management ******************************************** */

    /**
      * @swagger
      * /admin/listPendingSettlement:
      *   post:
      *     tags:
      *       - SETTLEMENT_MANAGEMENT
      *     description: admin will able to see te settlement list when He has less funcd in wallet
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: search
      *         description: search
      *         in: formData
      *         required: false
      *       - name: fromDate
      *         description: fromDate
      *         in: formData
      *         required: false
      *       - name: toDate
      *         description: toDate
      *         in: formData
      *         required: false
      *       - name: page
      *         description: page
      *         in: formData
      *         type: integer
      *         required: false
      *       - name: limit
      *         description: limit
      *         in: formData
      *         type: integer
      *         required: false
      *     responses:
      *       200:
      *         description: Returns success message
      */
    async listPendingSettlement(req, res, next) {
        const validationSchema = {
            search: Joi.string().allow('').optional(),
            fromDate: Joi.string().allow('').optional(),
            toDate: Joi.string().allow('').optional(),
            page: Joi.number().allow('').optional(),
            limit: Joi.number().allow('').optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let settlementRes = await paginateSearchSettlementStatus(validatedBody)
            if (settlementRes.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(settlementRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /admin/viewSettlementDetails:
    *   get:
    *     tags:
    *       - SETTLEMENT_MANAGEMENT
    *     description: Admin will see particular details of Settlement
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: settlementId
    *         description: settlementId
    *         in: query
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async viewSettlementDetails(req, res, next) {
        const validationSchema = {
            settlementId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let settResult = await findSettlementStatus({ _id: validatedBody.settlementId, status: { $ne: status.DELETE } })
            if (!settResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(settResult, responseMessage.BANNER_FOUND));
        } catch (error) {
            return next(error);
        }
    }


    /**
   * @swagger
   * /admin/approveSettlementStatus:
   *   put:
   *     tags:
   *       - SETTLEMENT_MANAGEMENT
   *     description: approveSettlementStatus by ADMIN for list of settlement receive during payment as for approve
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: settlementId
   *         description: settlementId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
    async approveSettlementStatus(req, res, next) {
        const validationSchema = {
            settlementId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let settResult = await findSettlementStatus({ _id: validatedBody.settlementId, settlementStatus: settlementStatus.INPROCESS })
            if (!settResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            await updateSettlementStatus({ _id: settResult._id }, { settlementStatus: settlementStatus.APPROVE });
            await updateTransaction({ _id: settResult.transactionId }, { transStatusType: transStatusType.SUCCESS });

            return res.json(new response(settResult, responseMessage.APPROVE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
* @swagger
* /admin/rejectSettlementStatus:
*   put:
*     tags:
*       - SETTLEMENT_MANAGEMENT
*     description: approveSettlementStatus by ADMIN for list of settlement receive during payment as for approve
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*       - name: settlementId
*         description: settlementId
*         in: query
*         required: true
*       - name: comment
*         description: comment
*         in: query
*         required: true
*     responses:
*       200:
*         description: Returns success message
*/
    async rejectSettlementStatus(req, res, next) {
        const validationSchema = {
            settlementId: Joi.string().required(),
            comment: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);

            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let settResult = await findSettlementStatus({ _id: validatedBody.settlementId, settlementStatus: settlementStatus.INPROCESS })
            if (!settResult) {
                throw apiError.notFound(responseMessage.BANNER_NOT_FOUND);
            }
            await updateSettlementStatus({ _id: settResult._id }, { settlementStatus: settlementStatus.APPROVE, comment: validatedBody.comment });
            await updateTransaction({ _id: settResult.transactionId }, { transStatusType: transStatusType.PENDING })

            return res.json(new response(settResult, responseMessage.REJECT_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/replyToSubscriber:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: subscribe user will get reply by admin with this API
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: email
     *         description: email
     *         in: formData
     *         required: true
     *       - name: message
     *         description: message
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async replyToSubscriber(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            message: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let dataRes = await findSubscribe({ email: validatedBody.email, status: { $ne: status.DELETE } })
            if (!dataRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            await commonFunction.replyNewsLetterSendEmail(validatedBody.email, validatedBody.message)
            let updateRes = await updateSubscribe({ _id: dataRes._id }, { $inc: { replycount: 1 } })
            return res.json(new response(updateRes, responseMessage.REPLY_SUBSCRIBE));
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }

    /**
      * @swagger
      * /admin/myWalletList:
      *   put:
      *     tags:
      *       - USER
      *     description: all wallet details will get with particular user here ADMIN will see all details of Wallet
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: token
      *         in: header
      *         required: true
      *       - name: coinType
      *         description: coinType
      *         in: query
      *         required: true
      *     responses:
      *       200:
      *         description: Returns success message
      */
    async myWalletList(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                let userWalletDetails = await findWallet({ userId: userResult._id, coinType: req.query.coinType });
                var balance = await getBalanceFunction(userWalletDetails.address, req.query.coinType);
                var updateValue = await updateWallet({ _id: userWalletDetails._id }, { $set: { balance: balance } })
                updateValue = _.omit(JSON.parse(JSON.stringify(updateValue)), "privateKey", "publicKey");
                return res.json(new response(updateValue, responseMessage.DATA_FOUND));
            }
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/myWalletListPrevious:
     *   put:
     *     tags:
     *       - USER
     *     description: myWalletListPrevious
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
    async myWalletListPrevious(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                let userWalletDetails = await walletList({ userId: userResult._id });
                for (let i = 0; i <= userWalletDetails.length - 1; i++) {
                    var balance = await getBalanceFunction(userWalletDetails[i].address, userWalletDetails[i].coinType);
                    var updateValue = await updateWallet({ _id: userWalletDetails[i]._id }, { $set: { balance: balance } })
                }
                let walletResutl = await walletList({ userId: userResult._id, status: { $ne: status.DELETE } })
                if (walletResutl.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                }
                return res.json(new response(walletResutl, responseMessage.DATA_FOUND));
            }
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }

}
export default new adminController()


const transferFunction = async (userId, receiverAddress, coinAmount, coinTypeName) => {
    try {
        const [senderDetails] = await Promise.all([
            findWallet({ userId: userId, coinType: coinTypeName })
        ]);
        const transferRes =
            // coinTypeName === coinType.AVAX ? await avaxFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount) :
            // coinTypeName === coinType.BNB ? await bnbFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount) :
            // coinTypeName === coinType.BTC ? await btcFunc.withdraw(senderDetails.address, receiverAddress, coinAmount, senderDetailsaddress) :// ChangeAddress check last parameter
            coinTypeName === coinType.VD ? await maticFunc.withdrawToken(senderDetails.privateKey, receiverAddress, coinAmount, coinTypeName) :
                // coinTypeName === coinType.USDC ? await maticFunc.withdrawToken(senderDetails.privateKey, receiverAddress, coinAmount, coinTypeName) :
                coinTypeName === coinType.USDT ? await ethFunc.withdrawToken(senderDetails.privateKey, receiverAddress, coinAmount, coinTypeName) :
                    // coinTypeName === coinType.BUSD ? await maticFunc.withdrawToken(senderDetails.privateKey, receiverAddress, coinAmount, coinTypeName) :
                    coinTypeName === coinType.MATIC ? await maticFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount) :
                        await ethFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount)
        if (transferRes) {
            return { status: true };
        } else {
            return { status: false };
        }
    } catch (error) {
        console.log("error===>>> in transfer in admin controller", error);
        return { status: false, error: error };
    }
}



const getBalanceFunction = async (address, coinTypeName) => {
    try {
        const balance =
            // coinTypeName === coinType.AVAX ? await avaxFunc.getBalance(address) :
            // coinTypeName === coinType.BNB ? await bnbFunc.getBalance(address) :
            // coinTypeName === coinType.BTC ? await btcFunc.getBalance(address) :// ChangeAddress check last parameter
            coinTypeName === coinType.VD ? await vdTokenFunc.getBalance(address, coinTypeName) :
                // coinTypeName === coinType.USDC ? await erc20Func.getBalance(address, coinTypeName) :
                coinTypeName === coinType.USDT ? await erc20Func.getBalance(address, coinTypeName) :
                    // coinTypeName === coinType.BUSD ? await erc20Func.getBalance(address, coinTypeName) :
                    coinTypeName === coinType.MATIC ? await maticFunc.getBalance(address) :
                        await ethFunc.getBalance(address)
        return balance;
    } catch (error) {
        console.log("error", error);
        return { status: false, error: error };
    }
}

const transferAdminToUserForGasFeeFunction = async (adminAddress, adminPrivateKey, userAddress, amountToSend) => {
    try {
        const transferRes = await vdTokenFunc.transferAdminToUserForGasFee(adminAddress, adminPrivateKey, userAddress, amountToSend)
        if (transferRes && transferRes.Status == true) {
            return { status: true };
        } else {
            return { status: false };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, error: error };
    }
}
