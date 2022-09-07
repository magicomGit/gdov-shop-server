const ApiError = require('../exceptions/api-error');
const { Category, Brand, Product, FilterInstance, FilterValue, Property, Comment } = require('../models/models')
const uuid = require('uuid');
const path = require('path');
const filterService = require('../services/filter-service');
const FilterInstanceDTO = require('../dtos/FilterInstanceDTO');
const { Sequelize, Op } = require('sequelize')


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
        console.log(data)
        if (!data.limit || !data.page) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        const offset = data.limit * (data.page - 1)
        
        try {
            const products = await Product.findAndCountAll({ offset: offset, limit: Number(data.limit) });
            return res.json(products);
        } catch (e) {
            next(e);
        }
    }

    async getFilteredProducts(req, res, next) {
        const data = req.body
        if (!data.filterRequest.categoryId) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        if (!data.filterRequest.limit || !data.filterRequest.page) {
            return ApiError.BadRequest('Не корректный запрос')
        }
        //------------------------
        const offset = data.filterRequest.limit * (data.filterRequest.page - 1)
        const limit = data.filterRequest.limit
        //--------------------
        const categoryId = data.filterRequest.categoryId
        
        //запрос на id продуктов отфильтрованных по цене
        const ids = []
        const productIds = await Product.findAll({where:
            {price:{ [Op.and]:[{[Op.gte]:data.filterRequest.priceRange[0]},{[Op.lte]:data.filterRequest.priceRange[1]}]}},
            attributes: ['id']})
            productIds.map(product=> ids.push(product.id))
            
        //--------------------------------------------
        let filterValueQuantities = []
        try {
            const filterInstances = await FilterInstance.findAll({ where: {[Op.and]:[{categoryId: categoryId}, {productId:ids}]  } })
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

                
                let products = await Product.findAll({where: { id: filteredProductId }, 
                    include: [Property,{model:Comment, attributes: ['id']}]
                })

                const count = products.length
                products = products.filter((product, index)=> index >= offset && index < offset + limit)
                return res.json({ products, filterValueQuantities, count });
            } else {
                let products = await Product.findAll({where: {[Op.and]:[{ 
                    categoryId: categoryId, 
                    price:{ [Op.and]:[{[Op.gte]:data.filterRequest.priceRange[0]},{[Op.lte]:data.filterRequest.priceRange[1]}]}                    
                }]}, 
                    include: [Property,{model:Comment, attributes: ['id']}]  // массив id комментов переделать на количество комментов              
                })
                
 
                
                const count = products.length// количество отфильтрованных продуктов для пагинации
                products = products.filter((product, index)=> index >= offset && index < offset + limit)
                
                const filterValuesDTOs = filterService.getFilterValuesDTOs(categoryFilterValues)
                //набор фильтров для категории с количеством подходящих моделей продукта
                filterValueQuantities = filterService.getAllFilterValueQuantities(filterValuesDTOs, filterInstances)

                return res.json({ products, filterValueQuantities, count});
            }



        } catch (e) {
            next(e);
        }
    }


    async newProduct(req, res, next) {
        try {

            const data = req.body;
            console.log('------------------------------------',data)

            const newProduct = await Product.create(data.product)
                .then(product => {
                    data.properties.map(property => property.productId = product.id)

                    const filterInstancesDTO = []
                    data.selectedFilterValues.map(filterValue => {
                        filterInstancesDTO.push(new FilterInstanceDTO(product.id, filterValue))
                    })

                    Property.bulkCreate(data.properties)
                    FilterInstance.bulkCreate(filterInstancesDTO)

                })

            return res.json('newProduct');
            //return ;
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

    async newProperty(req, res, next) {
        const data = req.body;
        console.log(data)

        try {
            const response = await Property.bulkCreate(data.properties)
            //const response = await Property.create({name: '654', value:'sdfs', productId:15})

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async uploadImg(req, res, next) {
        try {


            if (req.files) {
                const file = req.files
                const fileName = uuid.v4() + ".jpg"
                file.Img.mv(path.resolve(__dirname, '..', 'static', fileName))
                return res.json(fileName);
            } else {
                return ApiError.BadRequest('Не найдено изображение')
            }

            // return ;
        } catch (e) {
            next(e);
        }
    }

    async getProduct(req, res, next) {
        const data = req.query;

        try {
            const response = await Product.findByPk(data.id, { include: [Property, Comment] })
            //const response = await Property.create({name: '654', value:'sdfs', productId:15})

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }


}


module.exports = new ProductController();
