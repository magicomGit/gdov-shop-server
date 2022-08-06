module.exports = class FilterInstanceDTO {        
    productId;
    categoryId;
    filterNameId;    
    filterName;    
    value;   

    constructor(productId, filterValue ){        
        this.productId = productId
        this.categoryId = filterValue.categoryId
        this.filterNameId = filterValue.filterNameId
        this.filterName = filterValue.filterName
        this.value = filterValue.value
        
    }
}
