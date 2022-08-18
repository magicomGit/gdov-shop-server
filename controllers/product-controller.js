const jwt = require('jsonwebtoken');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const { Category, Brand, Product, CategoryProperty, FilterName, FilterInstance } = require('../models/models')
const uuid = require('uuid');
const path = require('path')

class ProductController {



    async getCategories(req, res, next) {
        try {
            const categories = await Category.findAll();
            return res.json(categories);
        } catch (e) {
            next(e);
        }
    }

    async newCategory(req, res, next) {
        const data = req.body;
        if (data.category.name.length < 3) {
            return ApiError.BadRequest('В запросе не достаточно символов')
        }

        try {
            const category = await Category.create({ name: data.category.name });
            return res.json(category);
        } catch (e) {
            next(e);
        }
    }

    async deleteCategory(req, res, next) {
        const data = req.body;
        try {
            const response = await Category.destroy({ where: { id: data.id } });

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
    //-------------- Brand -----------------------------------------------------
    async getBrands(req, res, next) {
        try {
            const categories = await Brand.findAll();
            return res.json(categories);
        } catch (e) {
            next(e);
        }
    }

    async newBrand(req, res, next) {
        const data = req.body;
        if (data.brand.name.length < 3) {
            return ApiError.BadRequest('В запросе не достаточно символов')
        }

        try {
            const brand = await Brand.create({ name: data.brand.name });
            return res.json(brand);
        } catch (e) {
            next(e);
        }
    }

    async deleteBrand(req, res, next) {
        const data = req.body;
        try {
            const response = await Brand.destroy({ where: { id: data.id } });

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
    //-------------- Product -----------------------------------------------------
    async getProducts(req, res, next) {
        const data = req.query
        if (!data.limit || !data.page) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        const offset = data.limit * (data.page - 1)
        console.log(data.limit , offset)
        try {
            const product = await Product.findAndCountAll({ limit: data.limit, offset: offset });

            return res.json(product);
        } catch (e) {
            next(e);
        }
    }

    async getFilteredProducts(req, res, next) {
        const data = req.body
        console.log('data ',data)
        if (!data.filterRequest.categoryId) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        const categoryId = data.filterRequest.categoryId
        const category = await Category.findOne({where:{id: categoryId}})

        if (!category) {
            return ApiError.BadRequest('Не корректный запрос')
        }

        try {

            if (data.filterRequest.filters.length > 0) {
                //const categoryId = data.filterRequest.categoryId


                let filterInstances = await FilterInstance.findAll({ where: { categoryId: categoryId } })

                let groupFilterInstances = {};

                let filteredId = []
                let filteredIdGroup = []
                let filteredGroup = []

                data.filterRequest.filters.map(filterValue => {
                    if (!groupFilterInstances[filterValue.filterNameId]) {
                        groupFilterInstances[filterValue.filterNameId] = [filterValue.value]
                    } else {
                        groupFilterInstances[filterValue.filterNameId].push(filterValue.value)

                    }
                })
                console.log(groupFilterInstances)
                for (var key in groupFilterInstances) {
                    //console.log(key, groupFilterInstances[key])
                    groupFilterInstances[key].map(groupItem => {
                        //console.log('key- '+key, ' groupItem- '+ groupItem)
                        filterInstances.map(filterInstance => {

                            if (key == filterInstance.filterNameId &&
                                groupItem === filterInstance.value) {
                                filteredIdGroup.push(filterInstance.productId)
                            }
                        })
                    })
                    filteredIdGroup = [...new Set(filteredIdGroup)]

                    filteredIdGroup.map(id => {
                        filterInstances.map(instance => {
                            if (instance.productId === id) {
                                filteredGroup.push(instance)

                            }

                        })

                    })
                    filterInstances = filteredGroup
                    filteredGroup = []
                    filteredIdGroup = []

                }
                filterInstances.map(instance => {
                    filteredId.push(instance.productId)
                })
                filteredId = [...new Set(filteredId)]



                const products = await Product.findAll({ where: { id: filteredId } })
                return res.json(products);
            } else {

                const products = await Product.findAll({ where: { category: category.name } })
                return res.json(products);
            }



        } catch (e) {
            next(e);
        }
    }


    async newProduct(req, res, next) {
        try {
            const product = req.body;

            if (req.files) {
                const file = req.files
                const fileName = uuid.v4() + ".jpg"
                file.Img.mv(path.resolve(__dirname, '..', 'static', fileName))
                product.picture = fileName
            } else {
                return ApiError.BadRequest('Не найдено изображение продукта')
            }



            const newProduct = await Product.create({
                name: product.name, category: product.category, brand: product.brand,
                price: product.price, picture: product.picture
            });
            return res.json(newProduct);
        } catch (e) {
            next(e);
        }
    }

    async deleteProduct(req, res, next) {
        const data = req.body;
        try {
            const response = await Product.destroy({ where: { id: data.id } });

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }


}


module.exports = new ProductController();
