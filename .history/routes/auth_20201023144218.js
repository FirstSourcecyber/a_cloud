var express = require('express');
var router = express.Router();
const User = require('../models/user')
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var config = require('../config');




/* REGISTER. */
router.post('/signup', function(req, res, next) {
    var data = req.body;
    User.findOne({ countryCode: data['countryCode'], phone: data['phone'] }).then(en => {
        if (en !== null) {
            res.json({ message: 'exist' });
        } else {
            User.create({
                username: data['username'],
                phone: data['phone'],
                countryCode: data['countryCode'],
                password: passwordHash.generate(data['password']),
                email: '',
                fingerprint: '',
                image: 'avatar.png',
                status: 1,
                active: true,
                lastLogin: '',
                lastIp: '',
                showNotif: true,
                role: 'user',
            }).then((resp) => {
                var token = jwt.sign({ check: true }, 'login_auth', {
                    expiresIn: '100d'
                });
                res.json({
                    message: 'success',
                    token: token,
                    user: resp
                })
            })
        }
    });
});


/* LOGIN. */
router.post('/login', function(req, res, next) {
    var countryCode = req.body['countryCode'];
    var phone = req.body['phone'];
    var password = req.body['password'];
    User.findOne({ countryCode: countryCode, phone: phone }).then(
        fetch => {
            if (fetch != null) {
                if (passwordHash.verify(password, fetch.password)) {
                    req.session.user = fetch;
                    const payload = {
                        check: true
                    };
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: '100d'
                    });
                    res.json({
                        message: 'authentication done',
                        token: token,
                        user: fetch,
                    });
                } else {
                    res.json(null);
                }
            } else {
                res.json(null);
            }
        });
});

/* ADMIN LOGIN. */
router.post('/adminLogin', function(req, res, next) {
    var email = req.body['email'];
    var password = req.body['password'];
    User.findOne({ email: email }).then(
        fetch => {
            if (fetch != null) {
                if (passwordHash.verify(password, fetch.password)) {
                    req.session.user = fetch;
                    const payload = {
                        check: true
                    };
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: '100d'
                    });
                    res.json({
                        message: 'authentication done',
                        token: token,
                        user: fetch,
                    });
                } else {
                    res.json(null);
                }
            } else {
                res.json(null);
            }
        });
});

module.exports = router;