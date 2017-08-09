const express = require('express');
const router = express.Router();

const models = require('../models');

let defaultUser = 'Guest';

let model = {};
model.title = 'Gabble';
model.user = defaultUser;

router.get('/', function (req, res) {

    if (req.session && req.session.authenticated) {
        let user = models.User.findOne({
            where: {
                username: req.session.username,
                displayName: req.session.displayName
            }
        }).then((user) => {
            if (user) {
                req.session.username = req.body.username;
                req.session.userId = user.dataValues.id;
                req.session.displayName = user.displayName;
                req.session.authenticated = true;

                model.user = req.session.displayName;
                model.userId = req.session.userId;

                console.log(model);

                res.redirect('/gabble');
            }
        });
    }
    res.render('signin', model);
});

router.post('/', (req, res) => {

    models.User.findOne({
        where: {
            username: req.body.username,
            password: req.body.password
        }
    }).then((user) => {
        if (!user) {
            model.user = null;
            res.render('signin', model);
            model.user = 'Guest';
        } else {
            req.session.username = user.username;
            req.session.displayName = user.displayName;
            req.session.userId = user.dataValues.id;
            req.session.authenticated = true;
            res.redirect('/gabble');
        }
    });
});

router.get('/signup', (req, res) => {
    res.render('signup', model);
});

router.post('/signup', (req, res) => {

    let query = {where: {username: req.body.username}};

    models.User.findOne(query).then((user) => {
        if (user) {
            errors = [{param: 'username', msg: 'Username already in use', value: ''}];
            req.session.errors = errors;

            model.errors = req.session.errors;
            res.render('signup', model);

            req.session.errors = null;
        }
    });

    req.check('username', 'Username must be at least 4 characters').isLength({min: 4});
    req.check('username', 'Username may only contain alphanumeric characters').isAlphanumeric();
    req.check('displayName', 'Display name must be at least 4 characters').isLength({min: 4});
    req.check('password', 'Passwords must match').equals(req.body.confirmPassword);
    req.check('password', 'Password must be at least 6 characters').isLength({min: 6});

    let errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        model.errors = req.session.errors;
        res.render('signup', model);
        req.session.errors = null;
    } else {
        let user = models.User.build({
            username: req.body.username,
            displayName: req.body.displayName,
            password: req.body.password
        });
        user.save().then((user) => {
            req.session.username = user.username;
            req.session.displayName = user.displayName;
            req.session.userId = user.dataValues.id;
            req.session.authenticated = true;
            res.redirect('/gabble');
        });
    }
});

// router.get('/profile', (req, res) => {
//     res.render('profile');
// });

router.get('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/gabble');
});

module.exports = router;
