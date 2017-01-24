var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

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

// Dodawanie ocen
router.get('/grade', function(req, res){
	res.render('index');
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
		res.render('register',{
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
	var subject = req.body.subject;
	var grade = req.body.grade;

	// Walidacja
	req.checkBody('name', 'Imię jest wymagane').notEmpty();
	req.checkBody('lastname', 'Nazwisko jest wymagane').notEmpty();
	req.checkBody('klasa', 'Klasa jest wymagana').notEmpty();
	req.checkBody('subject', 'Przedmiot jest wymagany').notEmpty();
	req.checkBody('grade', 'Ocena jest wymagana').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('index',{
			errors:errors
		});
	} else {
		User.updateUser(name,lastname,klasa,subject,grade);

		req.flash('success_msg', 'Pomyślnie dodano ocenę.');

		res.redirect('/users/grade');
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
  passport.authenticate('local', {successRedirect:'/users/grade', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/users/grade');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Nastąpiło wylogowanie');

	res.redirect('/users/login');
});

module.exports = router;