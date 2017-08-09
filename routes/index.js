const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // if (!req.session || !req.session.authenticated) {
    //     res.render('index', {title: 'Welcome to Gabble!', user: null, msg: 'Please log in to write gabs'});
    // } else {
    //     res.render('index', {title: 'Gabble', user: req.session.displayName});
    // }
    res.render('portfolio');
});

// router.post('/gab', (req, res) => {
//     let gab = models.Gab.build({
//         userId: req.session.userId,
//         title: req.body.gabTitle,
//         body: req.body.gabBody
//     });
//
//     gab.save().then((gab) => {
//         res.redirect('/');
//     });
// });

module.exports = router;
