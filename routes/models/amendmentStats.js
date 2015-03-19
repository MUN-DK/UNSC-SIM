/**
 * Creates and modifies the table amendmentStats;
 * table contains:
 * simulation id number(SimId),resoulution id number(ResId),clause number(ClauseNum), abassador's country(Country), abassador's name,(Username),
 * the amendment(Amendment), the status of the amendment(Status), the date submited(Date), and the result of the amendment(Result).
 */

var db = require('./db_singleton.js');

/**Creates a new entry
 * @param: SimId INTEGER, ResIdName TEXT, ClauseNum INTEGER, Country TEXT, Username TEXT, Amendment TEXT, Status TEXT, Date Text, Result TEXT
 *				
 * @return: null
 * 
 */
exports.createEntry = function(SimId, ResId, ClauseNum, Country, Username, Amendment, Status, Date, callback) {
	db.serialize(function() {
		var stmt = db.prepare('INSERT INTO AmendmentStats VALUES(?,?,?,?,?,?,?,?,?)', [SimId, ResId, ClauseNum, Country, Username, Amendment, Status, Date,'Submited']);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**Updates the result of an entry
 * @param: SimId INTEGER, ResId TEXT, ClauseNum INTEGER, Country TEXT, Username TEXT, Amendment TEXT, Status TEXT, Date Text, Result TEXT
 *				
 * @return: SimId INTEGER, ResId TEXT, ClauseNum INTEGER, Country TEXT, Username TEXT, Amendment TEXT, Status TEXT, Date Text, Result TEXT
 * 
 */
exports.updateResult = function(SimId, ResId, Amendment, Result, callback){
	db.serialize(function() {
		var stmt = db.prepare('UPDATE AmendmentStats SET Result=? WHERE SimId=? AND ResId=?, AND Amendment=?',[Result,SimId,ResId,Amendment]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**returns the entry(s) of amendments that have been submitted
 * @param: SimId INTEGER
 *				
 * @return: SimId INTEGER, ResId TEXT, ClauseNum INTEGER, Country TEXT, Username TEXT, Amendment TEXT, Status TEXT, Date Text, Result TEXT
 * 
 */
exports.getAmendments = function(SimId,callback){
	db.serialize(function() {
		db.all("SELECT * FROM AmendmentStats WHERE SimId=?",SimId, function(err,rows){
			callback(rows);
			return;
		});
	});
};


exports.countAmendments = function(SimId, callback){
	db.serialize(function() {
		db.all("SELECT Country, ResId, COUNT(*) AS Count FROM AmendmentStats WHERE SimId=? GROUP BY Country, ResId",SimId,function(err, data){
			console.log("data length: "+data.length);
			callback(data);
		});
	});
};