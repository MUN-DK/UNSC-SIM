 /*
 * Creates and modifies the table for activity for which each row contains:
 * The Simulation Id, the description of the simulation activity, the date/time of activity, and if anyone can see the activity
 */

var db = require('./db_singleton.js');

/**Creates a new activity entry
 * @param: SimulationId TEXT, Description TEXT, Date TEXT, Visible BOOLEAN
 * @return: null
 * For Visible: true means only the chair or moderator can see this entry
 * 				false means anyone can see this entry
 * 
 */
exports.Add = function(simId, description, date, visible, callback) {
	db.serialize(function() {
		//console.log('Activity : '+simId+', '+description+', '+date+', '+visible);
		var stmt = db.prepare('INSERT INTO Activity VALUES(?,?,?,?)', [simId, description, date, visible ]);
		stmt.run();
		stmt.finalize();
		callback();
		return;
	});
};


/**Gets activity entry(s)
 * @param: SimulationId TEXT, viewRights BOOLEAN
 * @return: SimulationId TEXT, Description TEXT, Date TEXT, Visible BOOLEAN
 * 
 */
exports.Get = function(simId, viewRights, callback) {
	db.serialize(function() {
		if(viewRights === true){
			db.all("SELECT * FROM Activity WHERE SimulationId=?", simId,
					function(err,rows) {
						callback(rows);
						//return;
			});
		}
		else{
			db.all("SELECT * FROM Activity WHERE SimulationId=? AND Visible=?", [simId, viewRights],
					function(err,rows) {
						callback(rows);
						//return;
			});
		}
		return;
	});
};
