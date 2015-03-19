//Vote (SimId TEXT, ResId TEXT, Description TEXT, Verdict TEXT)
//CountryVote (VoteId TEXT, Country TEXT, ResId TEXT, Vote TEXT)

var db = require('./db_singleton.js');
var countryDB = require('./country');
var messageDB = require('./message');

exports.CreateVote = function(simId, resId, description, callback){
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO Vote (SimId, ResId, Description, Verdict) VALUES(?,?,?,?)', 
				[simId, resId, description, ""]);
		stmt.run();
		stmt.finalize();
		
		db.get("SELECT last_insert_rowid() FROM Vote", function(err, row) {
			var vID = row['last_insert_rowid()'];
			countryDB.GetAllCountries(function(countries){
				var stmt2;
				for (var i = 0; i < countries.length; i++)
					{
						countryName = countries[i].countryName;
						stmt2 = db.prepare('INSERT INTO CountryVote (VoteId, Country, ResId, Vote) VALUES(?,?,?,?)', 
								[vID, countryName, resId, ""]);
						stmt2.run();
					}
				stmt2.finalize();
				callback();
				return;
			});
		});
	});
};

exports.clearCountryVotes = function(simId, resId, callback){
	db.serialize(function() {
		db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', [simId, resId], function(err, row){
			countryDB.GetAllCountries(function(countries){
				var stmt2;
				for (var i = 0; i < countries.length; i++)
					{
						countryName = countries[i].countryName;
						stmt2 = db.prepare('UPDATE CountryVote Set Vote="" WHERE VoteId=?', row.rowid);
						stmt2.run();
					}
				stmt2.finalize();
				callback();
				return;
			});
		});	
	});
};

exports.getActiveVote = function(simId, resId, callback){
	db.serialize(function() {
		db.all('SELECT * FROM Vote WHERE SimId = ? AND ResId = ? AND Verdict =""', [simId, resId], function(err, votes){
			if(votes.length > 0)
				{
					db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', 
							[simId, resId], function(err, row){
						callback(row.rowid);
						return;
					});
				}
			else
				{
					callback(null);
					return;
				}
		});
	});
};

exports.setVoteVerdict = function(simId, resId, verdict, callback){
	db.serialize(function() {
		var simID = resId.toString();
		var resID = resId.toString();
		db.all('SELECT * FROM Vote WHERE SimId = ? AND ResId = ?', [simID, resID], function(err, votes){
			if(votes.length > 0)
				{
					db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', [simID, resID], function(err, row){
						var stmt = db.prepare('UPDATE Vote SET Verdict=? WHERE rowid=? AND SimId=? AND ResId=?', [verdict,row.rowid, simID, resID]);
						stmt.run();
						stmt.finalize();
					});
				}
			callback();
			return;
		});
	});
};

exports.setCountryVote = function(simId, resId, country, vote, callback){
	db.serialize(function() {
		db.all('SELECT * FROM Vote WHERE SimId = ? AND ResId = ?', [simId, resId], function(err, votes){
			db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', 
					[simId, resId], function(err, row){
				var voteId = row.rowid;
				
				var stmt = db.prepare('UPDATE CountryVote SET Vote=? WHERE VoteId=? AND resId=? AND Country=?', [vote, voteId, resId, country]);
				stmt.run();
				stmt.finalize();	
				callback();
				return;
			});
		});
	});
};

exports.getCountryVote = function(simId, resId, country, callback){
	db.serialize(function() {
		db.all('SELECT * FROM Vote WHERE SimId = ? AND ResId = ?', [simId, resId], function(err, votes){
			db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', 
					[simId, resId], function(err, row){
				var voteId = row.rowid;
				
				db.get('SELECT Vote FROM CountryVote WHERE VoteId=? AND resId=? AND Country=?', [voteId, resId, country], function(err, vote){
					var voted = false;
					if(vote.Vote != "")
						{
						voted = true;
						}
					callback(voted);
					return;
				});
			});
		});
	});
};

exports.HaveAllCountriesVoted = function(simId, resId, callback){
	db.serialize(function() {
		db.all('SELECT * FROM Vote WHERE SimId = ? AND ResId = ?', [simId, resId], function(err, votes){
			db.get('SELECT rowid FROM Vote WHERE Verdict = "" AND SimId = ? AND ResId = ?', 
					[simId, resId], function(err, row){
				var voteId = row.rowid;
				
				db.all('SELECT Vote FROM CountryVote WHERE VoteId=? AND ResId=?', [voteId, resId],function(err, votes){
					var waiting = false;
					for(var i = 0; i<votes.length; i++)
						{
							if(votes[i].Vote === "")
								{
									waiting = true;
								}
						}
					callback(waiting);
					return;
				});
			});
		});
	});
};

exports.getResults = function(simId, resId, voteId, voteType, callback){
	db.serialize(function() {
		db.get('SELECT * FROM Vote WHERE rowid = ? AND SimId = ? AND ResId = ?', [voteId, simId, resId], function(err, vote){
			db.all('SELECT Vote FROM CountryVote WHERE VoteId=? AND ResId=?', [voteId, resId], function(err, votes){
				
				var yCount = 0;
				var nCount = 0;
				var aCount = 0;
				var vCount = 0;
				for(var i = 0; i<votes.length; i++)
				{
					if(votes[i].Vote === "Yes")
					{
						yCount++;
					}
					
					if(votes[i].Vote === "No")
					{
						nCount++;
					}
					
					if(votes[i].Vote === "Abstain")
					{
						aCount++;
					}
					
					if(votes[i].Vote === "Veto")
					{
						vCount++;
					}
				}

				var totalVotes = 15 - aCount;
				var threshold = 0.0;
				var result;
				if(voteType === "Debate")
					{
						threshold = 0.50;
					}
				
				if(voteType === "Add" || voteType === "Close")
				{
					threshold = 0.66;
				}
				var res=(yCount/totalVotes)*1.0;
				if(((yCount/totalVotes)*1.0) > threshold)
					{
						if(vCount > 0)
						{
							result = false;
						}
						else
						{
							result = true;
						}
					}
				else
					{
						result = false;
					}
					
					if(yCount >= 0)
					{
						var voteString = "Yes: " +yCount +" ";
						
						if(nCount >= 0)
						{
							voteString += "No: " +nCount +" ";
							
							if(aCount > 0)
							{
								voteString += "Abstain: " +aCount +" ";
							}	
							if(vCount > 0)
							{
								voteString += "Veto: " +vCount +" ";
							}
						}
					}
						
						
					
					callback(result, voteString);
					return;
			});	
		});
	});
};

exports.GetTotalVoteCount = function(simId, callback){
	db.get('SELECT Count(*) FROM Vote WHERE SimId = ?', simId, function(err,count){
		callback(count['Count(*)']);
		return;
	});
};