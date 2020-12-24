const bcrypt = require('bcryptjs');
const User = require('../models/user');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}))

exports.getLogin = (req,res,next) => {
        let message = req.flash('error');
        if (message.length > 0){
            message = message[0];
        }
        else {
            message = null;
        }
        console.log(req.session.isLoggedIn);
        res.render('auth/login', {
            path: '/login',
            pageTitle: 'Your Login',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: message,
            oldInput: {
                email: "",
                password: ""
            }
        });   
};

exports.postLogin = (req,res,next) => {

       const email = req.body.email;
       const password = req.body.password;
        const errors = validationResult(req);

        if (!errors.isEmpty()){
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                isAuthenticated:false,
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email: email,
                    password: password
                }
            })
        }

       User.findOne({ email: email})
            .then(user => {
                if (!user){
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        isAuthenticated:false,
                        oldInput: {
                            email: email,
                            password: password
                        }
                    })        
                }
             bcrypt.compare(password,user.password).then(
                 doMatch => {
                     console.log("value of do match is" +doMatch)
                     if (doMatch){
                         req.session.isLoggedIn = true;
                         req.session.user = user;
                         return req.session.save(err => {
                             console.log(err);
                             res.redirect('/');
                         })
                         
                     }
                     return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        isAuthenticated:false,
                        oldInput: {
                            email: email,
                            password: password
                        }
                    })  
                        
                     
                      
                 }
             ).catch(error => {
                 console.log(error);
                 return res.redirect('/login');
             })
            })    
     
}

exports.postLogout = (req,res,next) => {
    req.session.destroy((error) => {
        console.log(error);
        res.redirect('/');
    })
}
exports.getSignup = (req,res,next) => {
    let message = req.flash('error');
    if (message.length > 0){
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/signup', {
        path:'/signup',
        pageTitle:'Signup',
        isAuthenticated:false,
        errorMessage:message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        }
    })
}

exports.postSignup = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path:'/signup',
            pageTitle:'Signup',
            isAuthenticated:false,
            errorMessage:errors.array()[0].msg,
            oldInput: { email: email, password:password, confirmPassword: confirmPassword}
        })
    }

    
             bcrypt.hash(password,12)
            .then(hashedPassword => {
                const user = new User({
                    email:email,
                    password:hashedPassword,
                    cart : { items : []}
                })
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                return transporter.sendMail({
                    to:email,
                    from:'shop@node-complete.com',
                    subject: 'Signup succeded!',
                    html: '<h1> You have successfully signed up! </h1>'
                })
            }).catch(error => console.log(error));
           
       
}

exports.getReset = (req,res,nex) => {

    let message = req.flash('error');
        if (message.length > 0){
            message = message[0];
        }
        else {
            message = null;
        }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset password',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: message
    });   
}

exports.postReset = (req,res,next) => {
    crypto.randomBytes(32,(err,buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email}).then(user => {
            if (!user){
                req.flash('error', 'No user with that email addresss');
                return res.redirect('/reset');
            }
            console.log('Token is' +token);
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000
            return user.save();

        })
        .then(result => {
            //res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from:'shop@node-complete.com',
                subject: 'Password reset',
                html: `
                    <p> You have requested password reset </p>
                    <p> Click this <a href="http://localhost:3000/reset/${token}"> Link </a> to set a new password </p>
                `
            })

        })
        .catch(error => console.log(error))
    })
}

exports.getNewPassword = (req,res,next) => {

    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now()}})
    .then(user => {
        let message = req.flash('error');
        if (message.length > 0){
            message = message[0];
        }
        else {
            message = null;
        }

    res.render('auth/new-password', {
        path: '/reset',
        pageTitle: 'Reset password',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
    });   
    }).catch(error => console.log(error))
    
}

exports.postNewPassword = (req,res,next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({resetToken: passwordToken,
         resetTokenExpiration: {$gt : Date.now()},
         _id: userId
    }).then(
        user => {
            resetUser = user;
            return bcrypt.hash(newPassword,12)
        }
    )
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();

    }).then(result => {
        res.redirect('/login');
    })
    .catch(error => console.log(error));


}