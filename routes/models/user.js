 /*
 * Creates and modifies the table for user for which each row contains:
 * Name of the user, password of the user, first name of the user, last name of the user, role of the user.
 * 
 */
var simDB = require('./simulation');
var db = require('./db_singleton.js');

/**Creates a new entry
 * @param: username TEXT, password TEXT, fname TEXT, lname TEXT, email TEXT	
 * @return: null
 * 
 */
exports.Add = function(dispName, password, fname, lname, email, callback) {

	db.serialize(function() {
		// var stmt = db.prepare('INSERT INTO Users VALUES("' + dispName + '","'
		// + password + '","' + country + '","' + fname + '","' + lname
		// + '","' + email + '","User")');
		var stmt = db.prepare('INSERT INTO Users VALUES(?,?,?,?,?,?)', [
				dispName, password, fname, lname, email, 'User' ]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**Checks if dispName is in the database
 * @param: username TEXT	
 * @return: Boolean
 * 
 */
exports.UsernameExists = function(dispName, callback) {
	db.serialize(function() {
		db.all('SELECT username FROM Users WHERE username = ?', [ dispName ],
				function(err, rows) {
					// console.log(err);
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

/**Checks if disName and pass ar in the database
 * @param: username TEXT, password TEXT	
 * @return: Boolean
 * 
 */
exports.Authenticate = function(dispName, pass, callback) {
	db.serialize(function() {
		db.each("SELECT password,username FROM Users WHERE username = ?",
				dispName, function(err, row) {
					if (row.username === dispName && row.password === pass) {
						callback(true);
						return;
					} else {
						callback(false);
						return;
					}
				});
	});
};

/**Gets a firstname of the user
 * @param: username TEXT	
 * @return: fname TEXT
 * 
 */
exports.GetFName = function(dispName, callback) {
	db.serialize(function() {
		db.get("SELECT * FROM Users WHERE username=?", dispName, function(err,
				row) {
			var info = [ row.fname ];
			callback(info);
			return;
		});
	});
};

/**Gets first and last name and email of the user
 * @param: username TEXT		
 * @return: fname TEXT, lname TEXT, email TEXT
 * 
 */
exports.GetFLNameEmail = function(dispName, callback) {
	db.serialize(function() {
		db.get("SELECT * FROM Users WHERE username = ?", dispName, function(
				err, row) {
			var info = [ row.fname, row.lname, row.email ];
			callback(info);
			return;
		});
	});
};

/**Gets role of the user
 * @param: username TEXT		
 * @return: role TEXT
 * 
 */
exports.GetRole = function(dispName, callback) {
	db.serialize(function() {
		db.get("SELECT role FROM Users WHERE username = ?", dispName, function(
				err, row) {
			callback(row.role);
			return;
		});
	});
};

/**Changes role of the user
 * @param: username TEXT, role TEXT	
 * @return: null
 * 
 */
exports.GiveModeratorPrivledges = function(dispName, roleName, callback) {
	db.serialize(function() {
		db.get("UPDATE Users SET role = ? WHERE username = ?", [ roleName,
				dispName ], function(err, row) {
			callback();
			return;
		});
	});
};

/**Edit the user
 * @param: username TEXT, fname TEXT, lname TEXT, email TEXT	
 * @return: null
 * 
 */
exports.Edit = function(dispName, fname, lname, email, callback) {
	db
			.serialize(function() {
				var stmt = db
						.prepare(
								"UPDATE Users SET fname = ?, lname = ?, email = ? WHERE username = ?",
								[ fname, lname, email, dispName ]);
				stmt.run();
				stmt.finalize();
				callback();
				return;
			});
};

/**Edit the user
 * @param: username TEXT, fname TEXT, lname TEXT, email TEXT, password TEXT	
 * @return: null
 * 
 */
exports.EditWithPassword = function(dispName, fname, lname, email, password, callback) {
	db
			.serialize(function() {
				var stmt = db
						.prepare(
								"UPDATE Users SET fname = ?, lname = ?, email = ?, password = ? WHERE username = ?",
								[ fname, lname, email, password,dispName ]);
				stmt.run();
				stmt.finalize();
				});
				callback();
				return;
			};

/**gets the user(s) information
 * @param: 	Username TEXT[]
 * @return: username TEXT, fname TEXT, lname TEXT
 * 
 */
exports.ReturnUsers = function(ids, callback) {
		var qstring = ids.map(function(e) {
			return "username = '" + e + "'";
		}).join(" OR ");

		//console.log(qstring);
						
		db.all("SELECT username, fName, lName FROM Users WHERE " + qstring, function(err, rows) {
			callback(rows);
			return;
		});
};
