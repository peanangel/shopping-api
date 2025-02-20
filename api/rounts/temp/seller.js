const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");

const pool = require('../../../dbcon');

router.get('/', (req, res) => {
    res.status(200).json({
        message: "Index route ok"
    });

})

// POST request to add a seller
router.post('/register', (req, res) => {
    try {
        const data = req.body;
        const status = 1;

        // Validate input data
        if (!data.name || !data.owner) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Prepare the SQL query
        let sql = "INSERT INTO `seller`( `name`, `status`, `owner`) VALUES (?,?,?)";
        sql = mysql.format(sql, [data.name, status, data.owner]);

        // Execute the query
        pool.query(sql, (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: 'Database error', error });
            }
            if (results.affectedRows === 1) {
                res.status(201).json({ message: 'Seller added successfully' });
            } else {
                res.status(400).json({ message: 'Failed to add seller' });
            }
        });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;