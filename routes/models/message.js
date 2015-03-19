 /*
 * Creates and modifies the table for globalMessage for which each row contains:
 * Username of user that created the message, Date the message was created , Message created, the user's Country name,
 * and the simulation id number of the current simulation.
 */

var db = require('./db_singleton.js');
var resolutionDB = require('./resolution');


/**Creates a new Global Message
 * @param: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT
 * @return: null
 * 
 */
exports.addGlobalMessage = function(userName, date , message, country, simId, callback){
	db.serialize(function(){
		var stmt = db.prepare('INSERT INTO GlobalMessages VALUES(?,?,?,?,?)',[userName, date, message,country,simId]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**Gets an entry(s)
 * @param: SimulationId TEXT
 * @return: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT
 * 
 */
exports.getGlobalMessage = function(simId, callback){
	db.serialize(function() {
		db.all("SELECT * FROM GlobalMessages WHERE SimulationId = ?",simId, function(err, row) {
			if(row.length > 0){
				
				var ids = [];
				for(var i = 0; i < row.length; i++) {
					ids.push(row[i].Username);
				}

				var userDB = require('./user');
				userDB.ReturnUsers(ids, function(rows){
					callback(rows, row);
				});
				return;
			}
			else {
				callback([],[]);
				return;
			}
		});
	});
};

/**Creates a new Country Message
 * @param: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT
 * @return: null
 * 
 */
exports.addCountryMessage = function(userName, date , message, country, simId, callback){
	db.serialize(function(){
		var stmt = db.prepare('INSERT INTO CountryMessages VALUES(?,?,?,?,?)',[userName, date, message,country,simId]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**Gets an entry(s)
 * @param: SimulationId TEXT
 * @return: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT
 * 
 */
exports.getCountryMessage = function(simId, country, callback){
	db.serialize(function() {
		db.all("SELECT * FROM CountryMessages WHERE SimulationId = ? AND CountryName = ?", [simId, country], function(err, row) {
			
			if(row.length > 0){
				
				var ids = [];
				for(var i = 0; i < row.length; i++) {
					ids.push(row[i].Username);
				}

				var userDB = require('./user');
				userDB.ReturnUsers(ids, function(rows){
					callback(rows, row);
				});
				return;
			}
			else {
				callback([],[]);
				return;
			}
		});
	});
};

/**Gets all Country Message entry(s)
 * @param: SimulationId TEXT
 * @return: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT
 * 
 */
exports.getAllCountryMessage = function(simId, callback){
	db.serialize(function() {
		db.all("SELECT * FROM CountryMessages WHERE SimulationId = ?", simId, function(err, row) {
			
			if(row.length > 0){
				
				var ids = [];
				for(var i = 0; i < row.length; i++) {
					ids.push(row[i].Username);
				}

				var userDB = require('./user');
				userDB.ReturnUsers(ids, function(rows){
					callback(rows, row);
				});
				return;
			}
			else {
				callback([],[]);
				return;
			}
		});
	});
};

/**Creates a new Resolution Message
 * @param: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT, ResolutionId TEXT
 * @return: null
 * 
 */
exports.addResolutionMessage = function(userName, date , message, country, simId, resId, messageType, callback){
	db.serialize(function(){
		var stmt = db.prepare('INSERT INTO ResolutionMessages VALUES(?,?,?,?,?,?,?)',[userName, date, message,country,simId, resId, messageType]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**Gets an entry(s)
 * @param: SimulationId TEXT
 * @return: Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT, ResolutionId TEXT
 * 
 */
exports.getResolutionMessage = function(simId, resId, callback){
	db.serialize(function() {
		db.all("SELECT * FROM ResolutionMessages WHERE SimulationId = ? AND ResolutionId = ?", [simId, resId], function(err, row) {
			if(row.length > 0){
				
				var ids = [];
				for(var i = 0; i < row.length; i++) {
					ids.push(row[i].Username);
				}

				var userDB = require('./user');
				userDB.ReturnUsers(ids, function(rows){
					callback(rows, row);
				});
				return;
			}
			else {
				callback([],[]);
				return;
			}
		});
	});
};

exports.getPersonalMessages = function(sid, user1, user2, callback){
	db.serialize(function(){
		db.all("SELECT * FROM PersonalMessages WHERE SimulationId = ? AND ((FromUser = ? AND ToUser = ?) OR (FromUser = ? AND ToUser = ? )) ORDER BY Date ASC", [sid,user1,user2,user2,user1],function(err,data){
			db.run("UPDATE PersonalMessages SET IsNewMessage = 'false' WHERE SimulationId = ? AND ToUser = ?", [sid, user1]);
			if(data.length === 0){
				callback([]);
			}
			else{
				callback(data);
			}
		});
	});
};

exports.addPersonalMessage = function(sid,user1,user2, description, date, allow, callback){
	db.serialize(function(){
		var stmt = db.prepare("INSERT INTO PersonalMessages VALUES(?,?,?,?,?,?,?)",[user1,user2,date,description,sid,allow,"true"]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});	
};

exports.GetNewMessagesForUser = function(sid,currentUser, callback){
	db.serialize(function(){
		db.all("SELECT * FROM PersonalMessages WHERE SimulationId = ? AND ToUser = ?",[sid,currentUser],function(err,data){
			callback(data);
		});
	});
};



