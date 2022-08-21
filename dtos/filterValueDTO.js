module.exports = class FilterValueDTO {        
    id;
    productQty;
    categoryId;
    filterNameId;    
    filterName;    
    value;   

    constructor(productQty, filterValue ){        
        this.id = filterValue.id
        this.categoryId = filterValue.categoryId
        this.filterNameId = filterValue.filterNameId
        this.filterName = filterValue.filterName
        this.value = filterValue.value
        this.productQty = productQty        
    }
}
