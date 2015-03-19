 /*
 * Creates and modifies the tables for resolution;
 * Resolution table contains:
 * 	simulation id number, name of the resolution, scenario description, statement description.
 * Clauses table contains:
 * 	resolution id number, simulation id number, ClauseNumber text, current description of clause, original description of clause.
 * Amendment table contains:
 * 	the simulation id number, the resolution name, the user's country, the clause number, the clause to be(changed, add, or reason to be removed), and
 * 	the status of what want done to the clause. (Add, Delete, or Change).
 */

var db = require('./db_singleton.js');
var simDB = require('./simulation');
var posDB = require('./position');

/**Creates a new entry
 * @param: Resolutions: SimulationId INTEGER, ResolutionName TEXT, Scenario TEXT, State TEXT
 *				
 * @return: null
 * 
 */
exports.CreateResolution = function(sid, resName, scenario, clauses,callback) {
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO Resolutions VALUES(?,?,?,?,?)', [sid, resName, scenario, 'inactive','false']);
		stmt.run();
		stmt.finalize();
		
		
		
		db.get("SELECT last_insert_rowid() FROM Resolutions", function(
				err, row) {
			var rid = row['last_insert_rowid()'];
			var stmt2;
			for(var i = 1;i<=clauses.length;i++){
				stmt2 = db.prepare('INSERT INTO Clauses VALUES(?,?,?,?,?)',[rid, sid,i,clauses[i-1],clauses[i-1]]);
				stmt2.run();
			}
			stmt2.finalize();
			callback();
			return;
		});
	});
};

/**Gets the active resolution
 * @param: Resolutions: SimulationId INTEGER, ResolutionId INTEGER
 *				
 * @return: Resolution: ResolutionName TEXT, Scenario TEXT
 * 			Clauses: 	Description TEXT, ClauseNumber TEXT
 * 
 */
exports.getActiveResolution = function(simId,resId, callback){
	db.serialize(function() {
		db.get("SELECT ResolutionName, Scenario, VotingToClose FROM Resolutions WHERE SimulationId=? AND State = 'active'", simId, function(err,rows){
				var clauses = [];
					db.all("SELECT Description,ClauseNumber,OriginalDescription FROM Clauses WHERE ResolutionId = ? AND SimulationId = ?", [resId,simId], function(err,rows2){
						for(var j=0; j < rows2.length; j++){
							clauses.push([rows2[j].ClauseNumber, rows2[j].Description,rows2[j].OriginalDescription]);
						}
						callback(rows,clauses);
						return;
					});
		});
	});
};

/**Gets an entry(s) 
 * @param: Resolutions: SimulationId INTEGER
 * @return: Resolutions: ResolutionName TEXT, Scenario TEXT, State TEXT
 *				Clauses:  ClauseNumber TEXT, Description TEXT
 * 
 */
exports.getFullResolution = function(simId, callback){
	db.serialize(function() {
		db.all("SELECT rowid,ResolutionName, Scenario, State, VotingToClose FROM Resolutions WHERE SimulationId=?", simId, function(err,rows){
			if(rows.length > 0){
				var clauses = [];
				
				for(var i = 0; i < rows.length; i++){
					db.all("SELECT Description,ClauseNumber FROM Clauses WHERE ResolutionId = ?",rows[i].rowid, function(err,rows2){
						for(var j =0;j<rows2.length;j++){
							clauses.push([rows2[j].ClauseNumber, rows2[j].Description]);
							//console.log("clausesInc:" + clauses[j]);
						}
						callback(rows,clauses);
						return;
					});
				}
			}
			else{console.log("EMPTY! NAGWIOAHWELAWIG");}
		});
	});
};

/**gets an entry(s)
 * @param: Resolutions: SimulationId INTEGER
 * @return: Resolutions: SimulationId INTEGER, ResolutionName TEXT, Scenario TEXT, State TEXT
 *				Clauses: ResolutionId INTEGER, SimulationId INTEGER, ClauseNumber TEXT, Description TEXT
 * 
 */
exports.getFullResolutions = function(simId, callback){
	db.serialize(function() {
		db.all("SELECT * FROM Resolutions INNER JOIN Clauses ON Resolutions.rowid = Clauses.ResolutionId WHERE Resolutions.SimulationId = ?", simId, function(err, rows){
			db.all("SELECT rowid FROM Resolutions WHERE SimulationId = ?", simId, function(err, resRows){
				var resIds = [];
				for(var i = 0; i<resRows.length; i ++){
					resIds.push(resRows[i].rowid);
				}
				callback(rows,resIds);
				return;
			});
		});
	});
};

exports.updateResolution = function(simID, resID, callback){
	db.serialize(function() {
		var stmt = db.prepare('DELETE FROM Amendment WHERE SimulationId=? AND ResolutionId=?', [simID, resID]);
		stmt.run();
		
		stmt = db.prepare('UPDATE Clauses SET ClauseNumber="" WHERE SimulationId=? AND ResolutionId=?', [simID, resID]);
		stmt.run();
		
		stmt = db.prepare('DELETE FROM Clauses WHERE SimulationId=? AND ResolutionId=? AND Description="[REMOVED]"', [simID, resID]);
		stmt.run();
		
		stmt = db.prepare('UPDATE Clauses SET OriginalDescription=Description WHERE SimulationId=? AND ResolutionId=?', [simID, resID]);
		stmt.run();
		
		stmt.finalize();
		callback();
		return;
	});
};

exports.renumberClauses = function(simID, resID, callback){
	db.serialize(function() {
		db.all("SELECT rowid FROM Clauses WHERE SimulationId=? AND ResolutionId=?", [simID, resID], function(err,clauses){
			if(clauses.length === 0)
			{
				callback();
				return;
			}
			else
			{
				for(var i = 0; i < clauses.length; i++)
				{
					console.log(clauses[i]);
					stmt = db.prepare('UPDATE Clauses SET ClauseNumber=? WHERE rowid=? AND SimulationId=? AND ResolutionId=?', 
							[i+1, clauses[i].rowid, simID, resID]);
					stmt.run();
				}
				stmt.finalize();
				callback();
				return;
			}
		});
	});
};

/**Set resolution activity(active, inactive, completed)
 * @param: Resolutions:State TEXT
 *				Clauses: ResolutionId INTEGER
 * @return: null
 *  
 */
exports.setActivity = function(sid, rid, activity, callback){
	db.serialize(function(){
		var stmt;
		if(activity === 'active'){
			stmt = db.prepare("UPDATE Resolutions SET State = 'inactive' WHERE State = 'active' AND SimulationId = ?", sid);
			stmt.run();
			stmt.finalize();
		}
		stmt = db.prepare("UPDATE Resolutions SET State = ?, VotingToClose = ? WHERE rowid = ?", 
				[activity, "false",rid]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

exports.setVotingToClose = function(simID, resID, closing, callback){
	db.serialize(function(){
		var stmt;
		stmt = db.prepare("UPDATE Resolutions SET VotingToClose = ? WHERE SimulationId = ? AND rowid = ? AND State='active'", 
				[closing, simID, resID]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

exports.isVotingToClose = function(simID, resID, callback){
	db.serialize(function() {
		db.get("SELECT VotingToClose FROM Resolutions WHERE SimulationId = ? AND rowid = ? AND State='active'", 
				[simID, resID], function(err,vote){
			callback(vote.VotingToClose);
			return;
		});
	});
};

/**Gets the active resolution
 * @param: Resolutions: SimulationId INTEGER
 * @return: Resolutions: SimulationId INTEGER, ResolutionName TEXT, Scenario TEXT, State TEXT
 */
exports.getActive = function(simId, callback){
	db.serialize(function() {
		db.get("SELECT SimulationId, ResolutionName, Scenario, State, rowid, VotingToClose FROM Resolutions WHERE SimulationId=? AND State=?", [simId,'active'], function(err,rows){
			callback(rows);
			return;
		});
	});
};

/**Gets the active resolution clauses
 * @param: Resolutions: SimulationId INTEGER
 * @return: Clauses: ResolutionId INTEGER, SimulationId INTEGER, ClauseNumber TEXT, Description TEXT
 */
exports.GetClausesbySimId = function(simId, callback) {
	db.serialize(function() {
		db.all("SELECT rowid FROM Resolutions WHERE simulationId=? AND State='active'", simId, function(err,row){
			//console.log(row);
			if(row.length > 0){
				var clauses = [];
					db.all("SELECT * FROM Clauses WHERE ResolutionId = ?",row[0].rowid, function(err,rows2){
						callback(rows2);
						return;
					});
			}
			else{console.log("EMPTY!");}
		});
	});
};

exports.updateClause = function(simId, resId, clauseNum, newClauseDesc, amendStatus, callback) {
	if(amendStatus === "Edit")
		{
			console.log(simId +" " +resId+" " +clauseNum+" " +newClauseDesc+" " +amendStatus);
			var stmt = db.prepare("UPDATE Clauses SET Description=? WHERE SimulationId=? AND ResolutionId=? AND ClauseNumber=?",
					[newClauseDesc, simId, resId, clauseNum]);
			stmt.run();
			stmt.finalize();
			callback();
			return;
		}
	if(amendStatus === "Add")
	{
		db.get("SELECT Count(*) FROM Clauses WHERE SimulationId=? AND ResolutionId=?", [simId, resId], function(err,count){
			var newClauseNumber = parseInt(count['Count(*)']) + 1;
			var stmt = db.prepare('INSERT INTO Clauses Values(?,?,?,?,?)', [simId, resId, newClauseNumber, newClauseDesc, ""]);
			stmt.run();
			stmt.finalize();
			callback();
			return;
		});
	}
	if(amendStatus === "Remove")
	{
			var stmt = db.prepare('UPDATE Clauses SET Description="[REMOVED]" WHERE SimulationId=? AND ResolutionId=? AND ClauseNumber=?', 
					[simId, resId, clauseNum]);
			stmt.run();
			stmt.finalize();
			callback();
			return;
	}
};

/**Adds an entry to Admendment Table
 * @param: SimulationId INTEGER, ResolutionName TEXT, UserCountry TEXT, ClauseNumber TEXT, Clause TEXT, Status TEXT, Date TEXT
 * @return: null
 */
exports.addAmendment = function(simId, resId, country, clauseNumber, clause, status, date, callback) {
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO Amendment VALUES(?,?,?,?,?,?,?,?,?)', [
		    simId, resId, country, clauseNumber, clause, status, date, "Waiting", "false"]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

	/**gets all entry(s) from the admendent table
	 * @param: SimulationId INTEGER
	 * @return: SimulationId INTEGER, ResolutionName TEXT, UserCountry TEXT, ClauseNumber TEXT, Clause TEXT, Status TEXT, Date TEXT
	 * 
	 */
exports.getAmendments = function(simId, callback) {
	db.serialize(function() {
		db.all("SELECT rowid, SimulationId, ResolutionName, UserCountry, ClauseNumber, Clause, Status, Date FROM Amendment WHERE SimulationId=? AND Fate='Waiting'", simId, function(err,rows){
			callback(rows);
			return;
		});
	});
};

exports.getAmendmentsbyResId = function(simId, resId, callback) {
	db.serialize(function() {
		db.all("SELECT rowid, SimulationId, ResolutionId, UserCountry, ClauseNumber, Clause, Status, Date, Fate, VotedOn FROM Amendment WHERE SimulationId=? AND ResolutionId=?", [simId, resId], function(err,rows){
			if(rows.length > 0)
			{
				callback(rows);
			}
			else
				{
				callback([]);
				}
			return;
		});
	});
};

exports.getWaitingAmendmentsbyResId = function(simId, resId, callback) {
	db.serialize(function() {
		var simID = parseInt(simId);
		var resID = resId.toString();
		
		db.all("SELECT rowid, SimulationId, ResolutionId, UserCountry, ClauseNumber, Clause, Status, Date, Fate FROM Amendment WHERE SimulationId=? AND ResolutionId=? AND Fate='Waiting' OR Fate='Failed'", [simID, resID], function(err,rows){
			if(rows.length > 0)
			{
				callback(rows);
			}
			else
				{
				callback([]);
				}
			return;
		});
	});
};

exports.isResolutionDebating = function(simId, resId, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Amendment WHERE SimulationId=? AND ResolutionId=? AND Fate='Debating'", [simId, resId], function(err,row){
			if(row.length > 0)
				{
				callback(true);
				}
			else
				{
				callback(false);
				}
			return;
		});
	});
};

exports.DebatingAmendment = function(simId, resId, callback) {
	db.serialize(function() {
		db.get("SELECT rowid FROM Amendment WHERE SimulationId=? AND ResolutionId=? AND Fate='Debating'", [simId, resId], function(err,row){
			callback(row.rowid);
			return;
		});
	});
};

exports.getAmendment = function(simId, resId, callback) {
	var simID = parseInt(simId);
	var resID = parseInt(resId);
	db.serialize(function() {
		db.get("SELECT rowid, SimulationId, ResolutionId, UserCountry, ClauseNumber, Clause, Status, Date, Fate, VotedOn FROM Amendment WHERE SimulationId=? AND rowid=?", [simID, resID], function(err,row){
			callback(row);
			return;
		});
	});
};

exports.setAmendmentFate = function(simId, resId, fate, callback) {
	var simID = parseInt(simId);
	var resID = parseInt(resId);
	db.serialize(function() {
		var stmt = db.prepare("UPDATE Amendment SET Fate=? WHERE SimulationId=? AND rowid=?", [fate, simID, resID]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

exports.setVotedOn = function(simId, resId, callback) {
	var simID = parseInt(simId);
	var resID = parseInt(resId);
	db.serialize(function() {
		var stmt = db.prepare("UPDATE Amendment SET VotedOn='true' WHERE SimulationId=? AND rowid=?", [simID, resID]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
}
/**Deletes an amendment entry
 * @param: SimulationId INTEGER, rowId INTEGER
 * @return: null
 * 
 */
exports.deleteAmendment = function(simId, rowId,callback) {
	db.serialize(function() {
		var stmt = db.prepare('DELETE FROM Amendment WHERE SimulationId=? AND rowid=?', [simId, rowId]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

exports.DebateStatus = function(simID, resID, user, callback) {
	db.serialize(function() {
		db.get("SELECT VotingToClose FROM Resolutions WHERE SimulationId = ? AND rowid = ? AND State='active'", 
				[simID, resID], function(err,vote){
		
			var vtc = vote.VotingToClose;
			
			var debating = false;
			db.all("SELECT * FROM Amendment WHERE SimulationId=? AND ResolutionId=? AND Fate='Debating'", [simID, resID], function(err,row){
				if(row.length > 0)
				{
					debating = true;
				}
				
				db.all('SELECT * FROM Vote WHERE SimId = ? AND ResId = ? AND Verdict =""', [simID, resID], function(err, votes){
					var voted = false;
					var voteID = null;
					var waiting = false;
					var voteOpen = false;
					
					console.log(votes.length)
					
					if(votes.length > 0)
						{
							db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', 
									[simID, resID], function(err, row){
								
								voteID = row.rowid;
								console.log(voteID)
								
								if(voteID != null)
								{
									voteOpen = true;
								}
								
								db.get('SELECT SimulationCountry FROM Memberships WHERE SimulationId = ? AND Username = ?', 
										[simID, user],function(err, Country){
									
											db.get('SELECT Vote FROM CountryVote WHERE VoteId=? AND ResId=? AND Country=?', [voteID, resID, Country.SimulationCountry], function(err, vote){
												if(vote != undefined)
												{
													if(vote.Vote != "")
													{
														voted = true;
													}
												}

										db.all('SELECT Vote FROM CountryVote WHERE VoteId=? AND ResId=?', [voteID, resID],function(err, votes){

											for(var i = 0; i<votes.length; i++)
												{
													if(votes[i].Vote === "")
														{
															waiting = true;
														}
												}
											
											var PermMember = false;
											db.get('SELECT SimulationCountry FROM Memberships WHERE SimulationId = ? AND Username = ?', 
													[simID, user],function(err, Country){
												if(vtc === "true")
												{
													if(Country.SimulationCountry === "China" || Country.SimulationCountry === "France" || Country.SimulationCountry === "United Kingdom"|| Country.SimulationCountry === "United States"|| Country.SimulationCountry === "Russian Federation")
													{
														PermMember = true;
													}	
												}
												
												var closingStatus = false;
												
												if(vtc === "closed")
												{
													closingStatus = true;
												}
												
												var variables = [];
												
												variables.push({
													votingToClose: closingStatus,
													debating: debating,
													waitVote: waiting,
													voteOpen: voteOpen,
													Final: PermMember,
													voted: voted
												});
												
												callback(variables);
												return;
											});
										});	
									});		
								});
							});		
						}
					
					else
					{
						var PermMember = false;
						db.get('SELECT SimulationCountry FROM Memberships WHERE SimulationId = ? AND Username = ?', 
								[simID, user],function(err, Country){
							if(vtc === "true")
							{
								if(Country.SimulationCountry === "China" || Country.SimulationCountry === "France" || Country.SimulationCountry === "United Kingdom"|| Country.SimulationCountry === "United States"|| Country.SimulationCountry === "Russian Federation")
								{
									PermMember = true;
								}	
							}
							
							var closingStatus = false;
							
							if(vtc === "closed")
							{
								closingStatus = true;
							}
							
							var variables = [];
							
							variables.push({
								votingToClose: closingStatus,
								debating: debating,
								waitVote: waiting,
								voteOpen: voteOpen,
								Final: PermMember,
								voted: voted
							});
							
							callback(variables);
							return;
					});
					};
				});
			});
		});
	});
};