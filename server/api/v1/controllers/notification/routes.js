import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .use(auth.verifyToken)
    .post('/notification', controller.createNotification)
    .get('/notification/:_id', controller.viewNotification)
    .delete('/notification', controller.deleteNotification)
    .get('/readNotification', controller.readNotification)
    .get('/listNotification', controller.listNotification)






