const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const products = [];

const ITEMS_PER_PAGE = 2;
exports.getProducts = (req,res,next) => {
    
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
            .countDocuments()
            .then(numProducts => {
                totalItems = numProducts;
                return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                
            })
            .then((products) => {
                res.render('shop/product-list', {
                    prods:products,
                    currentPage:page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    docTitle: 'Products',
                    isAuthenticated:req.session.isLoggedIn,
                    nextPage: page + 1,
                    previousPage: page -1,
                    lastPage: Math.ceil(totalItems/ ITEMS_PER_PAGE)
                });
    
    
    
    }).catch(err => console.log(err));
    
}
exports.getProduct = (req,res,next) => {
    const productId = req.params.productId;

    // Product.findAll({where: {id:productId}}).then(products => {
    //     res.render('shop/product-detail',{
    //         product:products[0],
    //         title:'Shop detail'
    //     })  
    // }).catch(err => console.log(err));

    Product.findById(productId).then(product=> {

        res.render('shop/product-detail',{
            product:product,
            title:'Shop detail',
            isAuthenticated:req.session.isLoggedIn
        })
    }).catch(error => console.log(error));
   
    // Product.findByPk(productId).then(product => {
    //     res.render('shop/product-detail',{
    //         product:product,
    //         title:'Shop detail'
    //     })  
    // }).catch(err => console.log(err));
     
}
exports.postCart = (req,res,next) => {
    const productId = req.body.productId;

    Product.findById(productId).then(product => {
        console.log('user is'+req.user)
        return req.user.addToCart(product)
    }).then(result => {
        console.log(result);
        res.redirect('/cart');
    }).catch(error => console.log(error));
    // let fetchedCart;
    // req.user
    //     .getCart().then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts({where: {id:productId}})
    //     }).then(products => {
    //         let product;
    //         if (products.length > 0){
    //             product = products[0];

    //         }
    //         let newQuantity = 1;
    //         if (product){
    //             const oldQuantity = product.cartItem.quantity;
    //             console.log('Old quantity is' +oldQuantity);
    //             newQuantity = oldQuantity + 1;
    //             return fetchedCart.addProduct(product,{
    //                 through: {quantity: newQuantity}
    //             })

    //         }
    //         return Product.findByPk(productId)
    //         .then(product => {
    //             console.log('product is' +product.id);
    //             console.log('product title is' +product.title);
    //             return fetchedCart.addProduct(product,{ through: {quantity:newQuantity}});
    //         })
            
    //         .catch(error => console.log(error));
    //     })
    //     .then(() => {
    //         res.redirect('/cart');
    //     })
        
    //     .catch(error => console.log(error));
}
exports.getIndex = (req,res,next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
            .countDocuments()
            .then(numProducts => {
                totalItems = numProducts;
                return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                
            })
            .then((products) => {
                res.render('shop/index', {
                    prods:products,
                    currentPage:page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    docTitle: 'Shop',
                    isAuthenticated:req.session.isLoggedIn,
                    nextPage: page + 1,
                    previousPage: page -1,
                    lastPage: Math.ceil(totalItems/ ITEMS_PER_PAGE)
                });
    
    
    
    }).catch(err => console.log(err)); 
}

exports.getCheckout = (req,res,next) => {
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => { 
        console.log(user.cart.items);
        let total = 0;
        const products = user.cart.items;
        products.forEach(p => {
            total += p.quantity * p.productId.price
        })
        res.render('shop/checkout', {
            path:'/checkout',
            pageTitle:'Checkout',
            products: products,
            totalSum: total,
            isAuthenticated:req.session.isLoggedIn
        });
    }).catch(error => console.log(error));

}
exports.postCartDeleteProduct = (req,res,next) => {
    const productId = req.body.productId;
    console.log('product id is ' +productId);
    req.user.removeFromCart(productId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(error => console.log(error));   
}

exports.postOrder = (req,res,next) => {

    const stripe = require('stripe')('sk_test_Pks9aEKyvvhvveNktWULNFjl00JtGNsVRX')


    const token = req.body.stripeToken;
    let totalSum = 0;
    
    req.user.populate('cart.items.productId')
            .execPopulate()
            .then(user => {
                user.cart.items.forEach(p => {
                    totalSum += p.quantity * p.productId.price;
                })
            
                // console.log('Cart items are----')
                // console.log(user.cart.items)
                const products = user.cart.items.map(i => {
                    return {quantity: i.quantity, product: {...i.productId._doc} }
                })
 
                const order = new Order({
                    user : {
                     email: req.user.email,
                     userId:req.user
                    },
                    products:products
                 })
                return order.save()
            })
            .then(result => {
                const charge = stripe.charges.create({
                    amount:totalSum * 100,
                    currency:'usd',
                    description: 'Example charge',
                    source: token,
                    metadata: {order_id: result._id.toString()}
                })
                return req.user.clearCart();
            })
            .then(() => {
                res.redirect('/orders');
            })
            .catch(error => console.log(error));

    
}

exports.getCart = (req,res,next) => {

    console.log(req.user.cart);

    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => { 
        console.log(user.cart.items);
        const products = user.cart.items;
        res.render('shop/cart', {
            path:'/cart',
            pageTitle:'Your cart',
            products: products,
            isAuthenticated:req.session.isLoggedIn
        });
    }).catch(error => console.log(error));
    // Cart.getCart(cart => {
        // Product.fetchAll(products => {
        //     const cartProducts = [];
        //     for (product of products) {
        //         const cartProductData = cart.products.find(prod => prod.id === product.id)
        //         if (cartProductData){
        //             cartProducts.push({productData:product,qty:cartProductData.qty})
        //         }
        //     }

        //     res.render('shop/cart', {
        //         path: '/cart',
        //         pageTitle: 'Your cart',
        //         products:cartProducts
        //     });
        // })
        
    // })
    
};
exports.getOrders = (req,res,next) => {

    Order.find({"user.userId": req.user._id}).then(orders => {

        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your orders',
            orders:orders,
            isAuthenticated:req.session.isLoggedIn,
            
        });
    })
    .catch(error => console.log(error))
    
};





