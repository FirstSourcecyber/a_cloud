var express = require('express');
var router = express.Router();
const User = require('../models/user')
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var config = require('../config');


/* changePassword */
router.post('/changePassword', function(req, res, next) {
    User.findOne({ _id: '5f993e569bad133d89f81d4' }).then(fetch => {
        res.json(fetch);
    });
});




module.exports = router;