import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";


export default Express.Router()

    .post('/static', controller.addStaticContent)
    .get('/static/:type', controller.viewStaticContent)
    .put('/static', controller.editStaticContent)
    .get('/static', controller.staticContentList)

    .get('/staticLink/:_id', controller.viewStaticlinkContent)
    .put('/staticLink', controller.editStaticlinkContent)
    .get('/staticLink', controller.staticLinkContentList)

    .post('/faq', controller.addFAQ)
    .get('/faq/:_id', controller.viewFAQ)
    .get('/faq', controller.faqList)

    .get('/country',controller.country)
    
    .use(auth.verifyToken)
    .put('/faq', controller.editFAQ)
    .delete('/faq', controller.deleteFAQ)
    .delete('/deleteStaticContent', controller.deleteStaticContent)
    




