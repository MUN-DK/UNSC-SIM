
var db = require('./db_singleton.js');

exports.Add = function(simId, country, user, callback) {
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO SelectAmbassador VALUES(?,?,?,?,?)', [
		    simId, country, user, 0, true ]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

//update ambassador db when doing manual sort.
exports.update = function(simId, country, user, callback){
	db.serialize(function(){
		db.all("SELECT SimId,country,user FROM SelectAmbassador", function(err,rows){
			
			if(rows.SimId===simId&&rows.user===user){
				
				if(country===""){
					//console.log("remvoe user");
					var stmt = db.prepare("DELETE FROM SelectAmbassador WHERE SimId=? AND user=?",[simId,user]);
					stmt.run();
					stmt.finalize();
					callback();
				}
				else{
					var stmt = db.prepare("UPDATE country FROM SelectAmbassador WHERE SimId=? AND user=?",[simId,user]);
					stmt.run();
					stmt.finalize();
					callback();
				}
			}
			else{
				var stmt = db.prepare('INSERT INTO SelectAmbassador VALUES(?,?,?,?,?)', [
		        simId, country, user, 0, true ]);
				stmt.run();
				stmt.finalize();
				callback();
			}
		});
	})
};

exports.del = function(simId,callback){
	db.serialize(function(){
		var stmt = db.prepare("DELETE FROM SelectAmbassador WHERE SimId=?",simId);
		stmt.run();
		stmt.finalize();
		callback();
	});
};

exports.GetVotes = function(simId, country, callback) {
	db.serialize(function() {
			db.all("SELECT user,votes FROM SelectAmbassador WHERE SimId=? AND country=?", [simId,country],
					function(err,rows) {
						callback(rows);
						
			});		
			return;
	});
};

exports.GetVoted = function(simId, country, user, callback) {
	db.serialize(function() {
			db.all("SELECT voted FROM SelectAmbassador WHERE SimId=? AND country=? AND user=?", [simId,country,user],
					function(err,rows) {
						callback(rows);
			});		
		return;
	});
};

exports.GetAllVoted = function(simId, country, callback) {
	db.serialize(function() {
			db.all("SELECT voted FROM SelectAmbassador WHERE SimId=? AND country=?" , [simId,country],
					function(err,rows) {
						callback(rows);
			});		
		return;
	});
};

exports.addVotes = function(simId, user, callback) {
	db.serialize(function() {
		var stmt = db.prepare("UPDATE SelectAmbassador SET votes = votes+1 WHERE SimId = ? AND user = ?", [simId, user]);
				stmt.run();
		        stmt.finalize();
		        callback();
		return;	
	});
};

exports.GetVotesByUser = function(simId, user, callback) {
	db.serialize(function() {
			db.all("SELECT votes FROM SelectAmbassador WHERE SimId=? AND user=?", [simId,user],
					function(err,rows) {
						callback(rows);
						
			});		
			return;
	});
};

exports.SetVoted = function(simId, user, vote, callback) {
	db.serialize(function() {
		var stmt = db.prepare("UPDATE SelectAmbassador SET voted = ? WHERE SimId = ? AND user = ?", [vote, simId, user]);
				stmt.run();
		        stmt.finalize();
		        callback();
		return;	
	});
};

exports.Reset = function(simId, country, callback) {
	db.serialize(function() {
		var stmt = db.prepare("UPDATE SelectAmbassador SET votes = ? WHERE SimId = ? AND country = ?", [0, simId, country]);
				stmt.run();
			stmt = db.prepare("UPDATE SelectAmbassador SET voted = ? WHERE SimId = ? AND country = ?", [true, simId, country]);
		        stmt.run();
			    stmt.finalize();
		        callback();
		return;	
	});
};