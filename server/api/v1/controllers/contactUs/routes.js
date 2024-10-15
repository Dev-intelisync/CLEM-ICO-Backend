import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .post('/contactUs', controller.userContactUs)
    .get('/contactUs/:_id', controller.viewContactUs)

    .use(auth.verifyToken)
    .get('/contactUs', controller.listContactUs)
    .put('/contactUs', controller.replyContactUs)
    .delete('/contactUs', controller.deleteContactUs)
    .post('/addFeedback', controller.addFeedback)
    .get('/listFeedback', controller.listFeedback)
    .get('/viewFeedback', controller.viewFeedback)