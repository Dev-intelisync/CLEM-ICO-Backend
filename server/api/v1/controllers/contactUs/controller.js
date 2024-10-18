import Joi from "joi";
import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import { contactUsServices } from "../../services/contactUs";
import { userServices } from "../../services/user";
const { findUser } = userServices;

const {
  createContactUs,
  findContactUs,
  updateContactUs,
  contactUsList,
  updateContactUsById,
} = contactUsServices;
import { feedbackServices } from "../../services/feedback";
const {
  createFeedback,
  findFeedback,
  updateFeedback,
  updateFeedbackById,
  feedbackList,
} = feedbackServices;
import status from "../../../../enums/status";
import userType, { ADMIN } from "../../../../enums/userType";

export class contactUsController {
  /**
   * @swagger
   * /contactUs/contactUs:
   *   post:
   *     tags:
   *       - CONTACT_US MANAGEMENT
   *     description: userContactUs for contat to ADMIN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: true
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: true
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: true
   *       - name: message
   *         description: message of query
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userContactUs(req, res, next) {
    const validationSchema = {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      subject: Joi.string()
        .valid("CONSTRUCTION", "REAL_ESTATE", "INDUSTRY", "ARCHITECT")
        .required(),
      mobileNumber: Joi.string().optional(),
      message: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let saveQuery = await createContactUs(validatedBody);
      return res.json(new response(saveQuery, responseMessage.CONTACT_US));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/contactUs:
   *   get:
   *     tags:
   *       - CONTACT_US MANAGEMENT
   *     description: listContactUs
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
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listContactUs(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      var adminResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let result = await contactUsList(validatedBody);
      if (result.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/contactUs/{_id}:
   *   get:
   *     tags:
   *       - CONTACT_US MANAGEMENT
   *     description: viewContactUs with particular _id
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: _id
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewContactUs(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.params, validationSchema);
      let result = await findContactUs({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/contactUs:
   *   put:
   *     tags:
   *       - CONTACT_US MANAGEMENT
   *     description: replyContactUs
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *       - name: message
   *         description: message of query
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async replyContactUs(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
      message: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      var adminResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let contactUsResult = await findContactUs({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      if (!contactUsResult) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let result = await updateContactUsById(contactUsResult._id, {
        $set: { replyMessage: validatedBody.message },
      });
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/contactUs:
   *   delete:
   *     tags:
   *       - CONTACT_US MANAGEMENT
   *     description: deleteContactUs
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
  async deleteContactUs(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const { _id } = await Joi.validate(req.query, validationSchema);
      var adminResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let contactUsResult = await findContactUs({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!contactUsResult) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let result = await updateContactUsById(_id, {
        $set: { status: status.DELETE },
      });
      return res.json(new response(result, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/addFeedback:
   *   post:
   *     tags:
   *       - FEEDBACK MANAGEMENT
   *     description: addFeedback by USER on platefrom for application
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: rating
   *         description: rating
   *         in: formData
   *         required: true
   *       - name: description
   *         description: description
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async addFeedback(req, res, next) {
    const validationSchema = {
      rating: Joi.string().required(),
      description: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let saveQuery = await createFeedback(validatedBody);
      return res.json(new response(saveQuery, responseMessage.ADD_FEEDBACK));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/listFeedback:
   *   get:
   *     tags:
   *       - FEEDBACK MANAGEMENT
   *     description: listFeedback for all feedback listing
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
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
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listFeedback(req, res, next) {
    const validationSchema = {
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let saveQuery = await feedbackList(validatedBody);
      if (saveQuery.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(saveQuery, responseMessage.ADD_FEEDBACK));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /contactUs/viewFeedback:
   *   get:
   *     tags:
   *       - FEEDBACK MANAGEMENT
   *     description: viewFeedback
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: feedbackId
   *         description: feedbackId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewFeedback(req, res, next) {
    const validationSchema = {
      feedbackId: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let saveQuery = await findFeedback({
        _id: validatedBody.feedbackId,
        status: { $ne: status.DELETE },
      });
      if (!saveQuery) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(saveQuery, responseMessage.ADD_FEEDBACK));
    } catch (error) {
      return next(error);
    }
  }
}

export default new contactUsController();
