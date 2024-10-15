//v7 imports
import user from "./api/v1/controllers/user/routes";
import admin from "./api/v1/controllers/admin/routes";
import statics from "./api/v1/controllers/static/routes";
import faq from "./api/v1/controllers/static/routes";
import contactUs from "./api/v1/controllers/contactUs/routes";
import staticLink from "./api/v1/controllers/static/routes";
import countryState from "./api/v1/controllers/static/routes";

/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {
  app.use("/api/v1/user", user);
  app.use("/api/v1/admin", admin);
  app.use("/api/v1/static", statics);
  app.use("/api/v1/faq", faq);
  app.use("/api/v1/contactUs", contactUs);
  app.use("/api/v1/staticLink", staticLink);
  app.use("/api/v1/country", countryState);


  return app;
}
