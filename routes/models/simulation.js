 /*
 * Creates and modifies the table for simulation for which each entry contains:
 * The name of the simulation, name of user to be chair, name of moderator, date that registration into simulation end,
 * starting date of simulation, ending date of simulation, method of sorting user.
 *
 */
 
var db = require('./db_singleton.js');
var memberDB = require('./membership');

/**Creates a new entry
 * @param: SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT,AutoCountrySort TEXT
 * @return: SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT,AutoCountrySort TEXT
 * 
 */
exports.Create = function(name, regDeadline, start, end, createdBy, callback) {
	db.serialize(function() {
				var stmt = db
						.prepare(
								'INSERT INTO Simulations(SimulationName,RegistrationDeadline,StartDate,EndDate,CreatedBy) VALUES(?,?,?,?,?)',
								[ name, regDeadline, start, end, createdBy ]);
				stmt.run();
				stmt.finalize();

				db.get("SELECT last_insert_rowid() FROM Simulations", function(
						err, row) {

					memberDB.Create(row['last_insert_rowid()'], name,
							createdBy, 'Mod', function() {
								callback(row['last_insert_rowid()']);
								return;
							});
					
				});

			});
};

/**edits an entry
 * @param: rowid INTEGER, SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT
 * @return: null
 * 
 */
exports.Edit = function(id, name, chair, regDeadline, start, end, callback) {
	db
			.serialize(function() {
				var stmt = db
						.prepare(
								"UPDATE Simulations SET SimulationName = ?, ChairName = ?, RegistrationDeadline = ?, StartDate= ?, EndDate = ? WHERE rowid = ?",
								[ name, chair, regDeadline, start, end, id ]);
				stmt.run();
				stmt.finalize();
				memberDB.EditSimName(id, name, function() {});
				callback();
				return;
			});
};

/**gets an entry
 * @param: rowid INTEGER
 * @return: SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT,AutoCountrySort TEXT
 * 
 */
exports.Get = function(id, callback) {
	db.serialize(function() {
		db.get("SELECT * FROM Simulations WHERE rowid = ?", id, function(err,
				row) {
			callback(row);
			return;
		});
	});
};

/**Gets the dates of the simulation
 * @param: rowid INTEGER
 * @return: SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT,AutoCountrySort TEXT
 * 
 */
exports.GetDates = function(ids, callback) {
	db.serialize(function() {
		var idsArr1 = ids;
		var idsArr2 = ids;
		
		var qstring1 = idsArr1.map(function(e) {
			return "rowid=" + e;
		}).join(" OR ");
		
		var qstring2 = idsArr1.map(function(e) {
			return "rowid != " + e;
		}).join(" AND ");

		if(idsArr1.length !== 0) {
			qstring1 = " WHERE " + qstring1;
			qstring2 = " WHERE " + qstring2;
		}
		// console.log(qstring);
		db.all("SELECT * FROM Simulations" + qstring1, function(err,
				rows1) {

			db.all("SELECT * FROM Simulations" + qstring2, function(err,
					rows2) {

				callback(rows1, rows2);
				return;
			});
		});
	});
};

/**Gets  Available Simulations
 * @param: rowid INTEGER
 * @return: SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT
 * 
 */
exports.GetAvailableSimulations = function(ids, callback) {
	db.serialize(function() {
		var idsArr = ids;

		var qstring = idsArr.map(function(e) {
			return "rowid != " + e;
		}).join(" AND ");

		if(idsArr.length !== 0) {
			qstring = " WHERE " + qstring;
		}
		
		db.all("SELECT SimulationName,ChairName,CreatedBy,RegistrationDeadline,StartDate,EndDate,rowid FROM Simulations" + qstring, function(err, rows) {
				callback(rows);
				return;
		});
	});
};

/**Gets Simulations that have been joined
 * @param: rowid INTEGER
 * @return: SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT
 * 
 */
exports.GetJoinedSimulations = function(ids, callback) {
	db.serialize(function() {
		var idsArr = ids;

		var qstring = idsArr.map(function(e) {
			return "rowid = " + e;
		}).join(" OR ");

		qstring = " WHERE " + qstring;
		
		if(idsArr.length === 0) {
			callback([]);
			return;
		}
		
		db.all("SELECT SimulationName,ChairName,CreatedBy,RegistrationDeadline,StartDate,EndDate,rowid FROM Simulations" + qstring, function(err, rows) {
				callback(rows);
				return;
		});
	});
};

/**Gets the simulation start date which is also the position deadline date
 * @param:rowid INTEGER
 * @return: StartDate TEXT
 * 
 */
exports.PositionDeadline = function(sid, callback){
	db.serialize(function(){
		console.log(sid);
		db.get("SELECT StartDate FROM Simulations WHERE rowid = ?", sid, function(err, row){
			var StartDate = row.StartDate;
			callback(StartDate);
			return;
		});
	});
};

/**Gets the registrationDeadline date of simulation
 * @param: rowid INTEGER
 * @return: RegistrationDeadline TEXT, AutoCountrySort TEXT
 * 
 */
exports.GetRegistrationDeadline = function(sid, callback){
	db.serialize(function(){
		db.get("SELECT RegistrationDeadline,AutoCountrySort FROM Simulations WHERE rowid = ?", sid, function(err, row){
			callback(row);
			return;
		});
	});
};
