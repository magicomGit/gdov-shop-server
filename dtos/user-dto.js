module.exports = class UserDto {
    id;
    email;
    firstName;
    role;
    emailConfirmed;

    constructor(model) {
        
        this.email = model.email;
        this.id = model.id;
        this.firstName = model.firstName;
        this.role = model.role;
        this.emailConfirmed = model.emailConfirmed;
    }
}
