const FilterValueDTO = require("../dtos/filterValueDTO")

class FilterService {
    getsetFilterValueGroup(filterValues) {
        if (filterValues.lenght === 0) {
            return
        }

        let templates = []
        let templateGroup = []
        let lastgroupName = ''
        filterValues.map(template => {
            if (lastgroupName === '') {
                lastgroupName = template.propertyName
            }


            if (lastgroupName !== template.propertyName) {
                templateGroup.push({ groupName: lastgroupName, templates: templates })
                templates = []
                lastgroupName = template.propertyName

            }
            templates.push(template)
        })
        //last group
        templateGroup.push({ groupName: lastgroupName, templates: templates })
        return templateGroup


    }

    getFilterValuesDTOs(FilterValues){
        const filterValuesDTOs = []

        FilterValues.map(filter => {
            filterValuesDTOs.push(new FilterValueDTO(0, filter))            
        })

        return filterValuesDTOs
    }

    getFilterValueQuantities(filterInstances, checkedFilterValues, categoryFilterValues) {
        const categoryFilterValuesDTOs = []
        const groupFilterValuesDTOs = []
        let filterNamesId = []
        let filterInstancesTemp = []
        let checkedFilterValuesTemp = []

        categoryFilterValues.map(filter => {
            categoryFilterValuesDTOs.push(new FilterValueDTO(0, filter))
            filterNamesId.push(filter.filterNameId)
        })

        filterNamesId = [...new Set(filterNamesId)] //убираем дубликаты


        filterNamesId.map(filterNameId => {
            checkedFilterValuesTemp = checkedFilterValues.filter(filterValue =>
                filterValue.filterNameId !== filterNameId
            )
            filterInstancesTemp = this.getFilterdInstances(filterInstances, checkedFilterValuesTemp)
            checkedFilterValuesTemp = []

            const tempDTOs = this.getProductQtyForfilterNameId(
                categoryFilterValuesDTOs, filterInstancesTemp, filterNameId)

                groupFilterValuesDTOs.push(tempDTOs)
                
                
            })
            
            const finalFilterValuesDTOs = []
            
            groupFilterValuesDTOs.map(grope =>{
                finalFilterValuesDTOs.push(...grope)
            })
            
            return finalFilterValuesDTOs


    }

    getProductQtyForfilterNameId(categoryFilterValuesDTOs, filterInstances, filterNameId) {
        categoryFilterValuesDTOs = categoryFilterValuesDTOs.filter(filterDTO => filterDTO.filterNameId === filterNameId)

        categoryFilterValuesDTOs.map(filterDTO => {
            const InstancesForFilterValuesDTO = filterInstances.filter(instance =>
                filterDTO.filterNameId === instance.filterNameId && filterDTO.value === instance.value                

            )

            filterDTO.productQty = InstancesForFilterValuesDTO.length
        })


        return categoryFilterValuesDTOs
    }

    getAllFilterValueQuantities(categoryFilterValuesDTOs, filterInstances) {
        
        categoryFilterValuesDTOs.map(filterDTO => {
            const InstancesForFilterValuesDTO = filterInstances.filter(instance =>
                filterDTO.filterNameId === instance.filterNameId && filterDTO.value === instance.value                

            )

            filterDTO.productQty = InstancesForFilterValuesDTO.length
        })


        return categoryFilterValuesDTOs
    }

    getFilterdInstances(filterInstances, checkedFilterValues) {
        let groupCheckedFilters = {};

        let filteredIdGroup = []
        let filteredGroup = []

        checkedFilterValues.map(filterValue => {   //группируем выбранные фильтры         
            if (!groupCheckedFilters[filterValue.filterNameId]) {
                groupCheckedFilters[filterValue.filterNameId] = [filterValue.value]
            } else {
                groupCheckedFilters[filterValue.filterNameId].push(filterValue.value)
            }
        })

        console.log(groupCheckedFilters)
        //----------
        for (var key in groupCheckedFilters) {
            //console.log(key, groupCheckedFilters[key])
            groupCheckedFilters[key].map(groupItem => {
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

        return filterInstances
    }

}

module.exports = new FilterService();