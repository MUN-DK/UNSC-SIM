 /*
 * Creates and modifies the table for membership for which each row contains:
 * the simulation id number, the simulation name, the user's name, the user role(Mod, User), the user's country for the simulation, 
 * and the simulation role of the user(Chair,Delegate, Member)
 */

var db = require('./db_singleton.js');
var countryDB = require('./country');
var simDB = require('./simulation');
var ambDB = require('./ambassador');

/**Creates a new entry
 * @param: SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT
 * @return: null
 * 
 */
exports.Create = function(simId, simName, username, userRole, callback) {
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO Memberships VALUES(?,?,?,?,?,?)', [
				simId, simName, username, userRole, "", "Member"]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/** Edits the simulation name of an entry
 * @param: SimulationId INTEGER, SimulationName TEXT
 * @return: null
 * 
 */
exports.EditSimName = function(simId, simName, callback) {
	db.serialize(function() {
				var stmt = db.prepare(
								"UPDATE Memberships SET SimulationName = ? WHERE SimulationId = ?",
								[ simName, simId ]);
				stmt.run();
				stmt.finalize();
				callback();
				return;
			});
};

/** Gets an entry(s)
 * @param: SimulationId INTEGER
 * @return: SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT
 * 
 */
exports.GetUsersbySimID = function(simID, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Memberships WHERE SimulationId = ?",
				simID, function(err, rows) {
					callback(rows);
					return;
				});
	});
};

/** Gets an entry(s)
 * @param: Username TEXT, UserRole TEXT
 * @return: SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT
 * 
 */
exports.GetByUsernameRole = function(username, userRole, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Memberships WHERE Username = ? AND UserRole = ?",
				[ username, userRole ], function(err, rows) {
					if (rows.length > 0) {
						callback(rows);
						return;
					} else {
						callback([]);
						return;
					}
				});
	});
};

/** Gets an entry(s) of joinable and joined rooms (obsolete)
 * @param: Username TEXT, UserRole TEXT
 * @return:  SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT
 * 
 */
exports.GetByUsernameRoleDates = function(username, userRole, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Memberships WHERE Username = ? AND UserRole = ?",
				[ username, userRole ], function(err, rows) {
					if (rows.length > 0) {
						var sids = [];
						for ( var i = 0; i < rows.length; i++) {
							sids.push(rows[i].SimulationId);
						}
						simDB.GetDates(sids, function(result1, result2) {
							callback(result1, result2);
							return;
						});
					} else {
						callback([], []);
						return;
					}
				});
	});
};

/** Gets an Username(s)  
 * @param: SimulationId INTEGER, SimulationCountry TEXT
 * @return:Username TEXT
 * 
 */
exports.GetUsernamebyCountrySimId = function(country, simId, callback){
	db.serialize(function(){
		db.all("SELECT Username FROM Memberships WHERE SimulationCountry = ? AND SimulationId = ? AND UserRole = 'User'",
				[country, simId],
				function(err, rows){
					callback(rows);
					return;
		});
	});
};

/**Gets an entry(s) of Simulations that are available to join
 * @param: Username TEXT
 * @return: SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT
 * 
 */
exports.GetJoinableSimulations = function(username, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Memberships WHERE Username = ?",
				username, function(err, rows) {
						var sids = [];
						for ( var i = 0; i < rows.length; i++) {
							sids.push(rows[i].SimulationId);
						}
						simDB.GetAvailableSimulations(sids, function(result1) {
							callback(result1);
							return;
						});
				});
	});
};

/**Gets an entry(s) of simulations that have been joined
 * @param:  Username TEXT
 * @return: SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT
 * 
 */
exports.GetJoinedSimulations = function(username, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Memberships WHERE Username = ?",
				username, function(err, rows) {
						var sids = [];
						for ( var i = 0; i < rows.length; i++) {
							sids.push(rows[i].SimulationId);
						}
						simDB.GetJoinedSimulations(sids, function(result1) {
							callback(result1);
							return;
						});
				});
	});
};

/**Gets the Username(s)
 * @param: SimulationId INTEGER
 * @return: Username TEXT
 * 
 */
exports.GetUsernamesbySimID = function(simID, callback) {
	db.serialize(function() {
		db.all("SELECT Username FROM Memberships WHERE SimulationId = ? AND UserRole = 'User'",
				simID, function(err, rows) {
					callback(rows);
					return;
				});
	});
};

exports.GetUsernamesCountrybySimID = function(simID, callback) {
	db.serialize(function() {
		db.all("SELECT Username,SimulationCountry FROM Memberships WHERE SimulationId = ? AND UserRole = 'User'",
				simID, function(err, rows) {
					callback(rows);
					return;
				});
	});
};
/**Gets the SimulationRole
 * @param: SimulationId INTEGER, Username TEXT,
 * @return: SimulationRole TEXT
 * 
 */
exports.GetSimRolebySimIdUsername = function(simId,username, callback) {
	db.serialize(function() {
		db.get("SELECT SimulationRole FROM Memberships WHERE Username = ? AND SimulationId = ?",
				[username,simId], function(err, row) {
					
					var role = row.SimulationRole;
					callback(role);
					return;
		});
	});
};

/**Gets the userRole
 * @param: SimulationId INTEGER, Username TEXT
 * @return:UserRole TEXT
 * 
 */
exports.GetUserRolebySimIdUsername = function(simId,username, callback) {
	db.serialize(function() {
		db.get("SELECT UserRole FROM Memberships WHERE Username = ? AND SimulationId = ?",
				[username,simId], function(err, row) {
					
					var role = row.UserRole;
					callback(role);
					return;
		});
	});
};

/**Gets the country name of the user
 * @param: SimulationId INTEGER, Username TEXT
 * @return: SimulationCountry TEXT
 * 
 */
exports.GetCountrybySimIdUsername = function(simId, username, callback) {
	db.serialize(function() {
		console.log('starts '+ simId +" " + username);
		db.get("SELECT SimulationCountry FROM Memberships WHERE SimulationId = ? AND Username = ?",
				[simId, username], function(err,row) {
				var country = row.SimulationCountry;
					
				//console.log(country);
					callback(country);
					return;
		});
	});
};

/**Sets the contry name of the user
 * @param: SimulationId INTEGER, Username TEXT, SimulationCountry TEXT
 * @return: null
 * 
 */
exports.SetCountry = function(simID, username, country, callback) {
	db.serialize(function() {
		var stmt = db.prepare("UPDATE Memberships SET SimulationCountry = ? WHERE SimulationId = ? AND Username = ?",
						[country, simID, username]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**Sets the SimulationRole of the user
 * @param: SimulationId INTEGER, Username TEXT, SimulationRole TEXT
 * @return: null
 * 
 */
exports.SetSimRole = function(simID, username, simRole, callback) {
	db.serialize(function() {
		var stmt;
		
		if(simRole === "Chair")
		{
			stmt = db.prepare("UPDATE Memberships SET SimulationRole = 'Member' WHERE SimulationId = ? AND SimulationRole = 'Chair'", simID);
			stmt.run();
		}
		
		stmt = db.prepare("UPDATE Memberships SET SimulationRole = ? WHERE SimulationId = ? AND Username = ?",
						[simRole, simID, username]);
		stmt.run();

		if(simRole === "Chair")
		{
			stmt = db.prepare("UPDATE Memberships SET SimulationCountry = \"\" WHERE SimulationId = ? AND Username = ?",
					[simID, username]);
			stmt.run();
		}
		stmt.finalize();
		callback();
		return;
	});
};

/**Sets the Delegates of the Simulation
 * @param: SimulationId INTEGER, Username TEXT []
 * @return: null
 * 
 */
exports.SetDelegates = function(simID, delegates, callback) {
	db.serialize(function() {
		var qstring = delegates.map(function(e) {
				return "Username = '" + e + "'";
		}).join(" OR ");
		
		qstring = "WHERE SimulationId = " + simID +" AND (" + qstring + ")";
				
		console.log(qstring);
		var stmt = db.prepare("UPDATE Memberships SET SimulationRole = 'Member' WHERE SimulationRole = 'Delegate' AND SimulationId =  "+ simID);
		stmt.run();
		
		stmt = db.prepare("UPDATE Memberships SET SimulationRole = 'Delegate' " + qstring);
		stmt.run();
		
		stmt.finalize();
		callback();
		return;
	});
};

/**Sorts users to countries
 * @param: SimulationId INTEGER
 * @return: null
 * 
 */
exports.CountryAutoSort = function(sid, callback) {
	db.serialize(function() {
		db.all("SELECT Username FROM Memberships WHERE SimulationId = ? AND UserRole != 'Mod' AND (SimulationRole = 'Member' OR SimulationRole = 'Delegate')",sid,
			function(err, rows) {
				var countryDB = require('./country');
				countryDB.GetAllCountries(function(countries) {
					var stmt;
					stmt = db.prepare("UPDATE Memberships SET SimulationRole = 'Member' WHERE SimulationId = ? AND UserRole != 'Mod'", sid);
					stmt.run();
					ambDB.del(sid,function(){});
					for ( var i = 0; i < rows.length; i++) {
						ambDB.Add(sid, countries[i % 15].countryName, rows[i].Username, function(){});
						stmt = db.prepare("UPDATE Memberships SET SimulationCountry = ? WHERE Username = ? AND UserRole != 'Mod'  AND SimulationId=?",[countries[i % 15].countryName,rows[i].Username,sid ]);
						stmt.run();
						stmt.finalize();
					}
					callback();
					return;
				});
			});
	});
};

/**CountryAutoSortFinish
 * @param: SimulationId INTEGER
 * @return: null
 * 
 */
exports.CountryAutoSortFinish = function(sid, callback) {
	db.serialize(function() {
		db.all("SELECT Username FROM Memberships WHERE SimulationId = ? AND UserRole != 'Mod' AND (SimulationRole = 'Member' OR SimulationRole = 'Delegate')",sid,
			function(err, rows) {
				var countryDB = require('./country');
				countryDB.GetAllCountries(function(countries) {
				for ( var i = 0; i < rows.length; i++) {
					var stmt = db.prepare("UPDATE Memberships SET SimulationCountry = ? WHERE Username = ?",[countries[i % 15].countryName,rows[i].Username ]);
					stmt.run();
					stmt.finalize();
				}
				callback();
				return;
			});
		});
	});
};

/**Mod manually sorts users of a simulation into countries
 * @param: SimulationId INTEGER, Username TEXT[], SimulationCountry TEXT[]
 * @return: null
 * 
 */
exports.CountryManualSort = function(sid, users, selections, callback) {
	db.serialize(function() {
		for ( var i = 0; i < users.length; i++) {
			var stmt = db.prepare("UPDATE Memberships SET SimulationCountry = ? WHERE Username = ?",[selections[i], users[i]]);
			stmt.run();
			stmt.finalize();
		}
		callback();
		return;
	});
};

/**Gets the Username(s) in a country
 * @param: SimulationId INTEGER, Username TEXT
 * @return: Username TEXT
 * 
 */
exports.GetCountryMembersBySimId = function(simId,username, callback){
	db.serialize(function(){
		db.all("SELECT Username,SimulationCountry FROM Memberships WHERE SimulationId = ? AND UserRole = 'User' AND SimulationCountry = (SELECT SimulationCountry FROM Memberships WHERE Username = ? AND SimulationId = ?)", [simId,username,simId],
				function(err, rows){
					callback(rows);
					return;
		});
	});
};

/**Get the SimulationCountry of the user
 * @param: SimulationId INTEGER, Username TEXT
 * @return: SimulationCountry TEXT
 * 
 */
exports.GetCountryBySimIdUsername = function(simId,username, callback){
	db.serialize(function(){
		db.all("SELECT SimulationCountry FROM Memberships WHERE SimulationId = ? AND Username = ? AND UserRole = 'User'", [simId,username],
				function(err, rows){
					if(rows.length > 0){
						callback( rows[0].SimulationCountry);
						return;
					}
					else{
						callback("");
						return;
					}
		});
	});
};

exports.SetManualUserCountry = function(simId, groupedData, callback){
	db.serialize(function(){
		db.all("SELECT SimId,country,user FROM SelectAmbassador", function(err,rows){
			var stmt;
			for(var i =0; i<groupedData.length;i++){
				stmt = db.prepare("UPDATE Memberships SET SimulationCountry = ?, SimulationRole = 'Member' WHERE Username = ?", [groupedData[i][1],groupedData[i][0]]);
				stmt.run();	
				if(groupedData[i][1]===""){
					var stmt = db.prepare("DELETE FROM SelectAmbassador WHERE SimId=? AND user=?",[simId,groupedData[i][0]]);
					stmt.run();
				}
				else{
					var stmt = db.prepare('INSERT INTO SelectAmbassador VALUES(?,?,?,?,?)', [
			        simId, groupedData[i][1], groupedData[i][0], 0, true ]);
					stmt.run();
				}
			}
			stmt.finalize();
		});
		callback();
	});
};

exports.ChangeDelegate = function(simId, username, country,callback){
	db.serialize(function(){
		var stmt = db.prepare("UPDATE Memberships SET SimulationRole = 'Member' WHERE SimulationId =? AND SimulationCountry = ?", [simId,country]);
		stmt.run();
		stmt = db.prepare("UPDATE Memberships SET SimulationRole = 'Delegate' WHERE SimulationId = ? AND SimulationCountry = ? AND Username = ?", [simId,country,username]);
		stmt.run();
		stmt.finalize();
		
	});
};

exports.GetUserCount = function(simId, callback){
	db.get('SELECT Count(*) FROM Memberships WHERE SimulationId = ?', simId, function(err,count){
		callback(count['Count(*)']);
		return;
	});
};