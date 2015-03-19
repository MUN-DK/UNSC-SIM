/*
 * Creates and modifies the table for Country which holds the
 * names of all the countries currently in the UN simulation.
 */

var db = require('./db_singleton.js');
var msgDB = require('./message');

/** Gets all the country names in the database
 * @param
 * @return: countryName [object] array
 * 
 */
exports.GetAllCountries = function(callback){
	db.serialize(function(){
		db.all("SELECT countryName FROM Country", function(err,rows){
			callback(rows);
			return;
		});
	});
};


