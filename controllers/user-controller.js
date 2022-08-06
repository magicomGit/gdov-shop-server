const jwt = require('jsonwebtoken');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { email, password } = req.body;

            const userData = await userService.register(email, password);

            await tokenService.saveToken(userData.id, userData.refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })//30 дней

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const userData = await userService.login(email, password);

            await tokenService.saveToken(userData.id, userData.refreshToken);

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }



    async logout(req, res, next) {
        try {
            const { userId } = req.body;

            const response = await userService.logout(userId);
            res.clearCookie('refreshToken');
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.query;
            // const {id} = req.id;
            
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const tokenHeader = req.headers.authorization;
            const accessToken = tokenHeader.split(' ')[1];
            const { refreshToken } = req.cookies;

            

            const userData = await userService.refresh(refreshToken, accessToken);
            if (!userData.isAuth) {
                return res.json({ isAuth: false })
            }

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            tokenService.saveToken(userData.id, userData.refreshToken)


            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        
        try {

            const users = await userService.getAllUsers(req.query.l);

            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController();
