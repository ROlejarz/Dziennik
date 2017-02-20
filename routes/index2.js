var express = require('express');
var router = express.Router();

router.get('/users/uczen', ensureAuthenticated, function(req, res){
	res.render('index2');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}

module.exports = router;