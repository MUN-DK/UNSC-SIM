// Newsfeed (SimulationId TEXT, ResolutionId TEXT, Description TEXT, Type TEXT)

var db = require('./db_singleton.js');

exports.Create = function(simID, title, text, type, callback) {
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO Newsfeeds VALUES(?,?,?,?)', [simID, title, text, type]);
		stmt.run();
		stmt.finalize();
		
		db.get("SELECT last_insert_rowid() FROM Newsfeeds", function(err, row) {
			callback(row['last_insert_rowid()']);
			return;
		});
	});
};

exports.Update = function(rowid, simID, title, text, type, callback) {
	db.serialize(function() {
		var stmt = db.prepare('UPDATE Newsfeeds SET SimulationId=?,Title=?,Description=?,Type=? WHERE rowid=?', [simID, title, text, type, rowid]);
		stmt.run();
		stmt.finalize();
		callback(rowid);
		return;
	});
};

exports.Delete = function(rowID, simID, callback) {
	db.serialize(function() {
		stmt = db.prepare('DELETE FROM Newsfeeds WHERE rowid=? AND SimulationId=?', [rowID, simID]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

exports.GetNewsfeed = function(rowID, simID, callback) {
	db.serialize(function() {
		db.get("SELECT * FROM Newsfeeds WHERE rowid=? AND SimulationId=?", [rowID, simID], function(err, newsfeed) {
			callback(newsfeed);
			return;
		});
	});
};

exports.GetAllNewsfeed = function(simID, callback) {
	db.serialize(function() {
		db.all("SELECT SimulationId,Title,Description,Type,rowid FROM Newsfeeds WHERE SimulationId=?", simID, function(err, newsfeeds) {
			callback(newsfeeds);
			return;
		});
	});
};
