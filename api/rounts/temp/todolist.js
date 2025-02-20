const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");

const pool = require('../../../dbcon');



//get to do list by user id
// get to-do list by user id
router.get('/list/:userId', (req, res) => {
    let id = req.params.userId;

    let sql = 'SELECT * FROM todolist WHERE user_id = ?';
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

// get to-do list by user id
router.get('/alllist/:userId', (req, res) => {
    let id = req.params.userId;

    let sql = 'SELECT count(*) FROM todolist WHERE user_id = ?';
    sql = mysql.format(sql, [id]);

    pool.query(sql, (error, results, fields) => {
        if (error) throw error;

        res.status(200).json({ message: 'successful', list: results });
    });
});



// router.get('/:cusId', (req, res) => {
//     let id = req.params.cusId;

//     pool.query('SELECT * from customer where id = ' + id, (error, results, fields) => {
//         if (error) throw error;
//         res.status(200).json(results);
//     });

// });


//add todolist
router.post('/', (req, res) => {
    let data = req.body;
    let is_completed = 0;
    let sql = "INSERT INTO `todolist`(`title`, `description`, `is_complete`, `user_id` ) VALUES (?,?,?,?)";
    sql = mysql.format(sql, [data.title, data.description, is_completed, data.user_id]);
    pool.query(sql, (error, results, fields) => {
        if (error) throw error;
        if (results.affectedRows == 1) {
            res.status(201).json({ message: 'Insert success' });
        } else {
            res.status(400).json({ message: 'Insert failed' });
        }
    });

});

router.delete('/:id', (req, res) => {
    let id = req.params.id;

    let sql = "DELETE FROM `todolist` WHERE id = ?"
    sql = mysql.format(sql, [id]);

    pool.query(sql, (error, results, fields) => {
        if (error) throw error;
        if (results.affectedRows == 1) {
            res.status(200).json({ message: 'Delete success' });
        } else {
            res.status(400).json({ message: 'Delete failed' });
        }

    });

});

// router.put('/:id', (req, res) => {
//     let id = req.params.cusId;
//     let data = req.body;
//     let sql = "update `customer` set firstname = ?, lastname = ?, email = ? where id = ?"
//     sql = mysql.format(sql, [data.firstname, data.lastname, data.email, id]);

//     pool.query(sql, (error, results, fields) => {
//         if (error) throw error;
//         if (results.affectedRows == 1) {
//             res.status(200).json({ message: 'Update success' });
//         } else {
//             res.status(400).json({ message: 'Update failed' });
//         }

//     });

// });


//Update data flexible

router.put('/update/:id', (req, res) => {
    let id = req.params.id;
    let data = req.body;
    let jsonOldData;

    // Query old data
    let oldSql = 'SELECT * FROM todolist WHERE id = ?';
    oldSql = mysql.format(oldSql, [id]);

    pool.query(oldSql, (error, results) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }

        let oldData = results[0];
        jsonOldData = JSON.parse(JSON.stringify(oldData));

        // Merge old data with new data
        let newData = mergeJSON.merge(jsonOldData, data);
        console.log('Old Data:', jsonOldData);
        console.log('New Data:', data);
        console.log('Merged Data:', newData);

        // Convert the timestamp to MySQL compatible format (YYYY-MM-DD HH:MM:SS)
        let updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Add or update the 'updated_at' field to current timestamp
        newData.updated_at = updatedAt;

        // Save the updated data into the database
        let sql = "UPDATE todolist SET title = ?, description = ?, updated_at = ? WHERE id = ?";
        sql = mysql.format(sql, [newData.title, newData.description, newData.updated_at, id]);

        pool.query(sql, (error, results) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ error: 'Internal Server Error', details: error.message });
            }

            if (results.affectedRows === 1) {
                res.status(200).json({ message: 'Update success', data: newData });
            } else {
                res.status(400).json({ message: 'Update failed', id: id });
            }
        });
    });
});


//Update is complete
router.put('/iscompleted/:id', (req, res) => {
    let id = req.params.id;
    let data = req.body;
    let jsonOldData;

    // Query old data
    let oldSql = 'SELECT is_complete FROM todolist WHERE id = ?';
    oldSql = mysql.format(oldSql, [id]);

    pool.query(oldSql, (error, results, fields) => {
        if (error) {
            console.error("Error querying database:", error);
            return res.status(500).json({ message: 'Database error' });
        }

        // Check if results exist for the given ID
        if (results.length === 0) {
            return res.status(404).json({ message: 'Todo item not found' });
        }

        let currentStatus = results[0].is_complete;
        let newStatus = currentStatus === 1 ? 0 : 1;

        // Update object data
        let sql = 'UPDATE todolist SET is_complete = ? WHERE id = ?';
        sql = mysql.format(sql, [newStatus, id]);

        // Save into database
        pool.query(sql, (error, results, fields) => {
            if (error) {
                console.error("Error updating database:", error);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.affectedRows == 1) {
                res.status(200).json({ message: 'Update is_completed success' });
            } else {
                res.status(400).json({ message: 'Update is_completed failed' });
            }
        });
    });
});


router.delete('/:id', (req, res) => {
    let id = req.params.id;

    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    let sql = "DELETE FROM `todolist` WHERE id = ?";
    sql = mysql.format(sql, [id]);

    pool.query(sql, (error, results) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }

        if (results.affectedRows === 1) {
            return res.status(200).json({ message: 'Delete success', id: id });
        } else {
            return res.status(404).json({ error: 'Item not found', id: id });
        }
    });
});







//get not complete
router.get('/notcompleted/:user_id', (req, res) => {
    let user_id = req.params.user_id;


    let sql = 'SELECT * from todolist where is_complete = 0 and user_id = ?';
    sql = mysql.format(sql, [user_id]);

    pool.query(sql, (error, results, fields) => {

        // Loop through the results and delete the user_id field from each object
        results.forEach((item) => {
            delete item.user_id;
        });
        if (error) throw error;
        res.status(200).json({ message: 'successful', list: results });
    });

});

// select complete task
router.get('/completed/:user_id', (req, res) => {
    let user_id = req.params.user_id;


    let sql = 'SELECT * from todolist where is_complete = 1 and user_id = ?';
    sql = mysql.format(sql, [user_id]);

    pool.query(sql, (error, results, fields) => {
        if (error) throw error;
        res.status(200).json({ message: 'successful', list: results });
    });

});




module.exports = router;