var messageDB = require('../models/message');

//Message methods
exports.addGlobalMessage = function(userName, date , message, country, simId, callback){
	messageDB.addGlobalMessage(userName, date , message, country, simId,function(data){
		callback(data);
	});
};

exports.getGlobalMessage = function(simId, callback){
	messageDB.getGlobalMessage(simId,function(data, data2){
		callback(data, data2);
	});
};

//Message methods
exports.addCountryMessage = function(userName, date , message, country, simId, callback){
	messageDB.addCountryMessage(userName, date , message, country, simId,function(data){
		callback(data);
	});
};

exports.getCountryMessage = function(simId, country, callback){
	messageDB.getCountryMessage(simId,country, function(data, data2){
		callback(data, data2);
	});
};

exports.getAllCountryMessage = function(simId, callback){
	messageDB.getAllCountryMessage(simId, function(data, data2){
		callback(data, data2);
	});
};

//Message methods
exports.addResolutionMessage = function(userName, date , message, country, simId, resId, messageType, callback){
	messageDB.addResolutionMessage(userName, date , message, country, simId, resId, messageType, function(data){
		callback(data);
	});
};

exports.getResolutionMessage = function(simId, resId, callback){
	messageDB.getResolutionMessage(simId,resId, function(data, data2){
		callback(data, data2);
	});
};

exports.getPersonalMessages = function(sid, user1, user2, callback){
	messageDB.getPersonalMessages(sid, user1, user2,function(data){
		callback(data);
	});
};

exports.addPersonalMessage = function(sid,user1,user2, description, date, allow, callback){
	messageDB.addPersonalMessage(sid,user1,user2, description, date, allow,function(data){
		callback(data);
	});
};

exports.GetNewMessagesForUser = function(sid,currentUser, callback){
	messageDB.GetNewMessagesForUser(sid,currentUser, function(data){
		callback(data);
	});
};