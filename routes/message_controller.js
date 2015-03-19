var fs = require("fs");

var simDB = require('./adapters/simulationAdapter');
var messageDB = require('./adapters/messageAdapter');
var memberDB = require('./adapters/membershipAdapter');

exports.global = function(req,res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.session.currentSim;
		messageDB.getGlobalMessage(simId,function(usernames, messages){
			if(messages.length===0){
				res.render('message/global', {
					messages: false
		        });
			}
			else{
				var messageList = [];
				for(var i = 0; i < messages.length; i++) {
					for(var j = 0; j < usernames.length; j++) {
						if(messages[i].Username === usernames[j].username) {
							var country;
							if(messages[i].CountryName === '') {
								country = false;
							} else {
								country = messages[i].CountryName;
							}
							console.log(messages[i].messageType);
							messageList.push({username : messages[i].Username, firstname : usernames[j].fname, lastname : usernames[j].lname, message : messages[i].Message, date : messages[i].Date, country : country})
							break;
						}
					}
				}
				console.log(messageList);
	
				res.render('message/global', {				
					messages: messageList
		        });
			}
		});
	}
};

exports.sendGlobalMessage = function(req,res){
	var simId = req.session.currentSim;
	//var country = 'China';
	
	var messages = req.body.newMessage;
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var userName = req.session.user;
	
	memberDB.GetCountryBySimIdUsername(simId,userName,function(countryName){
		messageDB.addGlobalMessage(userName,now,messages,countryName,simId, function(){
			res.redirect('/message/global');		
		});
	});
};

exports.personal = function(req,res){
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{	
		var messages = [];
		var toUser = req.url.split('?')[1];
		var simId = req.session.currentSim;
		var currentUser = req.session.user;
		messageDB.getPersonalMessages(simId,currentUser,toUser,function(data){
			for(var i=0;i<data.length;i++){
				messages.push({
					message: data[i].Message,
					fromUser: data[i].FromUser,
					date: data[i].Date
				});
			}
			res.render('message/personal', {				
				messages: messages,
				toUser: toUser
	        });
		});
	}
	
};
exports.sendPersonalMessage = function(req,res){
	var sid = req.session.currentSim;
	var user1 = req.session.user;
	var user2 = req.url.split('?')[1];
	var description = req.body.newMessage;
	var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var allow = false;
	messageDB.addPersonalMessage(sid,user1,user2, description, date, allow, function(data1){
		messageDB.getPersonalMessages(sid,user1,user2,function(data){
			var messages = [];
			
			for(var i=0;i<data.length;i++){
				messages.push({
					message: data[i].Message,
					fromUser: data[i].FromUser,
					date: data[i].Date
				});
			}
			
			res.render('message/personal', {				
				messages: messages,
				toUser: user2
	        });
		});
	});
};