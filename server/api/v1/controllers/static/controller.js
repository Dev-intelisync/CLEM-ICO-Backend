import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import axios from 'axios';

import { staticServices } from '../../services/static';
const { createStaticContent, findStaticContent, updateStaticContent, staticContentList } = staticServices;

import { staticLinkServices } from '../../services/staticLink';
const { createStaticLinkContent, findStaticLinkContent, updateStaticLinkContent, staticLinkContentList } = staticLinkServices;


import { faqServices } from '../../services/faq';
const { createFAQ, findFAQ, updateFAQ, faqListWithPagination, FAQList } = faqServices;

import { userServices } from '../../services/user';
const { findUser } = userServices;

import commonFunction from '../../../../helper/util';

import status from '../../../../enums/status';
import userType from '../../../../enums/userType';
import countryState from "../../../../enums/country-state";


export class staticController {

    //**************************  Static management Start *************************************************/
    /**
     * @swagger
     * /static/static:
     *   post:
     *     tags:
     *       - STATIC
     *     description: addStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: addStaticContent
     *         description: addStaticContent
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addStaticContent'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addStaticContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { type, title, description } = validatedBody;
            var result = await createStaticContent({ type: type, title: title, description: description })
            return res.json(new response(result, responseMessage.DATA_SAVED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/static/{type}:
     *   get:
     *     tags:
     *       - STATIC
     *     description: viewStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: type
     *         description: type
     *         in: path
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async viewStaticContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            var result = await findStaticContent({ type: validatedBody.type })
            if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/static:
     *   put:
     *     tags:
     *       - STATIC
     *     description: editStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: editStaticContent
     *         description: editStaticContent
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editStaticContent'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editStaticContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            url: Joi.string().optional()

        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let staticRes = await findStaticContent({ _id: req.body._id })
            if (!staticRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            var result = await updateStaticContent({ _id: validatedBody._id }, validatedBody)
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/static:
     *   get:
     *     tags:
     *       - STATIC
     *     description: staticContentList
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async staticContentList(req, res, next) {
        try {
            var result = await staticContentList({ status: { $ne: status.DELETE } })
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }


    //**************************  Static management End *************************************************/


    //**************************  StaticLink management End *************************************************/
    /**


    /**
     * @swagger
     * /staticLink/staticLink/{_id}:
     *   get:
     *     tags:
     *       - STATIC_LINK
     *     description: viewStaticLinkContent
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

    async viewStaticlinkContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            var result = await findStaticLinkContent({ _id: validatedBody._id })
            if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /staticLink/staticLink:
     *   put:
     *     tags:
     *       - STATIC_LINK
     *     description: editStaticLinkContent
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
     *       - name: url
     *         description: url
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editStaticlinkContent(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.query);
            var staticRes = await findStaticLinkContent({ _id: validatedBody._id })
            if (!staticRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            var result = await updateStaticLinkContent({ _id: staticRes._id }, { $set: validatedBody })
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /staticLink/staticLink:
     *   get:
     *     tags:
     *       - STATIC_LINK
     *     description: staticLinkContentList
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async staticLinkContentList(req, res, next) {
        try {
            var result = await staticLinkContentList()
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    //**************************  StaticLink management End *************************************************/



    //**************************  FAQs management Start *****************************************************/

    /**
     * @swagger
     * /faq/faq:
     *   post:
     *     tags:
     *       - FAQ_MANAGEMENT
     *     description: addFAQ
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: addFAQ
     *         description: addFAQ
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addFAQ'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addFAQ(req, res, next) {
        const validationSchema = {
            question: Joi.string().required(),
            answer: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { question, answer } = validatedBody;
            var result = await createFAQ({ question: question, answer: answer })
            return res.json(new response(result, responseMessage.FAQ_ADDED));
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /faq/faq/{_id}:
      *   get:
      *     tags:
      *       - FAQ_MANAGEMENT
      *     description: viewFAQ
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

    async viewFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.params, validationSchema);
            var result = await findFAQ({ _id: validatedBody._id })
            if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /faq/faq:
    *   put:
    *     tags:
    *       - FAQ_MANAGEMENT
    *     description: editFAQ
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: editFAQ
    *         description: editFAQ
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/editFAQ'
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async editFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            question: Joi.string().optional(),
            answer: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let adminRes = await findUser({ _id: req.userId })
            if (!adminRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            let faqFind = await findFAQ({ _id: validatedBody._id })
            if (!faqFind) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            var result = await updateFAQ({ _id: faqFind._id }, validatedBody)
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /faq/faq:
    *   delete:
    *     tags:
    *       - FAQ_MANAGEMENT
    *     description: deleteFAQ
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: deleteFAQ
    *         description: deleteFAQ
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/deleteFAQ'
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async deleteFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
            if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            var faqInfo = await findFAQ({ _id: validatedBody._id, status: { $ne: status.DELETE } });
            if (!faqInfo) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            let deleteRes = await updateFAQ({ _id: faqInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /faq/faq:
     *   get:
     *     tags:
     *       - FAQ_MANAGEMENT
     *     description: faqList
     *     parameters:
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

    async faqList(req, res, next) {
        let validationSchema = {
            // search: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await faqListWithPagination(validatedBody)
            if (result.docs.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }


    //**************************  FAQs management End *************************************************/


    /**
     * @swagger
     * /country/country:
     *   get:
     *     tags:
     *       - COUNTRY_MANAGEMENT
     *     description: countryList
     *     parameters:
     *       - name: country
     *         description: country
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async country(req, res, next) {
        let validationSchema = {
            country: Joi.string().optional()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            let result = countryState;
            if (result.countries.length == 0) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            if (validatedBody.country) {
                result = result['countries'].filter(o => {
                    if (o['country'] == validatedBody.country) {
                        return o;
                    }
                })
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }
 

    async cmcSocket() {
        try {
            var responses
            return new Promise(async (resolve, reject) => {
                const option = {
                    method: 'get',
                    url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=${config.get('CMC_PRO_API_KEY')}`,
                    headers: {
                        'accept': 'application/json'
                    }
                };
                let result = await axios(option);
                if (result.status === 200) {
                    result = result.data;
                    responses = ({ responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: result });
                    resolve(responses);
                }
            })
        } catch (error) {
            responses = (error);
            reject(responses);
        }
    }

    /**
     * @swagger
     * /static/deleteStaticContent:
     *   delete:
     *     tags:
     *       - STATIC
     *     description: deleteStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: staticId
     *         description: staticId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async deleteStaticContent(req, res, next) {
        const validationSchema = {
            staticId: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: userType.ADMIN });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var result = await findStaticContent({ _id: validatedBody.staticId, status: { $ne: status.DELETE } })
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            let updateRes = await updateStaticContent({ _id: result._id }, { status: status.DELETE })
            return res.json(new response(updateRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }



    async messariSocket() {
        try {
            var responses
            return new Promise(async (resolve, reject) => {
                const option = {
                    method: 'get',
                    url: `https://data.messari.io/api/v1/assets?limit=30&fields=id,slug,symbol,metrics/market_data`,
                    headers: {
                        // "x-messari-api-key":config.get('MESSARI_PRO_API_KEY'),
                        'accept': 'application/json'
                    }
                };
                let result = await axios(option);
                if (result.status === 200) {
                    result = result.data;
                    responses = ({ responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: result });
                    resolve(responses);
                }
            })
        } catch (error) {
            responses = (error);
            reject(responses);
        }
    }




}

export default new staticController()