var fs = require("fs");
var file = "./routes/databases/Sesssion.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
if (!exists) {
	fs.openSync(file, "w");
	db.serialize(function() {
				db.run("CREATE TABLE session (sessionName TEXT, startingDate TEXT, endingDate TEXT, userSort TEXT, chairName TEXT)");
				
			});
}

exports.addSession = function(sessionName, startingDate, country, fname, lname, email,
		callback) {

	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO Users VALUES("' + dispName + '","'
				+ password + '","' + country + '","' + fname + '","' + lname
				+ '","' + email + '")');
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};
exports.UsernameExists = function(dispName, callback) {
	db.serialize(function() {
		db.all('SELECT username FROM Users WHERE username = ?', [ dispName ],
				function(err, rows) {
					if (rows.length > 0) {
						callback(true);
						return;
					} else {
						callback(false);
						return;
					}
				});
	});
};

exports.Authenticate = function(dispName, pass, callback) {
	db.serialize(function() {
		db.each("SELECT password,username FROM Users", function(err, row) {
			if (row.username === dispName && row.password === pass) {
				callback(true);
				return;
			}
		});
	});
};

exports.GetCountryandFName = function(dispName, callback) {
	db.serialize(function() {
		db.each("SELECT * FROM Users", function(err, row) {
			if (row.username === dispName) {
				var info = [ row.country, row.fname ];
				callback(info);
				return;
			}
		});
	});
};

exports.GetFLNameEmail = function(dispName, callback) {
	db.serialize(function() {
		db.each("SELECT * FROM Users", function(err, row) {
			if (row.username === dispName) {
				var info = [ row.fname, row.lname, row.email ];
				callback(info);
				return;
			}
		});
	});
};