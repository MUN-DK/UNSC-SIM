var memberDB = require('./adapters/membershipAdapter');
var countryDB = require('./adapters/countryAdapter');
var messageDB = require('./adapters/messageAdapter');

exports.list = function(req, res) {	
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		countryDB.GetAllCountries(function(data) {
			var chair, mod = null;
			var chairLoggedIn, modLoggedIn = false;
			var chairHasNewMessage, modHasNewMessage = false;
			memberDB.GetUsersbySimID(req.session.currentSim, function(users) {
				messageDB.GetNewMessagesForUser(req.session.currentSim, req.session.user, function(usersWithNewMessage){
					var countries = [];
					for(var i = 0; i < data.length; i++) {
						var memInfo = [];
						for(var j = 0; j < users.length; j++) {
							var haveNewMessage = false;
							for(var k = 0;k<usersWithNewMessage.length;k++){
//								console.log("1:" + usersWithNewMessage[k].ToUser +
//										" 2:" + req.session.user +
//										" 3:" + usersWithNewMessage[k].FromUser + 
//										" 4:" + users[j].Username);
								if(usersWithNewMessage[k].ToUser === req.session.user && usersWithNewMessage[k].FromUser === users[j].Username && usersWithNewMessage[k].IsNewMessage === 'true' ){
									haveNewMessage = true;
									break;
								}
							}
							var isCurrentUser = (users[j].Username === req.session.user?true:false);
							if(users[j].SimulationRole != "Chair" & users[j].SimulationCountry === data[i].countryName) {
								
								if(users[j].SimulationRole === "Delegate" ) {
									memInfo.push({
										user : {username : users[j].Username, ambassador : true, isCurrentUser:isCurrentUser, hasNewMessage: haveNewMessage}
									});
								}
								else
								{
									
									memInfo.push({
										user : {username : users[j].Username, ambassador : false, isCurrentUser : isCurrentUser, hasNewMessage: haveNewMessage}
									});
								}
							}
						
							
							if(users[j].SimulationRole === "Chair" )
							{
									chair = users[j].Username;
									chairLoggedIn = isCurrentUser;
									chairHasNewMessage = haveNewMessage;
							}
							
							if(users[j].UserRole === "Mod" )
								{
									mod = users[j].Username;
									modLoggedIn = isCurrentUser;
									modHasNewMessage = haveNewMessage;
								}
						}
					countries.push({name : data[i].countryName, Members : memInfo});
					}
					var show = false;
					for(var k = 0; k < countries.length; k++){
						if(countries[k].Members.length !== 0)
							{
								show = true;
							}
					}
					
					res.render('membership/list', { countries : countries, chair : chair, modName : mod, show : show, cIn: chairLoggedIn, mIn: modLoggedIn, chairHasNewMessage: chairHasNewMessage, modHasNewMessage: modHasNewMessage });
				});
			});
		});
	}
};