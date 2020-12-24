const express = require('express');

const path = require('path');

const AdminData = require('./admin');
const router = express.Router();
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/', shopController.getIndex);
router.get('/products',shopController.getProducts);

router.get('/products/:productId',shopController.getProduct);

router.get('/cart',isAuth,shopController.getCart);
router.get('/checkout',isAuth, shopController.getCheckout)
router.post('/cart',isAuth,shopController.postCart);
// // router.get('/checkout',shopController.getCheckout);
router.get('/orders',isAuth,shopController.getOrders);
router.post('/cart-delete-item',isAuth,shopController.postCartDeleteProduct);




module.exports = router;

