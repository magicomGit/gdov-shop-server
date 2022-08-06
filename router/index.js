const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const productController = require('../controllers/product-controller');
const filterController = require('../controllers/filter-controller');

const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/account/register',
    //authMiddleware,
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.register
);
router.post('/account/login', userController.login);
router.post('/account/logout', userController.logout);
router.get('/account/activate', userController.activate);
router.get('/account/refresh', userController.refresh);
router.get('/account/users',  userController.getUsers);
//--------------------------------
router.get('/product/getCategories',  productController.getCategories);
router.post('/product/newCategory',  productController.newCategory);
router.delete('/product/deleteCategory',  productController.deleteCategory);

router.get('/product/getBrands',  productController.getBrands);
router.post('/product/newBrand',  productController.newBrand);
router.delete('/product/deleteBrand',  productController.deleteBrand);

router.get('/product/getProducts',  productController.getProducts);
router.post('/product/newProduct',  productController.newProduct);
router.delete('/product/deleteProduct',  productController.deleteProduct);
router.post('/product/getFilteredProducts',  productController.getFilteredProducts);

router.get('/filter/getFilterNames',  filterController.getFilterNames);
router.post('/filter/newFilterName',  filterController.newFilterName);
router.delete('/filter/deleteFilterName',  filterController.deleteFilterName);

//--------------------------------
router.get('/filter/getFilterValuesByFilterNameId',  filterController.getFilterValuesByFilterNameId);
router.get('/filter/getFilterValuesByCategoryId',  filterController.getFilterValuesByCategoryId);
router.post('/filter/newFilterValue',  filterController.newFilterValue);
router.delete('/filter/deleteFilterValue',  filterController.deleteFilterValue);
router.post('/filter/newFilterInstance',  filterController.newFilterInstance);

module.exports = router
