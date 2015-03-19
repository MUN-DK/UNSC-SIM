var actDB = require('../models/activity');

//Country methods
exports.Add = function(simId, description, date, visible, callback) {
	actDB.Add(simId, description, date, visible, function(){
		callback();
	});
};

exports.Get = function(simId, visible, callback) {
	actDB.Get(simId, visible, function(data){
		callback(data);
	});
};