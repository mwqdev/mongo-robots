const express = require('express');
const router = express.Router();

const mongo = require('mongodb');
const assert = require('assert');

const url = 'mongodb://localhost:27017/userDatabase';

router.get('/', (req, res) => {

    mongo.connect(url, (err, db) => {

        assert.equal(null, err);
        let collection = db.collection('robots');

        collection.find({}).toArray((err, result) => {
            assert.equal(null, err);
            let response = result[0].users;
            res.render('index', {result: response});
        });
        db.close();
    });
});

router.get('/single/:userId', (req, res) => {

    let id = req.params.userId;

    let findUser = function (user) {
        return user.id == id;
    };

    mongo.connect(url, async (err, db) => {
        assert.equal(null, err);
        let collection = await db.collection('robots');

        collection.find({}).toArray((err, result) => {
            assert.equal(null, err);
            let users = result[0].users;
            let user = users.find(findUser);
            res.render('single', user);
        });
        db.close();
    });
});

router.get('/lfw', (req, res) => {

    mongo.connect(url, (err, db) => {

        assert.equal(null, err);
        let collection = db.collection('robots');

        collection.find({}).toArray((err, result) => {
            assert.equal(null, err);
            let jobless = [];
            let response = result[0].users;
            for (let i in response) {
                if (!response[i].job)
                    jobless.push(response[i]);
            }
            res.render('lfw', {users: jobless});
        });
        db.close();
    });
});

router.get('/employed', (req, res) => {

    mongo.connect(url, (err, db) => {
        assert.equal(null, err);
        let collection = db.collection('robots');

        collection.find({}).toArray((err, result) => {
            assert.equal(null, err);
            let employed = [];
            let response = result[0].users;
            for (let i in response) {
                if (response[i].job)
                    employed.push(response[i]);
            }
            res.render('employed', {users: employed});
        });
        db.close();
    });
});

module.exports = router;
