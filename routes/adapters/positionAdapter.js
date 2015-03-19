var positionDB = require('../models/position');

//Position methods
exports.Add = function(SimId, Country, Position, callback) {
	positionDB.Add(SimId, Country, Position,function(data){
		callback(data);
	});
};

exports.GetPosition = function(SimId, Country, callback) {
	positionDB.GetPosition(SimId, Country,function(data){
		callback(data);
	});
};

exports.GetAllPositions = function(SimID, callback) {
	positionDB.GetAllPositions(SimID,function(data){
		callback(data);
	});
};