const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const mergeJSON = require("merge-json");
const bcrypt = require('bcrypt');

const pool = require('../../dbcon');


router.get('/',(req,res)=>{
    res.status(200).json({
        message:"Products route ok"
    });

});




module.exports = router;