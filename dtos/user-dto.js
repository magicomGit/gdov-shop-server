module.exports = class UserDto {
    id;
    email;
    confirmedEmail;

    constructor(model) {
        
        this.email = model.email;
        this.id = model.id;
        this.confirmedEmail = model.confirmedEmail;
        this.role = model.role;
    }
}
