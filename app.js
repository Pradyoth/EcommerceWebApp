const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Product = require('./models/product');
const User = require('./models/user');
const adminRoutes = require('./routes/admin');
const errorController = require('./controllers/ErrorPage');
const userRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

// const mongoConnect = require('./models/util/database').mongoConnect;
const mongoose = require('mongoose');
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'images');
    },
    filename: (req,file,cb) => {
        cb(null,file.filename + '-' + file.originalname);
    }
})

const MONGODB_URI = 'mongodb+srv://pradhi96:Praveen!23@cluster0-njvq2.mongodb.net/test';
const store = new MongoDBStore({
    uri:MONGODB_URI,
    collection: 'sessions'
});

app.use(session({secret: 'my secret', resave:false,saveUninitialized:false, store:store}))
app.use(flash());

app.use((req,res,next) => {
    User.findById('5cac0d33262c0d51c9b29146')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(error => console.log(error));
})

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({storage: fileStorage}).single('image'));
app.use(express.static(path.join(__dirname,'public')));

app.use('/images',express.static(path.join(__dirname,'images')));

app.post('/create-order',isAuth,shopController.postOrder);
app.use('/admin',adminRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use(errorController.showErrorPage);

mongoose.connect(MONGODB_URI)
                .then(result => {    
                    app.listen(3002);
                }
                ).catch(error => console.log(error));








