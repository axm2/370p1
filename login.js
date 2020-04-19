var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '*',
	database : 'nodelogin'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/registration', function(request,response){
	response.sendFile(path.join(__dirname + '/registration.html'));
});
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
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
app.post('/register',function(request,response){
	var username = request.body.username;
	var password = request.body.password;
	if (username && password){
		connection.query('SELECT username FROM accounts WHERE username = ?', [username], function(error, results, fields){
			if (results.length > 0){
				response.send('A user has already chosen that username, please try again');
			} else {
				connection.query('INSERT INTO accounts (username, password) VALUES (?,?)', [username, password], function(error,results,fields){
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
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		//response.send('Welcome back, ' + request.session.username + '!');
		connection.query('SELECT gameID, score FROM games WHERE accountID in (SELECT id from accounts where username = ?)', [request.session.username], function(error,results,fields){
			if(error) throw error;
			else{
				response.render('home', {data: []});
			}
		});
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});
app.post('/score',function(request,response){
	console.log(request.body);
});

app.listen(3000);

