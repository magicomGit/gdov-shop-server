const FilterInstanceDTO = require('../dtos/FilterInstanceDTO');
const ApiError = require('../exceptions/api-error');
const { ProperyTemplate, FilterName, FilterValue, FilterInstance, Category } = require('../models/models')

class FilterController {



    async getFilterNames(req, res, next) {
        const data = req.query
        
        if (!data.categoryId) {
            return ApiError.BadRequest('В запросе отсутствует категория товара')
        }
        try {
            const names = await FilterName.findAll({ where: { categoryId: data.categoryId } });
            return res.json(names);
        } catch (e) {
            next(e);
        }
    }

    async newFilterName(req, res, next) {
        const data = req.body;
        //console.log(data.filterName.categoryId)
        if (data.filterName.name.length < 2) {
            return ApiError.BadRequest('В запросе не достаточно символов')
        }

        
        try {
            Category.findByPk(data.filterName.categoryId).then(category =>{
                if(!category) return console.log("category not found");
                const filterName = category.createFilterName({
                    name: data.filterName.name,
                    categoryId: data.filterName.categoryId
                });
                return res.json(filterName);
            })
            // const filterName = await FilterName.create({
            //     name: data.filterName.name,
            //     categoryId: data.filterName.categoryId
            // });
        } catch (e) {
            next(e);
        }
    }

    async deleteFilterName(req, res, next) {
        const data = req.body;
        try {
            const response = await FilterName.destroy({ where: { id: data.id } });

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
    //--------------------------------------------------------
    async getFilterValuesByFilterNameId(req, res, next) {
        const data = req.query

        try {
            const properties = await FilterValue
                .findAll({ where: { filterNameId: data.filterNameId } });
            return res.json(properties);
        } catch (e) {
            next(e);
        }
    }

    async getFilterValuesByCategoryId(req, res, next) {
        const data = req.query
        
        try {
            const properties = await FilterValue
                .findAll({ where: { categoryId: data.categoryId } });

            //const templateGroup = filterService.getsetFilterValueGroup(properties)

            return res.json(properties);
        } catch (e) {
            next(e);
        }
    }

    async newFilterValue(req, res, next) {
        const data = req.body;


        try {
            const property = await FilterValue.create({
                name: data.template.name,
                categoryId: data.template.categoryId,
                filterNameId: data.template.filterNameId,
                filterName: data.template.filterName,
                value: data.template.value,                
            });
            return res.json(property);
        } catch (e) {
            next(e);
        }
    }

    async deleteFilterValue(req, res, next) {
        const data = req.body;
        try {
            const response = await ProperyTemplate.destroy({ where: { id: data.id } });

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async newFilterInstance(req, res, next) {
        const data = req.body;
        const productId = data.filterInstance.productId
        const filterInstanceDTO = []
        console.log(data)

        data.filterInstance.filterValues.map(filterValue =>{
            filterInstanceDTO.push(new FilterInstanceDTO(productId, filterValue))
        })

        
        try {
            const response = await FilterInstance.bulkCreate(filterInstanceDTO)

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

}


module.exports = new FilterController();
