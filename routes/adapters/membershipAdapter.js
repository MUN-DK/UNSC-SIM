var memberDB = require('../models/membership');

//Membership methods
exports.Create = function(simId, simName, username, userRole, callback) {
	memberDB.Create(simId, simName, username, userRole,function(data){
		callback(data);
	});
	
};

exports.EditSimName = function(simId, simName, callback) {
	memberDB.EditSimName(simId, simName,function(data){
		callback(data);
	});
};

exports.GetUsersbySimID = function(simID, callback) {
	memberDB.GetUsersbySimID(simID,function(data){
		callback(data);
	});
};

exports.GetByUsernameRole = function(username, userRole, callback) {
	memberDB.GetByUsernameRole(username, userRole,function(data){
		callback(data);
	});
};

exports.GetByUsernameRoleDates = function(username, userRole, callback) {
	memberDB.GetByUsernameRoleDates(username, userRole,function(data,data2){
		callback(data,data2);
	});
};

exports.GetUsernamebyCountrySimId = function(country, simId, callback){
	memberDB.GetUsernamebyCountrySimId(country, simId,function(data){
		callback(data);
	});
};

exports.GetJoinableSimulations = function(username, callback) {
	memberDB.GetJoinableSimulations(username,function(data){
		callback(data);
	});
};

exports.GetJoinedSimulations = function(username, callback) {
	memberDB.GetJoinedSimulations(username,function(data){
		callback(data);
	});
};

exports.GetUsernamesbySimID = function(simID, callback) {
	memberDB.GetUsernamesbySimID(simID,function(data){
		callback(data);
	});
};

exports.GetUsernamesCountrybySimID = function(simID, callback) {
	memberDB.GetUsernamesCountrybySimID(simID,function(data){
		callback(data);
	});
};

exports.GetSimRolebySimIdUsername = function(simId,username, callback) {
	memberDB.GetSimRolebySimIdUsername(simId,username,function(data){
		callback(data);
	});
};

exports.GetUserRolebySimIdUsername = function(simId,username, callback) {
	memberDB.GetUserRolebySimIdUsername(simId,username,function(data){
		callback(data);
	});
};

exports.GetCountrybySimIdUsername = function(simId, username, callback) {
	memberDB.GetCountrybySimIdUsername(simId, username,function(data){
		callback(data);
	});
};

exports.SetCountry = function(simID, username, country, callback) {
	memberDB.SetCountry(simID, username, country,function(data){
		callback(data);
	});
};

exports.SetSimRole = function(simID, username, simRole, callback) {
	memberDB.SetSimRole(simID, username, simRole,function(data){
		callback(data);
	});
};

exports.SetDelegates = function(simID, delegates, callback) {
	memberDB.SetDelegates(simID, delegates,function(data){
		callback(data);
	});
};

exports.CountryAutoSort = function(sid, callback) {
	memberDB.CountryAutoSort(sid,function(data){
		callback(data);
	});
};

exports.CountryAutoSortFinish = function(sid, callback) {
	memberDB.CountryAutoSortFinish(sid,function(data){
		callback(data);
	});
};

exports.CountryManualSort = function(sid, users, selections, callback) {
	memberDB.CountryManualSort(sid, users, selections,function(data){
		callback(data);
	});
};

exports.GetCountryMembersBySimId = function(simId,username, callback){
	memberDB.GetCountryMembersBySimId(simId,username,function(data){
		callback(data);
	});
};

exports.GetCountryBySimIdUsername = function(simId,username, callback){
	memberDB.GetCountryBySimIdUsername(simId,username,function(data){
		callback(data);
	});
};

exports.SetManualUserCountry = function(simId, groupedData, callback){
	memberDB.SetManualUserCountry(simId, groupedData, function(data){
		callback(data);
	});
};

exports.ChangeDelegate = function(simId, username, country,callback){
	memberDB.ChangeDelegate(simId, username, country, function(data){
		callback(data);
	});
};

exports.GetUserCount = function(simId, callback){
	memberDB.GetUserCount(simId, function(data){
		callback(data);
	});
};