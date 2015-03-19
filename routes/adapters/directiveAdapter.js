/**
 * New node file
 */
var direcDB = require('../models/directive');

exports.Add = function(SimId, Direc,Country, ModName, callback) {
	direcDB.Add(SimId, Direc, Country, ModName,function(data){
		callback(data);
	});
};

exports.Get = function(SimId, callback) {
	direcDB.Get(SimId,function(data){
		callback(data);
	});
};

