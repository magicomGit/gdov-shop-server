const jwt = require('jsonwebtoken');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const { Category, Brand, Product, CategoryProperty, FilterName, FilterInstance, FilterValue } = require('../models/models')
const uuid = require('uuid');
const path = require('path');
const filterService = require('../services/filter-service');

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
        console.log(data.limit, offset)
        try {
            const product = await Product.findAndCountAll({ offset: offset, limit: Number(data.limit) });

            return res.json(product);
        } catch (e) {
            next(e);
        }
    }

    async getFilteredProducts(req, res, next) {
        const data = req.body
        if (!data.filterRequest.categoryId) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        const categoryId = data.filterRequest.categoryId

        let filterValueQuantities=[]
        try {
            const filterInstances = await FilterInstance.findAll({ where: { categoryId: categoryId } })
            const categoryFilterValues = await FilterValue.findAll({ where: { categoryId: categoryId } });

            if (data.filterRequest.filters.length > 0) {
                const checkedFilterValues = data.filterRequest.filters




                 filterValueQuantities = filterService.getFilterValueQuantities(
                    filterInstances, checkedFilterValues, categoryFilterValues)//----------------
                

                let filteredProductId = []
                

                const filterInstancesFiltered = filterService.getFilterdInstances(filterInstances, checkedFilterValues)

                
                filterInstancesFiltered.map(instance => {
                    filteredProductId.push(instance.productId)
                })

                filteredProductId = [...new Set(filteredProductId)] //убираем дубликаты filteredId



                const products = await Product.findAll({ where: { id: filteredProductId } })
                return res.json({products, filterValueQuantities});
            } else {                
                const products = await Product.findAll({ where: { categoryId: categoryId } })

                const filterValuesDTOs = filterService.getFilterValuesDTOs(categoryFilterValues)
                filterValueQuantities = filterService.getAllFilterValueQuantities(filterValuesDTOs, filterInstances)

                return res.json({products, filterValueQuantities});
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

            console.log(product)

            const newProduct = await Product.create({
                name: product.name, categoryId: product.categoryId, brandId: product.brandId,
                price: product.price, picture: product.picture
            });
            return res.json(newProduct);
            // return ;
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
