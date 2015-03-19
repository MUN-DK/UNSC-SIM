var satsDB = require('../models/amendmentStats');

exports.createEntry = function(SimId, ResId, ClauseNum, Country, Username, Amendment, Status, Date, callback) {
	satsDB.createEntry(SimId, ResId, ClauseNum, Country, Username, Amendment, Status, Date, function(data) {
		callback(data);
	});
};
exports.updateResult = function(SimId, ResId, Amendment, Result, callback) {
	satsDB.updateResult(SimId, ResId, Amendment, Result, function(data) {
		callback(data);
	});
};
exports.getAmendments = function(SimId,callback) {
	satsDB.getAmendments(SimId,function(data) {
		callback(data);
	});
};

exports.countAmendments = function(SimId, CountryList, ResIdList, callback){
	satsDB.countAmendments(SimId, CountryList, ResIdList, function(data){
		callback(data);
	});
};