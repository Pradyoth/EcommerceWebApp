const Product = require('../models/product');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const ObjectId = mongodb.ObjectId;
const Cart = require('../models/cart');
const { validationResult } = require('express-validator/check');
exports.getAddProduct = (req,res,next) => {
    if (!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    res.render('admin/edit-product',{
        pageTitle: 'Add product',
        editing:false,
        hasError: false,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: null
    });
};
exports.postAddProduct =(req,res,next) => {
    // console.log(req.body.title);
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    
    if (!image){

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing:false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image',
            validationErrors: []

        });
    }
   
    
    // if(!errors.isEmpty()){
    //     console.log(errors.array());
    //     return res.render('admin/edit-product',{
    //         pageTitle: 'Edit product',
    //         editing:false,
    //         product:{
    //             title: title,
    //             imageUrl:imageUrl,
    //             price: price,
    //             description: description
    //         },
    //         hasError: true,
    //         isAuthenticated:req.session.isLoggedIn,
    //         errorMessage: errors.array()[0].msg
    //     })
    // }
    const imageUrl = image.path
    const product = new Product({title:title,price:price,description:description,
        imageUrl:imageUrl,userId:req.user._id});
    product.save().then(result => {
        console.log('Created product');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}
exports.getEditProduct = (req,res,next) => {
    const editMode = req.query.edit;
    const productId = req.params.productId;
    // Product.findByPk(productId)
    Product.findById(productId)
    .then(product => {
        
        if(!product){
            return res.redirect('/');
        }
        res.render('admin/edit-product',{
            pageTitle: 'Edit product',
            editing:editMode,
            product:product,
            hasError:false,
            isAuthenticated:req.session.isLoggedIn,
            errorMessage:null
        })

    }).catch(error => console.log(error));
    
}
exports.postEditProduct = (req,res,next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDescription = req.body.description;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.render('admin/edit-product',{
            pageTitle: 'Edit product',
            editing:true,
            product:{
                title: updatedTitle,
                
                price: updatedPrice,
                description: updatedDescription,
                _id: productId
            },
            hasError: true,
            isAuthenticated:req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg
        })
    }

    Product.findById(productId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()){
            console.log("product and user id don't match!!!")
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        if (image){
            product.imageUrl = image.path
        }
        product.description = updatedDescription;
        return product.save().then(result => {
            console.log(result);
            res.redirect('/admin/products');
    })
    }).catch(error => console.log(error));
};

exports.deleteProduct = (req,res,next) => {
    const productId = req.params.productId; 

    Product.findByIdAndRemove(productId).then(() => {
        res.status(200).json({ message: 'Success!'})
    }).catch(error => {
        res.status(500).json({ message: 'Product deleting failed'})
    })
}

exports.getProducts = (req,res,next) => {

    // Product.findAll()
    Product.find({userId: req.user._id})
    // .select('title price')
    // .populate('userId')
    .then(products => {
        console.log(products)
        res.render('admin/products', {
            prods:products,
            pageTitle:'Admin Product',
            isAuthenticated:req.session.isLoggedIn
        });
    }).catch(error => console.log(error));
    
}