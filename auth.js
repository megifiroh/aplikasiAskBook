const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/book-app').then(()=>
    console.log('connection successful'));

const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1/book-app',
    collection: 'mySessions'
});

const sessionConf = session({
    secret: 'this is my secret key',
    resave: false,
    saveUninitialized: false,
    store: store
  })


const isAuth = (req, res, next) => {
    if (req.session.isAuth){
        res.locals.userName = req.session.userName;
        next()
    } else {
        res.redirect('/login')
    }
}

module.exports = {
    isAuth,
    sessionConf
}