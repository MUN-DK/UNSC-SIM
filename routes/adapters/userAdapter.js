var userDB = require('../models/user');

//User methods
exports.Add = function(dispName, password, fname, lname, email, callback) {
	userDB.Add(dispName, password, fname, lname, email,function(data){
		callback(data);
	});
};

exports.UsernameExists = function(dispName, callback) {
	userDB.UsernameExists(dispName,function(data){
		callback(data);
	});
};

exports.Authenticate = function(dispName, pass, callback) {
	userDB.Authenticate(dispName, pass,function(data){
		callback(data);
	});
};

exports.GetFName = function(dispName, callback) {
	userDB.GetFName(dispName,function(data){
		callback(data);
	});
};

exports.GetFLNameEmail = function(dispName, callback) {
	userDB.GetFLNameEmail(dispName,function(data){
		callback(data);
	});
};

exports.GetRole = function(dispName, callback) {
	userDB.GetRole(dispName,function(data){
		callback(data);
	});
};

exports.GiveModeratorPrivledges = function(dispName, roleName, callback) {
	userDB.GiveModeratorPrivledges(dispName, roleName,function(data){
		callback(data);
	});
};

exports.Edit = function(dispName, fname, lname, email, callback) {
	userDB.Edit(dispName, fname, lname, email,function(data){
		callback(data);
	});
};

exports.EditWithPassword = function(dispName, fname, lname, email, password, callback) {
	userDB.EditWithPassword(dispName, fname, lname, email, password,function(data){
		callback(data);
	});
};

exports.ReturnUsers = function(ids, callback) { 
	userDB.ReturnUsers(ids,function(data){
		callback(data);
	});
};