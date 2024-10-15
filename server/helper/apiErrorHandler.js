const apiErrorhandler = (err, req, res, next) => {
    if (err.isApiError) {
        res.status(err.responseCode).json({
            responseCode: err.responseCode,
            responseMessage: err.responseMessage,
        });
        return;
    }
    if (err.message == 'Validation error') {
        res.status(502).json({
            code: 502,
            responseMessage: err.original.message,
        });
        return;
    }
    res.status(err.code || 500).json({
        responseCode: err.code || 500,
        responseMessage: err.message,
    });
    return;
};
module.exports = apiErrorhandler;