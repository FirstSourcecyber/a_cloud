var express = require('express');
var router = express.Router();
const User = require('../models/user')
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var config = require('../config');
var multer = require('multer');


/* changePassword */
router.post('/changePassword', function(req, res, next) {
    User.findOne({ _id: req.body.id }).then(fetch => {
        if (req.body.old == '') {
            User.updateOne({ _id: req.body.id }, {
                $set: {
                    password: passwordHash.generate(req.body.pass),
                }
            }).then(r => {
                User.findOne({ _id: req.body.id }).then(fetch => {
                    res.json({
                        message: 'success',
                        user: fetch
                    });
                });
            });
        } else {
            if (passwordHash.verify(req.body.old, fetch.password)) {
                User.updateOne({ _id: req.body.id }, {
                    $set: {
                        password: passwordHash.generate(req.body.pass),
                    }
                }).then(r => {
                    User.findOne({ _id: req.body.id }).then(fetch => {
                        res.json({
                            message: 'success',
                            user: fetch
                        });
                    });
                });
            } else {
                res.json({
                    message: 'failed',
                });
            }
        }
    });
});



/* updateProfile */
router.post('/updateProfile', function(req, res, next) {
    User.updateOne({ _id: req.body.id }, {
        $set: {
            username: req.body.username,
            phone: req.body.phone,
            countryCode: req.body.countryCode,
            address: req.body.location,
            lat: req.body.latitude,
            lng: req.body.longitude
        }
    }).then(r => {
        User.findOne({ _id: req.body.id }).then(fetch => {
            res.json({
                message: 'success',
                user: fetch
            });
        });
    });
});





router.post('/uploadImage', function(req, res, next) {
    var realFile = Buffer.from(req.body.file, "base64");
    fs.writeFile('./uploads/' + req.body.fileName, realFile, function(err) {
        if (err)
            console.log(err);
    });
    res.json(req.body.name);
});




// single uploadImage
router.post('/uploadImage1', function(req, res, next) {
    upload(req, res, function(err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        let filename = req.file.filename;
        res.json(filename);
    });
});
// multi uploadImage
router.post('/multiplefiles', function(req, res, next) {
    uploadd(req, res, function(err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        let filename = req.files;
        res.json(filename);
    });
});

module.exports = router;

// multar =========================================================
// ================================================================
// ================================================================
// ================================================================
// ================================================================
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
// single file
var upload = multer({ //multer settings
    storage: storage
}).single('file');
// multiple files
var uploadd = multer({ //multer settings
    storage: storage
}).array('files');