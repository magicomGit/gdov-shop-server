module.exports = class FilterInstanceDTO {        
    id;
    productId;
    categoryId;
    filterNameId;    
    filterName;    
    value;   

    constructor(productId, filterInstance ){        
        this.id = filterInstance.id
        this.productId = productId
        this.categoryId = filterInstance.categoryId
        this.filterNameId = filterInstance.filterNameId
        this.filterName = filterInstance.filterName
        this.value = filterInstance.value
        
    }
}
