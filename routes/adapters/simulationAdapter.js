var simDB = require('../models/simulation');

//Simulation methods
exports.Create = function(name, regDeadline, start, end, createdBy, callback) {
	simDB.Create(name, regDeadline, start, end, createdBy,function(data){
		callback(data);
	});
};

exports.Edit = function(id, name, chair, regDeadline, start, end, callback) {
	simDB.Edit(id, name, chair, regDeadline, start, end,function(data){
		callback(data);
	});
};

exports.Get = function(id, callback) {
	simDB.Get(id,function(data){
		callback(data);
	});
};

exports.GetDates = function(ids, callback) {
	simDB.GetDates(ids,function(data,data2){
		callback(data,data2);
	});
};

exports.GetAvailableSimulations = function(ids, callback) {
	simDB.GetAvailableSimulations(ids,function(data){
		callback(data);
	});
};

exports.GetJoinedSimulations = function(ids, callback) {
	simDB.GetJoinedSimulations(ids,function(data){
		callback(data);
	});
};

exports.PositionDeadline = function(sid, callback){
	simDB.PositionDeadline(sid,function(data){
		callback(data);
	});
};

exports.GetRegistrationDeadline = function(sid, callback){
	simDB.GetRegistrationDeadline(sid,function(data){
		callback(data);
	});
};