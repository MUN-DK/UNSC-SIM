var newsDB = require('../models/newsfeed');

exports.Create = function(simID, title, text, type, callback) {
	newsDB.Create(simID, title, text, type, function(data){
		callback(data);
	});
};

exports.Update = function(rowid, simID, title, text, type, callback) {
	newsDB.Update(rowid, simID, title, text, type, function(data){
		callback(data);
	});
};

exports.Delete = function(rowID, simID, callback) {
	newsDB.Delete(rowID, simID, function(){
		callback();
	});
};

exports.GetNewsfeed = function(rowID, simID, callback) {
	newsDB.GetNewsfeed(rowID, simID, function(data){
		callback(data);
	});
};

exports.GetAllNewsfeed = function(simID, callback) {
	newsDB.GetAllNewsfeed(simID, function(data){
		callback(data);
	});
};
