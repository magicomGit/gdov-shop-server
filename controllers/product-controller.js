const ApiError = require('../exceptions/api-error');
const { Category, Brand, Product, FilterInstance, FilterValue, Property, Comment } = require('../models/models')
const uuid = require('uuid');
const path = require('path');
const filterService = require('../services/filter-service');
const FilterInstanceDTO = require('../dtos/FilterInstanceDTO');
const { Sequelize } = require('sequelize')

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

        let filterValueQuantities = []
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



                //const products = await Product.findAll({ where: { id: filteredProductId }, include: Property })
                const products = await Product.findAll({where: { categoryId: categoryId }, 
                    include: [Property,{model:Comment, attributes: ['id']}]})

                return res.json({ products, filterValueQuantities });
            } else {
                const products = await Product.findAll({
                    where: { categoryId: categoryId }, 
                    include: [
                        Property,
                        //{model: Comment, attributes: [[Sequelize.fn('COUNT', Sequelize.col('comments.id'))]]}
                        {model:Comment, attributes: ['id']}   
                    ]   
                })//.then(products=> products.map(product=> product.comments = product.comments.length))   
                
 
                // const products = await sequelize.query(`SELECT products.name,  COUNT(comments.id) AS commentCnt
                // FROM products                             
                // LEFT JOIN comments ON comments.productId = products.id
                // WHERE categoryId = ${categoryId} 
                // GROUP BY products.id
                // `)
                //include:{model:Property, where:{value:'6 ГБ'}} })
                
                const filterValuesDTOs = filterService.getFilterValuesDTOs(categoryFilterValues)
                filterValueQuantities = filterService.getAllFilterValueQuantities(filterValuesDTOs, filterInstances)

                return res.json({ products, filterValueQuantities });
            }



        } catch (e) {
            next(e);
        }
    }


    async newProduct(req, res, next) {
        try {

            const data = req.body;
            //console.log('------------------------------------',data)

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

            return res.json(newProduct);
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
