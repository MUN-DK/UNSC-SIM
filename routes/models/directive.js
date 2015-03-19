 /*
 * Creates and modifies the table for directive for which each row contains:
 * The Simulation Id, the directive, the country which the directive was sent to , mod name.
 */
var db = require('./db_singleton.js');

exports.Add = function(simId, direc, country, modName, callback) {
	db.serialize(function() {
		var stmt = db.prepare('DELETE FROM Directive WHERE Country=?',country);
		stmt.run();
		stmt = db.prepare('INSERT INTO Directive VALUES(?,?,?,?)', [
		    simId, direc, country, modName ]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};


exports.Get = function(simId, callback) {
	db.serialize(function() {
			db.all("SELECT * FROM Directive WHERE SimId=?", simId,
					function(err,rows) {
						callback(rows);
			});		
		return;
	});
};
