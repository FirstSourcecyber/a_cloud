var express = require('express');
var router = express.Router();
const User = require('../models/user')
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var config = require('../config');
var multer = require('multer');
const shop = require('../models/shop');
const category = require('../models/category');
const variable = require('../models/variable');
const product = require('../models/product');
const subcategory = require('../models/subcategory');
const feedback = require('../models/feedback');
const contactUs = require('../models/contactUs');
const package = require('../models/packages')
const setting = require('../models/setting')
var fs = require("fs");


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
                        shop.findOne({ user: req.body.id }).populate("category").then(shop => {
                            res.json({
                                message: 'success',
                                user: fetch,
                                shop: shop
                            });
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
            shop.findOne({ user: req.body.id }).populate("category").then(shop => {
                res.json({
                    message: 'success',
                    user: fetch,
                    shop: shop
                });
            });

        });
    });
});
router.post('/updateProfileImages', function(req, res, next) {
    User.updateOne({ _id: req.body.id }, {
        $set: {
            image: req.body.image,
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


/* Shop  Category ========= Start */
router.get('/category/all', async function(req, res, next) {
    var cat = await category.find()
    res.json({
        message: 'success',
        data: cat
    });
});
router.post('/subcategory/bycat', async function(req, res, next) {
    var cat = await subcategory.find({ category: req.body.catId })
    res.json({
        message: 'success',
        data: cat
    });
});



/* Seller  Shop ========= Start */

router.post('/shop/create', async function(req, res, next) {
    var fetch = await setting.find();
    var credits = fetch[0]['freeCreditOnShopCreate'];
    shop.create({
        name: req.body.shopname,
        address: req.body.location,
        country: '',
        city: '',
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        opentime: req.body.opentime,
        closetime: req.body.closetime,
        qrKey: '',
        phone: req.body.phone,
        phoneCode: req.body.phoneCode,
        views: 0,
        scanned: 0,
        adminFeature: 0,
        shopFeature: 0,
        credits: credits,
        image: req.body.image,
        category: req.body.catId,
        user: req.body.userId
    }).then(fetch => {
        shop.findOne({ user: req.body.userId }).populate("category").then(shop => {
            res.json({
                message: 'success',
                shop: shop
            });
        });
    });
});

router.post('/shop/update', async function(req, res, next) {
    shop.updateOne({ _id: req.body.id }, {
        $set: {
            name: req.body.shopname,
            address: req.body.location,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            opentime: req.body.opentime,
            closetime: req.body.closetime,
            phone: req.body.phone,
            phoneCode: req.body.phoneCode,
            image: req.body.image,
            category: req.body.catId,
            user: req.body.userId
        }
    }).then(fetch => {
        shop.findOne({ user: req.body.userId }).populate("category").then(shop => {
            res.json({
                message: 'success',
                shop: shop
            });
        });
    });
});

/* Seller  Shop ========= End */



/* App  Product ========= Start */

router.post('/variable/bysubcat', async function(req, res, next) {
    var color = await variable.find({ type: 'color', subcategory: req.body.subcatId }).populate("category subcategory")
    var size = await variable.find({ type: 'size', subcategory: req.body.subcatId }).populate("category subcategory")
    res.json({
        message: 'success',
        color: color,
        size: size
    });
});



router.post('/product/all', function(req, res, next) {
    product.find({ shop: req.body.shopId, subcategory: req.body.subCatId }).populate("shop subcategory category variable").then(product => {
        res.json({
            message: 'success',
            data: product
        });
    });

});


router.post('/product/create', function(req, res, next) {
    product.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        brand: req.body.brand,
        images: req.body.image,
        views: 0,
        adminFeature: 0,
        shopFeature: 0,
        shares: 0,
        totalFav: 0,
        status: true,
        category: req.body.catId,
        subcategory: req.body.subcatId,
        shop: req.body.shopId
    }).then(r => {
        res.json({
            message: 'success',
        });
    });
});

router.post('/product/update', async function(req, res, next) {
    product.updateOne({ _id: req.body.id }, {
        $set: {
            name: req.body.name,
            price: req.body.price,
            images: req.body.image,
            description: req.body.description,
            brand: req.body.brand,
            category: req.body.catId,
            subcategory: req.body.subcatId,
            shop: req.body.shopId,
        }
    }).then(r => {
        res.json({
            message: 'success',
        });
    });
});

router.post('/product/status', async function(req, res, next) {
    product.updateOne({ _id: req.body.id }, {
        $set: {
            status: req.body.status,
        }
    }).then(r => {
        res.json({
            message: 'success',
        });
    });
});
router.post('/product/feature', async function(req, res, next) {
    await product.updateOne({ _id: req.body.id }, {
        $set: {
            shopFeature: req.body.shopFeature,
        }
    });
    var fetch = await setting.find();
    shop.find({ _id: req.body.shopId }).then(shopData => {
        var credits = fetch[0]['creditDeductionOnPromoteProduct'];
        var newCr = shopData[0]['credits'] - credits;
        console.log(newCr);
        shop.updateOne({ _id: req.body.shopId }, {
            $set: {
                credits: newCr,
            }
        }).then(fetch => {
            res.json({
                message: 'success',
            });
        });
    });
});

router.get('/product/delete/:id', async function(req, res, next) {
    await product.deleteOne({ _id: req.params.id })
    res.json({
        message: 'Successfully deleted',
    });
});



/* App  Product ========= End */


/* App  FeedBack ========= Start */

router.get('/feedback', async function(req, res, next) {
    product.create({
        topic: req.body.topic,
        message: req.body.message,
        status: 'unread',
        user: req.body.userId
    }).then(r => {
        res.json({
            message: 'success',
        });
    });
});

/* App  Contact Us ========= Start */
router.post('/contactUs', async function(req, res, next) {
    contactUs.create({
        topic: req.body.topic,
        message: req.body.message,
        status: 'unread',
        user: req.body.userId
    }).then(r => {
        res.json({
            message: 'success',
        });
    });
});
/* App  Packages ========= Start */
router.get('/getAllPackages', async function(req, res, next) {
    var fetch = await package.find({ status: "Active" });
    res.json({
        message: 'success',
        data: fetch
    });
});
router.post('/assignCredits', async function(req, res, next) {
    shop.updateOne({ _id: req.body.shopId }, {
        $set: {
            credits: req.body.credits,
        }
    }).then(r => {
        shop.findOne({ _id: req.body.shopId }).then(shop => {
            res.json({
                message: 'success',
                shop: shop
            })
        });
    });
});
router.post('/sellerHomeData', async function(req, res, next) {
    product.find({ shop: req.body.shopId }).limit(3).populate("shop subcategory category").then(product => {
        res.json({
            message: 'success',
            hotProducts: product
        });
    });
});











router.post('/uploadImage', function(req, res, next) {
    var realFile = Buffer.from(req.body.image, "base64");
    fs.writeFile("./uploads/" + req.body.name, realFile, function(err) {
        if (err)
            res.json(err);
        else
            res.json(req.body.name);
    });

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