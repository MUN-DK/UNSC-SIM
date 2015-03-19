var resoDB = require('../models/resolution');

//Resolution methods
exports.CreateResolution = function(sid, resName, scenario, clauses,callback) {
	resoDB.CreateResolution(sid, resName, scenario, clauses,function(data){
		callback(data);
	});
};

exports.getFullResolution = function(simId, callback){
	resoDB.getFullResolution(simId,function(data,data2){
		callback(data,data2);
	});
};

exports.getActiveResolution = function(simId, rowId, callback){
	resoDB.getActiveResolution(simId,rowId,function(data,data2){
		callback(data,data2);
	});
};

exports.getFullResolutions = function(simId, callback){
	resoDB.getFullResolutions(simId,function(data,data2){
		callback(data,data2);
	});
};

exports.updateResolution = function(simID, resID, callback){
	resoDB.updateResolution(simID, resID, function(){
		callback();
	});
};

exports.renumberClauses = function(simID, resID, callback){
	resoDB.renumberClauses(simID, resID, function(){
		callback();
	});
};
exports.setActivity = function(sid, rid, activity, callback){
	resoDB.setActivity(sid, rid, activity,function(){
		callback();
	});
};

exports.setVotingToClose = function(simID, resID, closing, callback){
	resoDB.setVotingToClose(simID, resID, closing, function(){
		callback();
	});
};

exports.isVotingToClose = function(simID, resID, callback){
	resoDB.isVotingToClose(simID, resID,function(data){
		callback(data);
	});
};

exports.getActive = function(simId, callback){
	resoDB.getActive(simId,function(data){
		callback(data);
	});
};

exports.GetClausesbySimId = function(simId, callback) {
	resoDB.GetClausesbySimId(simId, function(data){
		callback(data);
	});
};

exports.updateClause = function(simId, resId, clauseNum, newClauseDesc, amendStatus, callback) {
	resoDB.updateClause(simId, resId, clauseNum, newClauseDesc, amendStatus, function(data){
		callback(data);
	});
};

exports.addAmendment = function(simId, resId, country, clauseNumber, clause, status, date, callback) {
	resoDB.addAmendment(simId, resId, country, clauseNumber, clause, status, date,function(data){
		callback(data);
	});
};

exports.getAmendments = function(simId, callback) {
	resoDB.getAmendments(simId,function(data){
		callback(data);
	});
};

exports.getAmendmentsbyResId = function(simId, resId, callback) {
	resoDB.getAmendmentsbyResId(simId, resId, function(data){
		callback(data);
	});
};

exports.getWaitingAmendmentsbyResId = function(simId, resId, callback) {
	resoDB.getWaitingAmendmentsbyResId(simId, resId, function(data){
		callback(data);
	});
}
exports.getAmendment = function(simId, resId, callback) {
	resoDB.getAmendment(simId, resId,function(data){
		callback(data);
	});
};

exports.setAmendmentFate = function(simId, resId, fate, callback) {
	resoDB.setAmendmentFate(simId, resId, fate, function(data){
		callback(data);
	});
};

exports.setVotedOn = function(simId, resId, callback) {
	resoDB.setVotedOn(simId, resId, function(data){
		callback(data);
	});
};

exports.deleteAmendment = function(simId, rowId, callback) {
	resoDB.deleteAmendment(simId, rowId, function(data) {
		callback(data);
	});
};

exports.isResolutionDebating = function(simId, resId, callback) {
	resoDB.isResolutionDebating(simId, resId, function(data) {
		callback(data);
	});
};

exports.DebatingAmendment = function(simId, resId, callback) {
	resoDB.DebatingAmendment(simId, resId, function(data) {
		callback(data);
	});
};

exports.VotePassingAmendment = function(simId, resId, callback) {
	resoDB.VotePassingAmendment(simId, resId, function(data) {
		callback(data);
	});
};

exports.DebateStatus = function(simID, resID, user, callback) {
	resoDB.DebateStatus(simID, resID, user, function(data) {
		callback(data);
	});
};