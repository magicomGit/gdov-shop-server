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



const Comment = sequelize.define('comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT },
    userName: { type: DataTypes.STRING },
    
})

const Product = sequelize.define('product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },    
    name: { type: DataTypes.STRING, unique: true },   
    brand: { type: DataTypes.STRING },
    picture: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 },    
})



const Category = sequelize.define('category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },    
}, { timestamps: false })

const Brand = sequelize.define('brand', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },    
}, { timestamps: false })

const FilterName = sequelize.define('filterName',{
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },      
}, { timestamps: false })

const FilterValue = sequelize.define('filterValue', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },   
    filterName: { type: DataTypes.STRING },       
    value: { type: DataTypes.STRING },   
        
}, { timestamps: false })

const FilterInstance = sequelize.define('filterInstance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },    
    filterName: { type: DataTypes.STRING },       
    value: { type: DataTypes.STRING },          
}, { timestamps: false })

const Property = sequelize.define('property', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },          
    value: { type: DataTypes.STRING },      
}, { timestamps: false })


Product.hasMany(FilterInstance)


Category.hasMany(Product)

Category.hasMany(FilterName,  { onDelete: "cascade"})
Category.hasMany(FilterValue,  { onDelete: "cascade"})

FilterName.hasMany(FilterValue ,  { onDelete: "cascade"})







module.exports = {
    User,    
    Comment,
    Product,    
    Category,
    Brand,
    Property,
    FilterName,
    FilterValue,
    FilterInstance,
    
}