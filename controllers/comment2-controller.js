const ApiError = require('../exceptions/api-error');
const { Comment, Rating, Product } = require('../models/models')
const {  Op } = require('sequelize')

class Comment2Controller {   


    
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


module.exports = new Comment2Controller();
