const jwt = require('jsonwebtoken');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const axios = require("axios");
const { User } = require('../models/models')

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
                //'Content-Type': 'multipart/form-data',
                'Content-Type': 'multipart/form-data',

            };
            const token = 'vk1.a.h2_YaH5O-4Wb4NaqQVHomuJBKR_dm1rtEKBFfwvF-vZYafd0WPVChexPP0893_osxbBaZ-F50jzInz3Pkqs_67ePIzhKbd-gc7L021tyfQdAq8llavz_HXhJ03q45RwBgMG0I8iA-yc12VjM9VVmsW16IY_8UWvnlYWD71XZpGUhYw9Oidesk9LvFPDiN7b0'

            var FormData = require('form-data');
            const formData = new FormData()
            formData.append('grant_type', 'authorization_code')
            formData.append('code', '4050969')
            formData.append('client_id', '74294c854986418fb0cbb047602f071b')
            formData.append('client_secret', 'fce0aff9db5c4dc8b198d44eaa2f2f5b')

            const getUserDataParam = { access_token: token, v: '5.131' }
            const resp = await axios.post('https://oauth.yandex.ru', formData, headers)

            console.log(resp.data)
            return res.json(resp.data)
        } catch (e) {
            next(e);
        }
    }

    async vkAuth(req, res, next) {
        const { vkToken } = req.body
        if (!vkToken) {
            return next(ApiError.BadRequest('Не корректный запрос'))
        }

        
        try {
            const headers = { 'Content-Type': 'multipart/form-data', };
            //const token = 'vk1.a.Nu0gNUtbSrqFVK4k6HZj5z4oIj9EAHPuFxnuE7_ZfpzAdTREKV1ZIIFZJS2xb2dDc_rLZ00cx_hYWqM5VVqUjz5O3C7T2WMBR5Ai3NYe3OhhxyH6Bq29RzDnMXOdzIRThcOYzXLszntrlmfodIvW4MdY5DLshubZsKV6eWxAwhK_x3B26lVpyNKcNBJrEfzR'

            var FormData = require('form-data');
            const formData = new FormData()
            formData.append('access_token', vkToken)
            formData.append('v', '5.131')

            //const getUserDataParam = { access_token: vkToken, v: '5.131' }
            const resp = await axios.post('https://api.vk.com/method/users.get', formData, headers)

            if (resp.data.error) {
                return next(ApiError.BadRequest('Ошибка авторизации ВКонтакте'))
            }

            if (resp.data.response) {
                const email = resp.data.response[0].id
                const firstName = resp.data.response[0].first_name
                const lastName = resp.data.response[0].last_name

                const user = await User.findOne({ where: { email: String(resp.data.response[0].id) } })

                if (!user) {
                    const userData = await userService.registerVK(email, firstName, lastName);
                    await tokenService.saveToken(userData.id, userData.refreshToken);
                    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })//30 дней
                    return res.json(userData)
                }
                else{
                    const userData = await userService.loginVK(email);
                    await tokenService.saveToken(userData.id, userData.refreshToken);
                    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })//30 дней
                    //console.log(userData)
                    return res.json(userData)
                }

            }
            return next(ApiError.BadRequest('Ошибка авторизации ВКонтакте'))
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
