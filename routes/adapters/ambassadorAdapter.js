var ambDB = require('../models/ambassador');

//Country methods
exports.Add = function(simId, country, user, callback) {
	ambDB.Add(simId, country, user, function(){
		callback();
	});
};

exports.GetVotes = function(simId, country, callback) {
	ambDB.GetVotes(simId, country, function(data){
		callback(data);
	});
};

exports.del = function(simId,callback){
	ambDB.del(simId,function(){
		callback();
	});
};
exports.update = function(simId, country, user, callback) {
	ambDB.update(simId, country, user, function(){
		callback();
	});
};

exports.GetVoted = function(simId, country, user, callback) {
	ambDB.GetVoted(simId, country, user, function(data){
		callback(data);
	});
};

exports.GetAllVoted = function(simId, country, callback) {
	ambDB.GetAllVoted(simId, country, function(data){
		callback(data);
	});
};

exports.GetVotesByUser = function(simId, user, callback) {
	ambDB.GetVotesByUser(simId, user, function(data){
		callback(data);
	});
};

exports.addVotes = function(simId, user, vote, callback) {
	ambDB.addVotes(simId, user, vote, function(data){
		callback(data);
	});
};

exports.SetVoted = function(simId, user, vote, callback) {
	ambDB.SetVoted(simId, user, vote, function(data){
		callback(data);
	});
};

exports.Reset = function(simId, country, callback) {
	ambDB.Reset(simId, country, function(data){
		callback(data);
	});
};