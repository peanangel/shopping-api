const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");
const bcrypt = require('bcrypt');

const pool = require('../../dbcon');


router.get('/', (req, res) => {
    res.status(200).json({
        message: "product type Order route ok"
    });

});
//Order
//get all status
router.get('/get', (req, res) => {

    pool.query('SELECT * from product_type', (error, results, fields) => {
        if (error) throw error;
        res.status(200).json(results);
    });
});

//add product type
router.post('/producttype', (req, res) => {
    let data = req.body;

    // Validation: Check if 'type' exists in the request body
    if (!data.type) {
        return res.status(400).json({ message: 'Product type is required' });
    }

    let sql = "INSERT INTO `product_type`( `type`) VALUES (?)";
    sql = mysql.format(sql, [data.type]);

    pool.query(sql, (error, results, fields) => {
        if (error) {
            // Check if the error is a duplicate key violation
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Product type already exists' });
            }

            console.error(error);  // Log the error for debugging purposes
            return res.status(500).json({ message: 'Database error occurred' });
        }

        if (results.affectedRows === 1) {
            res.status(201).json({ message: 'Insert success' });
        } else {
            res.status(400).json({ message: 'Insert failed' });
        }
    });
});







module.exports = router;