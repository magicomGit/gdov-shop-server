const userService = require('../services/user-service');

const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');

module.exports = async function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        
        if (!accessToken) {

            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);

        if (!userData) {
            return next(ApiError.Forbidden());

        }

        if (userData.role !== 'ADMIN') {
            return next(ApiError.Forbidden());
        }

        next();
    } catch (e) {

        return next(ApiError.UnauthorizedError());
    }
};
