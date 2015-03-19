var voteDB = require('../models/vote');

exports.CreateVote = function(simId, resId, description, callback){
	voteDB.CreateVote(simId, resId, description, function(data){
		callback(data);
	});
};

exports.getActiveVote = function(simId, resId, callback){
	voteDB.getActiveVote(simId, resId, function(data){
		callback(data);
	});
};

exports.setVoteVerdict = function(simId, resId, verdict, callback){
	voteDB.setVoteVerdict(simId, resId, verdict, function(data){
		callback(data);
	});
};
exports.setCountryVote = function(simId, resId, country, vote, callback){
	voteDB.setCountryVote(simId, resId, country, vote, function(data){
		callback(data);
	});
};

exports.getCountryVote = function(simId, resId, country, callback){
	voteDB.getCountryVote(simId, resId, country, function(data){
		callback(data);
	});
};

exports.HaveAllCountriesVoted = function(simId, resId, callback){
	voteDB.HaveAllCountriesVoted(simId, resId, function(data){
		callback(data);
	});
};

exports.getResults = function(simId, resId, voteId, voteType, callback){
	voteDB.getResults(simId, resId, voteId, voteType, function(data, data2){
		callback(data, data2);
	});
};

exports.clearCountryVotes = function(simId, resId, callback){
	voteDB.clearCountryVotes(simId, resId, function(data){
		callback(data);
	});
};

exports.GetTotalVoteCount = function(simId, callback){
	voteDB.GetTotalVoteCount(simId, function(data){
		callback(data);
	});
};