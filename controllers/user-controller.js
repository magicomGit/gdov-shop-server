const jwt = require('jsonwebtoken');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const axios =  require("axios");

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

    async yandexAuth(req, res, next) {
        try {
      
            
            const headers = {
                'Content-Type': 'application/json'    
              };
            const token = 'vk1.a.h2_YaH5O-4Wb4NaqQVHomuJBKR_dm1rtEKBFfwvF-vZYafd0WPVChexPP0893_osxbBaZ-F50jzInz3Pkqs_67ePIzhKbd-gc7L021tyfQdAq8llavz_HXhJ03q45RwBgMG0I8iA-yc12VjM9VVmsW16IY_8UWvnlYWD71XZpGUhYw9Oidesk9LvFPDiN7b0'
            // const formData = new FormData()
            // formData.append('access_token', token )
            // formData.append('v', '5.131' )

            const getUserDataParam = {access_token: token, v:'5.131'}
            const resp = await axios.post('https://api.vk.com/method/users.get',getUserDataParam, headers)

            console.log(resp)
            return 
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
