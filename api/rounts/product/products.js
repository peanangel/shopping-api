const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");
const bcrypt = require('bcrypt');

const pool = require('../../../dbcon');


router.get('/', (req, res) => {
    res.status(200).json({
        message: "Products route ok"
    });

});

//get all product
router.get('/allproduct', (req, res) => {
    let sql = `
        SELECT products.*, seller.name AS seller_name 
        FROM products 
        JOIN seller ON products.sid = seller.sid
    `;

    pool.query(sql, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: 'Database error', error });
        }
        res.status(200).json({ message: 'successful', data: results });
    });
});




//get all product
router.get('/allproduct', (req, res) => {

    pool.query('SELECT * from products where user_id = id', (error, results, fields) => {
        if (error) throw error;
        res.status(200).json(results);
    });
});
//get all product by sid
router.get('/allproduct/:seller_id', (req, res) => {
    let id = req.params.seller_id;

    let sql = 'SELECT * from products where sid = ?';
    sql = mysql.format(sql, [id]);

    pool.query(sql, (error, results, fields) => {
        if (error) throw error;

        // Loop through the results and delete the user_id field from each object
        results.forEach((item) => {
            delete item.user_id;
        });

        res.status(200).json({ message: 'successful', list: results });
    });
});


//add product
router.post('/products', (req, res) => {
    let data = req.body;

    // Validate required fields
    if (!data.product_name || !data.image || !data.description ||
        !data.price || !data.stock || !data.type || !data.sid) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const point = 0.0;
    let sql = "INSERT INTO `products`(`product_name`, `image`, `description`, `price`, `stock`, `point`, `type`, `sid`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
    let values = [data.product_name, data.image, data.description, data.price, data.stock, point, data.type, data.sid];

    sql = mysql.format(sql, values);

    pool.query(sql, (error, results) => {
        if (error) {
            // Handle unique key constraint violation
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Product ID already exists' });
            }

            console.error(error); // Log error for debugging
            return res.status(500).json({ message: 'Database error occurred' });
        }

        if (results.affectedRows === 1) {
            res.status(201).json({ message: 'Product inserted successfully' });
        } else {
            res.status(400).json({ message: 'Insert failed' });
        }
    });
});




//add product
router.post('/products', (req, res) => {
    let data = req.body;

    // Validate required fields
    if (!data.product_name || !data.image || !data.description ||
        !data.price || !data.stock || !data.type || !data.sid) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const point = 0.0;
    let sql = "INSERT INTO `products`(`product_name`, `image`, `description`, `price`, `stock`, `point`, `type`, `sid`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)";
    let values = [data.product_name, data.image, data.description, data.price, data.stock, point, data.type, data.sid];

    sql = mysql.format(sql, values);

    pool.query(sql, (error, results) => {
        if (error) {
            // Handle unique key constraint violation
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Product ID already exists' });
            }

            console.error(error); // Log error for debugging
            return res.status(500).json({ message: 'Database error occurred' });
        }

        if (results.affectedRows === 1) {
            res.status(201).json({ message: 'Product inserted successfully' });
        } else {
            res.status(400).json({ message: 'Insert failed' });
        }
    });
});


//add cart
router.post('/products/cart', (req, res) => {
    let data = req.body;
    const amount =1;

    // Validate required fields
    if (!data.uid || !data.pid ) {
        return res.status(400).json({ message: 'uid, pid, and amount are required' });
    }

    // Check if the combination of uid and pid already exists in the cart
    let checkSql = "SELECT * FROM `carts` WHERE `uid` = ? AND `pid` = ?";
    pool.query(checkSql, [data.uid, data.pid], (error, results) => {
        if (error) {
            console.error(error); // Log error for debugging
            return res.status(500).json({ message: 'Database error occurred while checking cart' });
        }

        if (results.length > 0) {
            // If the cart entry exists, update the amount by increasing it by 1
            let updateSql = "UPDATE `carts` SET `amount` = `amount` + 1 WHERE `uid` = ? AND `pid` = ?";
            pool.query(updateSql, [data.uid, data.pid], (error, updateResults) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Database error occurred while updating' });
                }

                if (updateResults.affectedRows === 1) {
                    return res.status(200).json({ message: 'Amount updated successfully' });
                } else {
                    return res.status(400).json({ message: 'Update failed' });
                }
            });
        } else {
            // If the cart entry does not exist, insert a new entry
            let insertSql = "INSERT INTO `carts`(`uid`, `pid`, `amount`) VALUES (?, ?, ?)";
            let insertValues = [data.uid, data.pid, amount];

            pool.query(insertSql, insertValues, (error, insertResults) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Database error occurred while inserting' });
                }

                if (insertResults.affectedRows === 1) {
                    return res.status(201).json({ message: 'Product added to cart successfully' });
                } else {
                    return res.status(400).json({ message: 'Insert failed' });
                }
            });
        }
    });
});






module.exports = router;