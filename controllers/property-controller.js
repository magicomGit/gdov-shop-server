class PropertyController {
    async getProperties(req, res, next) {
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
   
}


module.exports = new PropertyController();