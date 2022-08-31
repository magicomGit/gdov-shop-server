module.exports = class FilterInstanceDTO {        
    id;
    productId;
    categoryId;
    filterNameId;    
    filterName;    
    value;   

    constructor(productId, filterValue ){        
        this.id = 0
        this.productId = productId
        this.categoryId = filterValue.categoryId
        this.filterNameId = filterValue.filterNameId
        this.filterName = filterValue.filterName
        this.value = filterValue.value
        
    }
}
