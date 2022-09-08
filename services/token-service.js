const jwt = require('jsonwebtoken');
const { RefreshToken, User } = require('../models/models');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30h' })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            if (userData) {

                return true;
            }
            else {
                return false;
            }

        } catch (e) {
            return false;
        }
    }

    async saveToken(userId, refreshToken) {

        const userData = await User.findOne({ where: { id: userId } })
        userData.refreshToken = refreshToken

        return userData.save();
    }

    async removeToken(userId) {
        const user = await User.findOne({ where: { id: userId } })
        user.refreshToken = ''
        user.save()
        return { isAuth: false }
    }

    async getRefreshTokenByUserId(userId) {
        
        const userData = await User.findOne({ where: { id: userId } })
        return userData.refreshToken;
    }
}

module.exports = new TokenService();
