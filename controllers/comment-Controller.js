const ApiError = require('../exceptions/api-error');
const { Comment } = require('../models/models')

class CommentController {



    async getComments(req, res, next) {
        const data = req.query
        
        if (!data.productId) {
            return ApiError.BadRequest('В запросе отсутствует id товара')
        }
        try {
            const comments = await Comment.findAll({ where: { productId: data.productId } });
            return res.json(comments);
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
                content: data.content, userName: data.userName, UserId: data.userId, productId: data.productId });
            return res.json(comment);
        } catch (e) {
            next(e);
        }
    }

    

}


module.exports = new CommentController();
