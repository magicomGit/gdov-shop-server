const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const productController = require('../controllers/product-controller');
const filterController = require('../controllers/filter-controller');
const commentController = require('../controllers/comment-controller');

const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const roleAuthMiddleware = require('../middlewares/roleAuth-middleware');

router.post('/account/register',
    //authMiddleware,
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.register
);
router.post('/account/yandexAuth', userController.yandexAuth);
router.post('/account/login', userController.login);
router.post('/account/logout', userController.logout);
router.get('/account/activate', userController.activate);
router.get('/account/refresh', userController.refresh);
router.get('/account/users',  roleAuthMiddleware, userController.getUsers);
//--------------------------------
router.get('/product/getCategories',  productController.getCategories);
router.post('/product/newCategory',  roleAuthMiddleware, productController.newCategory);
router.delete('/product/deleteCategory', roleAuthMiddleware,productController.deleteCategory);

router.get('/product/getBrands',  productController.getBrands);
router.post('/product/newBrand', roleAuthMiddleware, productController.newBrand);
router.delete('/product/deleteBrand', roleAuthMiddleware, productController.deleteBrand);

router.get('/product/getProducts',  productController.getProducts);
router.post('/product/newProduct',  roleAuthMiddleware, productController.newProduct );
router.delete('/product/deleteProduct', roleAuthMiddleware, productController.deleteProduct);
router.post('/product/getFilteredProducts',  productController.getFilteredProducts);
router.put('/product/newProperty',  roleAuthMiddleware, productController.newProperty);

router.get('/filter/getFilterNames',  filterController.getFilterNames);
router.post('/filter/newFilterName',roleAuthMiddleware, filterController.newFilterName);
router.delete('/filter/deleteFilterName', roleAuthMiddleware,filterController.deleteFilterName);

//--------------------------------
router.get('/filter/getFilterValuesByFilterNameId',  filterController.getFilterValuesByFilterNameId);
router.get('/filter/getFilterValuesByCategoryId',  filterController.getFilterValuesByCategoryId);
router.post('/filter/newFilterValue',  roleAuthMiddleware, filterController.newFilterValue);
router.delete('/filter/deleteFilterValue', roleAuthMiddleware, filterController.deleteFilterValue);
router.post('/filter/newFilterInstance',  roleAuthMiddleware, filterController.newFilterInstance);
//-------------------------------------------------------------------------------------------------
router.post('/product/uploadImg',  productController.uploadImg);
router.get('/product/getProduct',  productController.getProduct);
//-------------------------------------------------------------------------------------------------
router.get('/comment/getComments',  commentController.getComments);
router.put('/comment/newComment', authMiddleware, commentController.newComment);

module.exports = router
