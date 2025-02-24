const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const indexRouter = require('./api/rounts/index');
const productRouter = require('./api/rounts/product/products');
const status_orderRouter = require('./api/rounts/status');
const productTypeRouter = require('./api/rounts/product_type');


const userRouter = require('./api/rounts/temp/user');
const sellerRouter = require('./api/rounts/temp/seller');
// const todolistRouter = require('./api/rounts/todolist');



app.use(bodyParser.json());
app.use('/', indexRouter);
// app.use('/todolist', userRouter);
// app.use('/todolist', todolistRouter);
app.use('/shopping', productRouter);
app.use('/shopping', status_orderRouter);
app.use('/shopping/type', productTypeRouter);
app.use('/shopping/user', userRouter);
app.use('/shopping/seller', sellerRouter);


module.exports = app;