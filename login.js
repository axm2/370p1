var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '*',
	database: 'nodelogin'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function (request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	}
	else {
		response.sendFile(path.join(__dirname + '/login.html'));
	}

});
app.get('/registration', function (request, response) {
	response.sendFile(path.join(__dirname + '/registration.html'));
});
app.post('/auth', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				console.log(request.session.username + " has logged in " + Date.now());
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			//response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.post('/register', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT username FROM accounts WHERE username = ?', [username], function (error, results, fields) {
			if (results.length > 0) {
				response.send('A user has already chosen that username, please try again');
			} else {
				connection.query('INSERT INTO accounts (username, password) VALUES (?,?)', [username, password], function (error, results, fields) {
					if (error) throw error;
					//console.log("1 record inserted");
				});
				response.redirect('/');
			}
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.get('/home', function (request, response) {
	if (request.session.loggedin) {
		connection.query('SELECT gameID, score FROM games WHERE accountID in (SELECT id from accounts where username = ?)', [request.session.username], function (error, results, fields) {
			if (error) throw error;
			else {
				connection.query('SELECT accounts.username, games.score FROM accounts, games WHERE games.accountID = accounts.id ORDER BY games.score DESC LIMIT 10', function (error, results2, fields) {
					//console.log(results);
					response.render('home', { data: [request.session.username, results, results2] });
				});
			}
		});
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});
app.post('/score', function (request, response) {
	//console.log(request.body);
	connection.query('INSERT INTO games (accountID, score) VALUES ((SELECT id from accounts WHERE username = ?), ?)', [request.body.username, request.body.score], function (error, results, fields) {
		if (error) throw error;
	});

});
app.get('/logout', function (request, response, next) {
	if (request.session) {
		console.log(request.session.username + " has logged out " + Date.now());
		request.session.destroy(function (err) {
			if (err) {
				return next(err);
			}
			else {
				return response.redirect('/')
			}
		});
	}
});

app.listen(3000);

