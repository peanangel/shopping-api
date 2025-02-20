const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");
const bcrypt = require('bcrypt');

const pool = require('../../../dbcon');



router.get('/user', (req, res) => {

    pool.query('SELECT * from user', (error, results, fields) => {
        if (error) throw error;
        res.status(200).json(results);
    });


});



//register
router.post('/', async (req, res) => {
    try {
        let data = req.body;
        let role =2;

        // Validate email format using regex
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(data.email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate phone number format using regex (e.g., for 10-digit phone numbers)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(data.phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        // Check if email already exists
        let emailCheckSql = "SELECT * FROM `users` WHERE `email` = ?";
        let phoneCheckSql = "SELECT * FROM `users` WHERE `phone` = ?";

        // Query to check if the email or phone already exists
        pool.query(emailCheckSql, [data.email], (emailErr, emailResults) => {
            if (emailErr) {
                console.error("Database error checking email:", emailErr);
                return res.status(500).json({ message: 'Database error checking email', error: emailErr });
            }

            if (emailResults.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Query to check if the phone number already exists
            pool.query(phoneCheckSql, [data.phone], async (phoneErr, phoneResults) => {
                if (phoneErr) {
                    console.error("Database error checking phone:", phoneErr);
                    return res.status(500).json({ message: 'Database error checking phone', error: phoneErr });
                }

                if (phoneResults.length > 0) {
                    return res.status(400).json({ message: 'Phone number already exists' });
                }

                // If both email and phone are unique, proceed with registration
                const hashedPwd = await hashedPassword(data.password);

                let sql = "INSERT INTO `users`( `email`, `password`, `name`, `phone`, `address`, `birthday`, `role`) VALUES (?,?,?,?,?,?,?)";
                sql = mysql.format(sql, [data.email, hashedPwd, data.name, data.phone, data.address, data.birthday, role]);

                pool.query(sql, (error, results, fields) => {
                    if (error) {
                        console.error("Database error:", error);
                        return res.status(500).json({ message: 'Database error', error });
                    }
                    if (results.affectedRows === 1) {
                        res.status(201).json({ message: true });
                    } else {
                        res.status(400).json({ message: false });
                    }
                });
            });
        });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




//login user
router.post('/user/login', async (req, res) => {
    try {
        let data = req.body;

        // Check if the user exists by email
        let sql = "SELECT * FROM `user` WHERE `email` = ?";
        sql = mysql.format(sql, [data.email]);

        pool.query(sql, async (error, results, fields) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: 'Database error', error });
            }

            if (results.length === 0) {
                // User not found
                return res.status(404).json({ message: 'User not found' });
            }

            // Compare provided password with stored hashed password
            const isMatch = await bcrypt.compare(data.password, results[0].password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const user = { ...results[0] };
            delete user.password
            // Successful login
            res.status(200).json({ message: 'Login successful', user: user });
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// edit profile
router.post('/user/edit/:id', async (req, res) => {
    try {
        let data = req.body;

        // Check if the user exists by email
        let sql = "SELECT * FROM `user` WHERE `email` = ?";
        sql = mysql.format(sql, [data.email]);

        pool.query(sql, async (error, results, fields) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: 'Database error', error });
            }

            if (results.length === 0) {
                // User not found
                return res.status(404).json({ message: 'User not found' });
            }

            // Compare provided password with stored hashed password
            const isMatch = await bcrypt.compare(data.password, results[0].password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const user = { ...results[0] };
            delete user.password
            // Successful login
            res.status(200).json({ message: 'Login successful', user: user });
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Hash password function (must be async)
async function hashedPassword(pwd) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pwd, salt);
}


module.exports = router;