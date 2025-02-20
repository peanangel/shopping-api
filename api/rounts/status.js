const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");
const bcrypt = require('bcrypt');

const pool = require('../../dbcon');


router.get('/statuscheck',(req,res)=>{
    res.status(200).json({
        message:"Status Order route ok"
    });

});
//Order
//get all status
router.get('/status/order', (req, res) => {

    pool.query('SELECT * from status_order', (error, results, fields) => {
        if (error) throw error;
        res.status(200).json(results);
    });
});

//add status order
// router.post('/status', (req, res) => {
//     let data = req.body;
//     let sql = "INSERT INTO `status_order`(`type`) VALUES (?)";
//     sql = mysql.format(sql, [data.status]);
//     pool.query(sql, (error, results, fields) => {
//         if (error) throw error;
//         if (results.affectedRows == 1) {
//             res.status(201).json({ message: 'Insert success' });
//         } else {
//             res.status(400).json({ message: 'Insert failed' });
//         }
//     });

// });



//seller
//get all seller
router.get('/status/seller', (req, res) => {

    pool.query('SELECT * from status_seller', (error, results, fields) => {
        if (error) throw error;
        res.status(200).json(results);
    });
});

//add status seller
// router.post('/status/seller', (req, res) => {
//     let data = req.body;
//     let sql = "INSERT INTO `status_seller`(`status`) VALUES (?)";
//     sql = mysql.format(sql, [data.status]);
//     pool.query(sql, (error, results, fields) => {
//         if (error) throw error;
//         if (results.affectedRows == 1) {
//             res.status(201).json({ message: 'Insert success' });
//         } else {
//             res.status(400).json({ message: 'Insert failed' });
//         }
//     });

// });






module.exports = router;