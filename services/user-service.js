const { User } = require('../models/models')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    async register(email, password) {
        const candidate = await User.findOne({ where: { email: email } })
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const link = uuid.v4()
        const user = await User.create({ email: email, name: email, password: hashPassword, confirmLink: link, confirmedEmail: false })
        const confirmLink = process.env.API_URL+'/account/activate?id='+user.id+'&link='+link; // v34fa-asfasf-142saf-sa-asf
        await mailService.sendActivationMail(email, confirmLink);

        const userDto = new UserDto(user); // Id, Email, ConfirmedEmail

        const tokens = tokenService.generateTokens({ ...userDto });

        return { ...tokens, ...userDto}
    }

    async activate(activationLink) {
        const user = await User.findOne({where: {id:activationLink.id} })
        
        if (!user || user.confirmLink !==activationLink.link) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.emailConfirmed = true;
        await user.save();
    }
 
    async login(email, password) {

        const user = await User.findOne({ where: { email: email } })

        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден')
        }

        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, ...userDto }
    }

    async logout(userId) {        
        return await tokenService.removeToken(userId);
    }

    async refresh(refreshToken, accessToken) {
        if (!refreshToken || !accessToken) {
            return { accessToken: null, isAuth: false, message: 'Токен клиента отсутствует' }           
        }

        //валидируем refreshToken от клинета
        if (!tokenService.validateRefreshToken(refreshToken)) {
            return { accessToken: null, isAuth: false, message: 'RefreshToken не прошел проверку' }            
        }
        
        //payload accessToken от клиента
        const accessPayload = jwt.decode(accessToken)
        if (!accessPayload) {
            return { accessToken: null, isAuth: false, message: 'Не корректный AccessToken' }            
        }
        
        //тянем из БД  refreshToken по Id пользователя из payload accessToken от клиента и сравниваем
        const refreshTokenFromDb = await tokenService.getRefreshTokenByUserId(accessPayload.id);
        
        if (refreshToken !== refreshTokenFromDb) {
            return { accessToken: null, message: 'RefreshToken не распознан' }            
        }

        //генерим новую пару  токенов
        const user = await User.findOne({ where: { id: accessPayload.id } });
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        return { ...tokens, ...userDto, isAuth: true}
    }

    async getAllUsers(limit) {
        
        const l = parseInt(limit)
        const users = await User.findAll({limit:l});
        return users;
    }
}

module.exports = new UserService();
