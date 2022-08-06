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

    static BadRequest(message, errors) {
        return new ApiError(400, message, errors);
    }

    static Continue(message, errors) {
        return new ApiError(303, message, errors);
    }
}
