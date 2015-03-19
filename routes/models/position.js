 /*
 * Creates and modifies the table for position for which each row contains:
 * the simulation id number, the country's name, and the country's position of the simulation
 */

var db = require('./db_singleton.js');
var actDB = require('./activity');

/**Creates a new position entry
 * @param: SimulationId TEXT, Country TEXT, PositionText TEXT
 * @return: null
 * 
 */
exports.Add = function(SimId, Country, Position, callback) {
	db.serialize(function() {
		/*
		 * If there already exists an entry for the country at simulation id then it deletes the entry to make room for the new
		 * entry 
		 */
		var stmt = db.prepare('DELETE FROM Position WHERE SimulationId = ? AND Country = ? ',[SimId, Country] );
		stmt.run();
		stmt = db.prepare('INSERT INTO Position VALUES(?,?,?)',
				[SimId, Country, Position ]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};

/**gets an entry
 * @param: SimulationId TEXT, Country TEXT
 * @return: PositionText TEXT
 * 
 */
exports.GetPosition = function(SimId, Country, callback) {
	db.serialize(function() {
		db.get("SELECT PositionText FROM Position WHERE SimulationId = ? AND Country = ?",
				[SimId, Country],
				function(err, row) {
					var text;
					if(row === undefined){
						text = false;
					}
					else{
						text = row.PositionText;
					}
					callback(text);
			});
	});
};

/**Gets all entrys within param
 * @param: SimulationId TEXT
 * @return: SimulationId TEXT, Country TEXT, PositionText TEXT
 * 
 */
exports.GetAllPositions = function(SimID, callback) {
	db.serialize(function() {
		db.all("SELECT * FROM Position WHERE SimulationId = ?",SimID,
				function(err, rows) {
					callback(rows);
					return;
		});
	});
};
