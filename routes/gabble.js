const express = require('express');
const router = express.Router();

const models = require('../models');

let defaultUser = 'Guest';

let model = {};
model.title = 'Gabble';
model.user = defaultUser;

router.get('/', async (req, res) => {

    model.gabs = [];
    model.userLikes = [];
    model.fans = [];

    let gabs = await models.Gab.findAll({order: [['createdAt', 'DESC']]});

    if (req.session && req.session.authenticated) {
        model.user = req.session.displayName;
        model.userId = req.session.userId;

        let likes = await models.Like.findAll({
            where: {
                userId: model.userId
            }
        }).then((like) => {
            for (let i in like) {
                model.userLikes.push(like[i].dataValues.gabId);
            }
        }).catch((err) => {

        });
    }

    for (let i in gabs) {

        let data = {};
        data.fans = [];
        let tempArray = [];

        let user = await models.User.findOne({
            where: {
                id: gabs[i].dataValues.userId
            }
        }).catch((err) => {

        });

        if (model.userLikes.includes(gabs[i].dataValues.id)) {
            data.liked = true;
        }

        let likes = await models.Like.findAll({
            where: {
                gabId: gabs[i].dataValues.id
            }
        }).then((likes) => {
            for (let y in likes) {
                console.log(likes[y].dataValues.userId);
                models.User.findAll({
                    where: {
                        id: likes[y].dataValues.userId
                    }
                }).then((user) => {
                    for (let x in user) {
                        tempArray.push(user[x].dataValues.displayName);
                    }
                }).catch((err) => {

                })
            }
        }).catch((err) => {

        });

        data.displayName = user.dataValues.displayName;
        data.gabId = gabs[i].dataValues.id;
        data.title = gabs[i].dataValues.title;
        data.body = gabs[i].dataValues.content;
        data.likes = gabs[i].dataValues.likes;
        data.userId = gabs[i].dataValues.userId;
        data.timeStamp = gabs[i].dataValues.createdAt.toString().slice(4, 21);
        data.fans = tempArray;

        model.gabs.push(data);
    }
    console.log(model);
    res.render('gabble', model);
});

router.get('/newgab', (req, res) => {
    res.render('newgab', model);
});

router.post('/newgab', (req, res) => {

    req.check('gab_title', 'Title cannot be empty').isLength({min: 1});
    req.check('gab_title', 'Title can be no longer than 30 characters').isLength({max: 30});
    req.check('gab_body', 'Body can be no longer than 140 characters').isLength({max: 140});
    req.check('gab_body', 'Body cannot be empty').isLength({min: 1});

    let errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        model.errors = req.session.errors;
        res.render('newgab', model);
        req.session.errors = null;
    } else {
        let gab = models.Gab.build({
            title: req.body.gab_title,
            content: req.body.gab_body,
            likes: 0,
            userId: req.session.userId
        });
        gab.save().then(() => {
            res.redirect('/gabble');
        });
    }
});

router.post('/likegab/:id', async (req, res) => {

    // Check for authentication
    if (!req.session.authenticated) {
        model.errors = [{param: 'username', msg: 'Please log in to like or write gabs', value: ''}];
        res.render('gabble', model);
        model.errors = null;
    } else {
        // Get the likes for this gab
        let likes = await models.Like.findAll({
            where: {
                gabId: req.params.id
            }
        });

        // Get the total number of likes
        let count = likes.length;

        // See if this user has already liked this gab
        let liked = await models.Like.findOne({
            where: {
                userId: req.session.userId,
                gabId: req.params.id
            }
        });

        if (liked) {
            models.Like.destroy({
                where: {
                    userId: req.session.userId
                }
            }).then(() => {
                models.Gab.update({
                    likes: count - 1
                }, {
                    where: {
                        id: req.params.id
                    }
                });
            }).then(() => {
                res.redirect('/gabble');
            });
        } else {
            models.Like.create({
                userId: req.session.userId,
                gabId: req.params.id
            }).then(() => {
                models.Gab.update({
                    likes: count + 1
                }, {
                    where: {
                        id: req.params.id
                    }
                });
            }).then(() => {
                res.redirect('/gabble');
            });
        }
    }
});

router.post('/deletegab/:id', (req, res) => {

    models.Like.destroy({
        where: {
            gabId: req.params.id,
            userId: req.session.userId
        }
    }).then(() => {
        models.Gab.destroy({
            where: {
                id: req.params.id
            }
        }).then(() => {
            res.redirect('/gabble');
        });
    });
});

module.exports = router;
