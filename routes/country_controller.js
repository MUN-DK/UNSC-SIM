var userDB = require('./adapters/userAdapter');
var memberDB = require('./adapters/membershipAdapter');
var simDB = require('./adapters/simulationAdapter');
var messageDB = require('./adapters/messageAdapter');
var direcDB = require('./adapters/directiveAdapter');
var ambDB = require('./adapters/ambassadorAdapter');

exports.overview = function(req, res) {
	var CurrentDate = 0;
	var isChair;
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
		res.render('user/login', {
			title : "Model UN Security Council Sim",
			error : false
		});
	}
	else {
		memberDB.GetCountryMembersBySimId(req.session.currentSim,req.session.user,function(countryUser){
			var currentDate = new Date();
			
		    var yyyy = currentDate.getFullYear().toString();                                    
	        var mm = (currentDate.getMonth()+1).toString(); // getMonth() is zero-based         
	        var dd  = currentDate.getDate().toString();             
	                            
	        var currDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); 
	       
			if(!(req.session.isMod)){
				//This CAN be done asyncronously ~ ERMAHGURD
				simDB.PositionDeadline(req.session.currentSim,function(posDate){

			        if(currDate >= posDate){
			        	req.session.ShowPositions = true;
			        }
			        else{
			        	req.session.ShowPositions = false;
			        }
				});
				
				//nest the rest in here after admin country overview fixed
				simDB.GetRegistrationDeadline(req.session.currentSim, function(regDate){
					if(regDate.AutoCountrySort){
						if(currDate >= regDate.RegistrationDeadline){
							memberDB.CountryAutoSort(req.session.currentSim,function(){});
						}
					}
				});
				
			}
			var countryUserList = [];
			var countryName;

			(countryUser.length > 0)? countryName = countryUser[0].SimulationCountry:countryName='';
			memberDB.GetUsernamebyCountrySimId(countryName,req.session.currentSim,function(countryUsers){
				for ( var i = 0; i < countryUsers.length; i++) {
					countryUserList.push({
						username : countryUsers[i].Username
					});
				}

				if(countryName === '') { countryName = false; }

				//console.log('countryName: ' + countryName)
				var simulationsArr = [];
				memberDB.GetByUsernameRole(req.session.user, 'Mod', function(data) {
					var simulationsArr = [];
					for ( var c = 0; c < data.length; c++) {
						simulationsArr.push({
							simName : data[c].SimulationName,
							simId : data[c].SimulationId
						});
					}
				
					simDB.Get(req.session.currentSim, function(sim) {
						if(req.session.user === sim.ChairName) {
							isChair = true;
						}
						else{
							isChair = false;
						}
						console.log("user: "+req.session.user+" chair: "+sim.ChairName);
						console.log(isChair);
						var chair = null;
						if(sim.ChairName !== "")
							{
								chair = sim.ChairName;
							}
						var showDirec = false;
						var directive;
						direcDB.Get(req.session.currentSim,function(data){
							for(var i=0;i<data.length;i++){
								if(data[i].country===countryName){
									directive = data[i].Direc;
								}
							}
							var messages = [];
							messageDB.getCountryMessage(req.session.currentSim, countryName, function(usernames, messages){
								if(messages.length===0){
									res.render('country/overview', {
										simList : simulationsArr,
										showDirec: showDirec,
										directive: directive,
										countryUserList: countryUserList,
										countryName: countryName,
										chair: chair,
										isChair: isChair,
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
												messageList.push({username : messages[i].Username, firstname : usernames[j].fname, lastname : usernames[j].lname, message : messages[i].Message, date : messages[i].Date, country : country})
												break;
											}
										}
									}
							
								res.render('country/overview', {
									simList : simulationsArr,
									countryUserList: countryUserList,
									showDirec: showDirec,
									directive: directive,
									countryName: countryName,
									chair: chair,
									isChair: isChair,
									messages: messageList
								});
							}
						});
					});
				});
			});
			});
	});
	}
};

exports.sendCountryMessage = function(req,res){
	var simId = req.session.currentSim;
	var messages = req.body.newMessage;
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var userName = req.session.user;
	
	memberDB.GetCountryBySimIdUsername(simId,userName,function(countryName){
		messageDB.addCountryMessage(userName,now,messages,countryName,simId, function(){
			res.redirect('/country/overview');
		});
	});
};

exports.selectAmbassador = function(req,res){
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
		res.render('user/login', {
			title : "Model UN Security Council Sim",
			error : false
		});
	}
	else {
		var usernames = [];
		var simId = req.session.currentSim;
		var user = req.session.user;
		memberDB.GetCountryMembersBySimId(simId,user,function(countryUser){
			var country = countryUser[0].SimulationCountry;
			ambDB.GetVotes(simId, country, function(data){
				for ( var i = 0; i < data.length; i++) {
					usernames.push({username: data[i].user,
			            votes: data[i].votes
		            });
				}
			});
				ambDB.GetVoted(simId,country,user,function(row){
					res.render('country/selectAmbassador',{usernames: usernames,
                                                           voted: row[0].voted});
				});
		});
	}
};

exports.ambassador = function(req,res){
	var simId = req.session.currentSim;
	var user = req.session.user;
	var votedUser = req.body.username;
	ambDB.GetVotesByUser(simId,votedUser, function(votes){
		//var v = votes+1;
		ambDB.addVotes(simId, votedUser, function(){});
	});
	var voted = false;
    ambDB.SetVoted(simId, user, voted, function(){});
	var usernames = [];
	memberDB.GetCountryMembersBySimId(simId,user,function(countryUser){
		var country = countryUser[0].SimulationCountry;
		var reset = false;
		var amb ;
		var allVoted = false;

		ambDB.GetVotes(simId, country, function(data){
			ambDB.GetAllVoted(simId,country,function(data1){
				var votedCounter = data1.length;
				for (var i=0; i<data1.length; i++){
					if(data1[i].voted){
						votedCounter--;
						
					}
				}
				if(votedCounter===data1.length){
					allVoted = true;
				}
				
				for( var i=0; i<data.length; i++){
					if(data[i].votes>data.length*0.66){
						reset = true;
						amb = data[i].user;
					}
				}
				if(reset){
					memberDB.ChangeDelegate(simId,amb,country,function(){});
					for( var j=0; j<data.length; j++){
						usernames.push({username: data[j].user,
							            votes: 0});
					}
					ambDB.Reset(simId,country,function(){
						//memberDB.SetDelegates(simId,amb,function(){});
					});
					res.render('country/selectAmbassador',{usernames: usernames,
		                voted: true,
		                success: true,
		                amb:amb});
				}
				else{
					if(allVoted){
						for( var j=0; j<data.length; j++){
							usernames.push({username: data[j].user,
								            votes: 0});
						}
						ambDB.Reset(simId,country,function(){
							//memberDB.SetDelegates(simId,amb,function(){});
						});
						res.render('country/selectAmbassador',{usernames: usernames,
			                voted: true,
			                noAmb: true});
					}
					else{
						for( var j=0; j<data.length; j++){
							usernames.push({username: data[j].user,
					            votes: data[j].votes
				            });
						}
				
						ambDB.GetVoted(simId,country,user,function(row){
							res.render('country/selectAmbassador',{usernames: usernames,
			                                                       voted: row[0].voted});
						});
					}
				
				}
			});

		});
		//console.log(reset);

	});
};
