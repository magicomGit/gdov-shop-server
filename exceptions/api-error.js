module.exports = class ApiError extends Error {
    status;
    errors;
    message;

    constructor(status, message, errors) {
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static Forbidden() {
        return new ApiError(403, 'Отказано в доступе, недостаточно прав')
    }

    static BadRequest(message, errors) {
        return new ApiError(400, message, errors);
    }

    static Continue(message, errors) {
        return new ApiError(303, message, errors);
    }
}
