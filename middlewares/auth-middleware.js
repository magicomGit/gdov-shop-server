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
            
            const { refreshToken } = req.cookies;
            const refreshData = await userService.refresh(refreshToken, accessToken);
            
            if (!refreshData.isAuth) {
                
                return next(ApiError.UnauthorizedError());
            } else {
                
                return next(ApiError.Continue());                
            }
            
        }

        
        next();
    } catch (e) {
        
        return next(ApiError.UnauthorizedError());
    }
};
