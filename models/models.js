const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    confirmLink: { type: DataTypes.STRING },
    refreshToken: { type: DataTypes.STRING },
    emailConfirmed: { type: DataTypes.BOOLEAN },
    role: { type: DataTypes.STRING,defaultValue: 'GUEST' },
})

const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },    
}, { timestamps: false })

const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT },
    userName: { type: DataTypes.STRING },
    productId: { type: DataTypes.INTEGER },
})

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },    
    name: { type: DataTypes.STRING, unique: true },            
    category: { type: DataTypes.STRING },
    brand: { type: DataTypes.STRING },
    picture: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 },    
})

// const Basket = sequelize.define('Basket', {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },    
//     userId: { type: DataTypes.INTEGER },
//     productId: { type: DataTypes.ARRAY(DataTypes.INTEGER) },    
       
// }, { timestamps: false })

const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },    
}, { timestamps: false })

const Brand = sequelize.define('Brand', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },    
}, { timestamps: false })

const FilterName = sequelize.define('FilterName',{
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    categoryId: { type: DataTypes.INTEGER },    
}, { timestamps: false })

const FilterValue = sequelize.define('FilterValue', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER },
    filterNameId: { type: DataTypes.INTEGER }, 
    filterName: { type: DataTypes.STRING },       
    value: { type: DataTypes.STRING },   
        
}, { timestamps: false })

const FilterInstance = sequelize.define('FilterInstance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER },
    categoryId: { type: DataTypes.INTEGER },
    filterNameId: { type: DataTypes.INTEGER }, 
    filterName: { type: DataTypes.STRING },       
    value: { type: DataTypes.STRING },          
}, { timestamps: false })

const Property = sequelize.define('Property', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },          
    value: { type: DataTypes.STRING },   
    productId: { type: DataTypes.INTEGER }, 
}, { timestamps: false })

module.exports = {
    User,
    Role,
    Comment,
    Product,    
    Category,
    Brand,
    Property,
    FilterName,
    FilterValue,
    FilterInstance,
    
}