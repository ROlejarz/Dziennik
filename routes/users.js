var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Strona ucznia
router.get('/uczen', function(req, res){
	//var dane = User.find({name:req.user.name, lastname:req.user.lastname, klasa:req.user.klasa},{oceny:""});
	var dane = (req.user.oceny);
	console.log(dane);
	res.render('index2', {oceny: dane});
});

//Strona nauczyciela
router.get('/nauczyciel', function(req, res){
	res.render('index');
});

// Rejestracja
router.get('/register', function(req, res){
	res.render('register');
});

router.get('/register2', function(req, res){
	res.render('register2');
});

// Logowanie
router.get('/login', function(req, res){
	res.render('login');
});

router.get('/', function(req, res){
	res.render('login');
});

// Rejestracja ucznia
router.post('/register', function(req, res){
	var name = req.body.name;
	var lastname = req.body.lastname;
	var klasa = req.body.klasa;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var role = "uczen";

	// Walidacja
	req.checkBody('name', 'Imię jest wymagane').notEmpty();
	req.checkBody('lastname', 'Nazwisko jest wymagane').notEmpty();
	req.checkBody('klasa', 'Klasa jest wymagana').notEmpty();
	req.checkBody('username', 'Nazwa użytkownika jest wymagana').notEmpty();
	req.checkBody('email', 'Email jest wymagany').notEmpty();
	req.checkBody('email', 'Email się nie zgadza').isEmail();
	req.checkBody('password', 'Hasło jest wymagane').notEmpty();
	req.checkBody('password2', 'Hasła się nie zgadzają').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			lastname: lastname,
			klasa: klasa,
			username: username,
			email: email,
			password: password,
			role: role
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'Rejestracja przebiegła pomyślnie. Możesz się teraz zalogować.');

		res.redirect('/users/login');
	}
});

// Rejestracja nauczyciela

router.post('/register2', function(req, res){
	var name = req.body.name;
	var lastname = req.body.lastname;
	var subject = req.body.subject;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var role = "nauczyciel";

	// Walidacja
	req.checkBody('name', 'Imię jest wymagane').notEmpty();
	req.checkBody('lastname', 'Nazwisko jest wymagane').notEmpty();
	req.checkBody('subject', 'Przedmiot jest wymagany').notEmpty();
	req.checkBody('username', 'Nazwa użytkownika jest wymagana').notEmpty();
	req.checkBody('email', 'Email jest wymagany').notEmpty();
	req.checkBody('email', 'Email się nie zgadza').isEmail();
	req.checkBody('password', 'Hasło jest wymagane').notEmpty();
	req.checkBody('password2', 'Hasła się nie zgadzają').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register2',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			lastname: lastname,
			subject: subject,
			username: username,
			email: email,
			password: password,
			role: role
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'Rejestracja przebiegła pomyślnie. Możesz się teraz zalogować.');

		res.redirect('/users/login');
	}
});

// Dodawanie ocen

router.post('/grade', function(req, res){
	var name = req.body.name;
	var lastname = req.body.lastname;
	var klasa = req.body.klasa;
	var subject = req.user.subject;
	var grade = req.body.grade;

	// Walidacja
	req.checkBody('name', 'Imię jest wymagane').notEmpty();
	req.checkBody('lastname', 'Nazwisko jest wymagane').notEmpty();
	req.checkBody('klasa', 'Klasa jest wymagana').notEmpty();
	req.checkBody('grade', 'Ocena jest wymagana').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('index',{
			errors:errors
		});
	} else {
		User.findOneAndUpdate({name:name, lastname:lastname, klasa:klasa}, {$push:{oceny:{przedmiot:subject,ocena:grade}}}, function(err,doc){
			if(err){
				console.log("Cos poszlo nie tak!");
			}
			//console.log(doc.oceny);
		});
		req.flash('success_msg', 'Pomyślnie dodano ocenę.');
		res.redirect('/');
	}
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Nieznany użytkownik'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Nieprawidłowe hasło'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
  	//console.log(req.user);
    if(req.user.role == 'uczen') {
		res.redirect('/users/uczen');
	} 
	else if (req.user.role == 'nauczyciel') {
		res.redirect('/users/nauczyciel');
	}
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Nastąpiło wylogowanie');

	res.redirect('/users/login');
});

module.exports = router;