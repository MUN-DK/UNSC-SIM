var countryDB = require('../models/country');

//Country methods
exports.GetRandomCountry = function(callback) {
	countryDB.GetRandomCountry(function(data){
		callback(data);
	});
};

exports.GetAllCountries = function(callback){
	countryDB.GetAllCountries(function(data){
		callback(data);
	});
};