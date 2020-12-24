const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email :{
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items:[
            {
                productId: { type: Schema.Types.ObjectId, ref:'Product', required:true},
                quantity: {type:Number, required:true}
            }
        ]
    }
})

userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString();
    })

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
   

    if (cartProductIndex >= 0){
        newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;

    }
    else {
        updatedCartItems.push({productId: product._id,quantity:newQuantity});
    }

    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(productId){
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    })
    this.cart.items = updatedCartItems;
    return this.save();
}
userSchema.methods.clearCart = function() {
    this.cart = { items: []}
    return this.save()
}

module.exports = mongoose.model('User', userSchema);




// const getDb = require('./util/database').getDb;
// const mongodb = require('mongodb');
// class User {
//     constructor(username,email,cart, id){
//         this.name = username;
//         this.email = email;
//         this.cart = cart; //{items : []}
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         db.collection('users').insertOne(this);


    
    //addToCart(product){
        // const cartProduct = this.cart.items.findIndex(item => {
        //     return item._id === product._id;
        // })
        // const cartProductIndex = this.cart.items.findIndex(item => {
        //     return item.productId.toString() === product._id.toString();
        // })

        // let newQuantity = 1;
        // const updatedCartItems = [...this.cart.items];
       

        // if (cartProductIndex >= 0){
        //     newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
        //     updatedCartItems[cartProductIndex].quantity = newQuantity;

        // }
        // else {
        //     updatedCartItems.push({productId: new mongodb.ObjectId(product._id),quantity:newQuantity});
        // }

        // const updatedCart = {
        //     items: updatedCartItems
        // };

        // product.quantity = 1;
        // const db = getDb();
        // return db.collection('users').updateOne({_id : new mongodb.ObjectId(this._id)},
        //                                     {$set:{cart:updatedCart}});
    //}

//     getCart(){

//         const db = getDb();
        
//         const productIds = this.cart.items.map(item => {
//             return item.productId;
//         })

//         return db.collection('products').find({_id: {$in:productIds}}).toArray()
//                 .then(products => {
//                     return products.map(product => {
//                         return {
//                             ...product,
//                             quantity:this.cart.items.find(item => {
//                                 return item.productId.toString() === product._id.toString()
//                             }).quantity
//                         }
//                     })
//                 }).catch(error => console.log(error))
//     }

//     deleteItemFromCart(productId){
//         const db = getDb();
        

//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         })

//         return db.collection('users').updateOne
//         ({_id : new mongodb.ObjectId(this._id)},{$set:{cart:{items:updatedCartItems}}});


//     }

//     addOrder(){
//         const db = getDb();

//         return this.getCart().then(products => {

//             const order = {
//                 items: products,
//                 user : {
//                     _id: mongodb.ObjectId(this._id),
//                     name: this.name,
//                     email:this.email
//                 }
//             }
//             return db.collection('orders').insertOne(order)
//         })
//         .then(result=> {
//             this.cart = {items: []}
            
//             return db.collection('users').updateOne
//             ({_id : new mongodb.ObjectId(this._id)},{$set:{cart:{items:[]}}});
//         }
            

//         )


//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': mongodb.ObjectId(this._id)}).toArray()
//     }

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)}).then(user => {
//             console.log(user);
//             return user;
//         }).catch(error => console.log(error));
//     }
// }

// module.exports = User;