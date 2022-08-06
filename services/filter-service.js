class FilterService {
    async getsetFilterValueGroup(filterValues) {
        if (filterValues.lenght ===0) {
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

    
}

module.exports = new FilterService();