const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {

MongoClient.connect("mongodb+srv://pradhi96:Praveen!23@cluster0-njvq2.mongodb.net/test?retryWrites=true",{useNewUrlParser:true})
.then(client => {
    console.log('connected');
    _db = client.db();
    callback();
}).catch(error => {
    console.log(error);
    
});

}

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;








