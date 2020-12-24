const express = require('express');
const authController = require('../controllers/auth');
const { check,body } = require('express-validator/check');
const User = require('../models/user');
const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup',authController.getSignup);

router.post('/signup', 
[
check('email').isEmail().withMessage('Please enter valid email')
                        .custom((value, {req}) => {
                            // if (value === 'test@test.com'){
                            //     throw new Error('This email address has been forbidden');
                            // }
                            // else {
                            //     return true;
                            
                            return User.findOne({ email: value})
                                .then(userDoc => {
                                    if (userDoc){
                                        return Promise.reject('Email id already exists. Try different one')
                                    }
                                    else 
                                    {
                                        return true;
                                    }
                                }) 
                        }),
body('password')
    .isLength({ min: 5})
    .withMessage(
        'Please enter a password with only numbers and text and atleast 5 characters'
    ),
body('confirmPassword').custom((value,{req}) => {
    if (value !== req.body.password){
        throw new Error('Passwords dont match!')
    }
    return true;
})
                    ],
 authController.postSignup);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);  
router.post('/reset',authController.postReset);

router.get('/reset',authController.getReset);

router.get('/reset/:token',authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;


