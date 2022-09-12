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


            const data = {grant_type:'authorization_code', code: '8635796', client_id:'74294c854986418fb0cbb047602f071b', client_secret: 'fce0aff9db5c4dc8b198d44eaa2f2f5b'}
            var FormData = require('form-data');
            const formData = new FormData()
            formData.append('grant_type', 'authorization_code')
            formData.append('code', '8635796')
            formData.append('client_id', '74294c854986418fb0cbb047602f071b')
            formData.append('client_secret', 'fce0aff9db5c4dc8b198d44eaa2f2f5b')
          
            const headers = { 'Content-Type': 'multipart/form-data' }
          
          
          
            const resp = await axios.post('https://oauth.yandex.ru', formData, { headers })
            console.log(resp)
            return res.json(resp.data)
        } catch (e) {
            next(e);
        }
    }

    async vkAuth(req, res, next) {
        const { code } = req.body
        if (!code) {
            return next(ApiError.BadRequest('Не корректный запрос'))
        }


       

         const ee = await axios.get('https://oauth.vk.com/access_token?client_id=51414570&client_secret=jxFMW2CVT3mN6p1X3IbC&code='+code)
         console.log(5555555555555,ee)
        

        //const res2 =  fetch('https://oauth.vk.com/access_token?client_id=51414570&client_secret=jxFMW2CVT3mN6p1X3IbC&redirect_uri=http://test125.tmweb.ru/oauth/vk&code='+code)
        //console.log(5555555555555555,res2)
        try {
            const headers = { 'Content-Type': 'multipart/form-data', };
            //const token = 'vk1.a.Nu0gNUtbSrqFVK4k6HZj5z4oIj9EAHPuFxnuE7_ZfpzAdTREKV1ZIIFZJS2xb2dDc_rLZ00cx_hYWqM5VVqUjz5O3C7T2WMBR5Ai3NYe3OhhxyH6Bq29RzDnMXOdzIRThcOYzXLszntrlmfodIvW4MdY5DLshubZsKV6eWxAwhK_x3B26lVpyNKcNBJrEfzR'

            // var FormData = require('form-data');
            // const formData = new FormData()
            // formData.append('access_token', vkToken)
            // formData.append('v', '5.131')

            //const getUserDataParam = { access_token: vkToken, v: '5.131' }
            //const resp = await axios.post('https://api.vk.com/method/users.get', formData, headers)

            // if (resp.data.error) {
            //     console.log(resp.data.error.error_msg)
            //     console.log(vkToken)
            //     return next(ApiError.BadRequest(resp.data.error.error_msg))
            // }

            // if (resp.data.response) {
            //     const email = resp.data.response[0].id
            //     const firstName = resp.data.response[0].first_name
            //     const lastName = resp.data.response[0].last_name

            //     const user = await User.findOne({ where: { email: String(resp.data.response[0].id) } })

            //     if (!user) {
            //         const userData = await userService.registerVK(email, firstName, lastName);
            //         await tokenService.saveToken(userData.id, userData.refreshToken);
            //         res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })//30 дней
            //         return res.json(userData)
            //     }
            //     else{
            //         const userData = await userService.loginVK(email);
            //         await tokenService.saveToken(userData.id, userData.refreshToken);
            //         res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })//30 дней
            //         //console.log(userData)
            //         return res.json(userData)
            //     }

            // }
            return next(ApiError.BadRequest('Ошибка авторизации ВКонтакте2'))
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


            const isActivated = await userService.activate(activationLink);
            if (isActivated) {
                return res.redirect(process.env.CLIENT_URL + '?isActivated=true');
            } else {
                return res.redirect(process.env.CLIENT_URL + '?isActivated=false');
            }

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



    //===========================================
    async getComments(req, res, next) {
        const data = req.query
        if (!data.limit || !data.page) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        if (!data.productId) {
            return ApiError.BadRequest('В запросе отсутствует id товара')
        }
        const offset = data.limit * (data.page - 1)

        try {
            const comments = await Comment.findAndCountAll({ where: { productId: data.productId }, offset: offset, limit: Number(data.limit) });
            //console.log(comments.rows)
            return res.json(comments);
        } catch (e) {
            next(e);
        }
    }

    async getRating(req, res, next) {
        const data = req.query
        if (!data) {
            return ApiError.BadRequest('Не корректный запрос')
        }

        const { userId, productId } = data

        try {
            const rating = await Rating.findOne({ where: { [Op.and]: [{ userId: userId }, { productId: productId }] } })

            if (rating) {
                return res.json(rating.rating);
            }

            return res.json(0);
        } catch (e) {
            next(e);
        }
    }

    async newComment(req, res, next) {
        const data = req.body.comment

        if (data.content.length < 3) {
            return ApiError.BadRequest('В запросе не достаточно символов')
        }
        try {
            const comment = await Comment.create({
                content: data.content, userName: data.userName, UserId: data.userId, productId: data.productId
            });
            return res.json(comment);
        } catch (e) {
            next(e);
        }
    }

    async newRating(req, res, next) {
        const data = req.body.rating
        if (!data) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        const { rating, userId, productId } = data

        try {
            const oldRating = await Rating.findOne({ where: { [Op.and]: [{ userId: userId }, { productId: productId }] } })
            const product = await Product.findOne({ where: { id: productId } })
            if (oldRating) {
                product.rating = product.rating - oldRating.rating + rating
                oldRating.rating = rating
                await oldRating.save()
                await product.save()

            } else {
                const newRating = await Rating.create({ id: 0, rating, userId, productId })
                product.rating = product.rating + rating
                product.ratingCount++
                await product.save()

                const productRating = (product.rating / product.ratingCount).toFixed(1)
                return res.json({ userRating: newRating.rating, productRating: productRating })
            }
            const productRating = (product.rating / product.ratingCount).toFixed(1)


            return res.json({ userRating: oldRating.rating, productRating: productRating })
        } catch (e) {
            next(e);
        }
    }

    async getProductRating(req, res, next) {
        const data = req.query
        if (!data) {
            return ApiError.BadRequest('Не корректный запрос')
        }

        const { userId, productId } = data

        try {
            const rating = await Rating.findOne({ where: { [Op.and]: [{ userId: userId }, { productId: productId }] } })

            if (rating) {
                return res.json(rating.rating);
            }

            return res.json(0);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController();
