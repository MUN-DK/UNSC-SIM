var userDB = require('./adapters/userAdapter');
var memberDB = require('./adapters/membershipAdapter');
var messageDB = require('./adapters/messageAdapter');
var simDB = require('./adapters/simulationAdapter');
var countryDB = require('./adapters/countryAdapter');
var positionDB = require('./adapters/positionAdapter');
var resDB = require('./adapters/resolutionAdapter');
var actDB = require('./adapters/activityAdapter');
var voteDB = require('./adapters/voteAdapter');
var statsDB = require('./adapters/amendmentStatsAdapter');



exports.main = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		resDB.getFullResolutions(req.session.currentSim,function(resClauses, resIds){
			var resoArr = [];
			var canEnable = true;
			for(var i = 0; i< resIds.length; i++){
				var clauseList = [];
				var rName;
				var rState;
				var rScenario;
				var enterRoom = false;
				
				for(var j=0; j < resClauses.length; j++){
					if(resIds[i] === resClauses[j].ResolutionId){
						rState = resClauses[j].State;
						rName = resClauses[j].ResolutionName;
						rScenario = resClauses[j].Scenario;
						
						if(resClauses[j].OriginalDescription != "")
							{
								clauseList.push({
									clauseNumber:resClauses[j].ClauseNumber,
									clauseDescription:resClauses[j].OriginalDescription
									
								});
							}
					}
				}
				
				if(rState === "active")
					{
						enterRoom = true;
					}
				resoArr.push({
					active:rState,
					enterRoom: enterRoom,
					resName:rName,
					scenario:rScenario,
					clauseList:clauseList,
					resoId:resIds[i]
				});
			}
			simDB.PositionDeadline(req.session.currentSim, function(data){
				var start = new Date(data);
		
				var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				var startDate = monthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
				var papersOpen = (new Date() >= start);
		
				simDB.Get(req.session.currentSim, function(data2) {
					var chair = data2.ChairName;
					var isChair = (req.session.user === chair);
					//var isMod = (req.session.user === data2.CreatedBy);
		
					var editvalid = (!isChair && !req.session.isMod && !papersOpen);
					var isModOrChair = (isChair || req.session.isMod);
					if(isChair || req.session.isMod)
						{
						papersOpen = true;
						}
					
					memberDB.GetCountrybySimIdUsername(req.session.currentSim, req.session.user, function(country){
						var showRes = true;
						console.log(country);
						if(country === "" && !isChair &&! req.session.isMod)
						{
							console.log("Got Here");
							showRes = false;
						}
						res.render('resolution/main', {
							papersOpen : papersOpen,
							startDate : startDate,
							editvalid : editvalid,
							Resolutions:resoArr,
							showRes: showRes,
							isModOrChair: isModOrChair
						});
					});
				});
			});
		});
	}
};


exports.position = function(req, res){
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.session.currentSim;
		var user =  req.session.user;
		memberDB.GetCountrybySimIdUsername(simId,user,function(data) {
			var Country = data;
			positionDB.GetPosition(simId, Country, function(data3) {
				//console.log(req.session.currentSim+' '+req.session.user);
				memberDB.GetSimRolebySimIdUsername(simId, user, function(data4){
					simDB.PositionDeadline(simId, function(data5){
						var delegate = (data4 === "Delegate");
						var start = new Date(data5);
	
						var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
						var startDate = monthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
						var papersOpen = (new Date() >= start);
						
						var paperVal = data3;
						if(!delegate && data3 === false) { paperVal = 'No paper submitted. Your country\'s ambassador is resposible for submitting your position paper.' }
	
						if(paperVal === false)
							{
									res.render('./resolution/position',{
										title : "Model UN Security Council Sim",
										Country : Country,
										Position : "",
										Delegate: delegate,
										papersOpen : papersOpen,
										startDate : startDate
								});
							}
						else
							{
								res.render('./resolution/position',{
									title : "Model UN Security Council Sim",
									Country : Country,
									Position : paperVal,
									Delegate: delegate,
									papersOpen : papersOpen,
									startDate : startDate
								});
							}
					});
				});
			});
		});
	}
};

exports.allPositions = function(req,res){
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.session.currentSim;
		var user =  req.session.user;
		var countries = [];
		countryDB.GetAllCountries(function(data){
			positionDB.GetAllPositions(simId, function(positions) {
				if(positions.length === 0)
					{
						res.render('resolution/allPositions', {
							countries: countries,
							positions: false
							});
					}
				else
					{
					for(var i = 0; i < data.length; i++)
					{
						var text = null;
						for(var j = 0; j < positions.length; j++)
						{
							if(data[i].countryName === positions[j].Country)
								{
								text=positions[j].PositionText;
								}
						}
						countries.push({name : data[i].countryName, position: text});
					}
					for(var i = 0; i < countries.length; i++){
						console.log(countries[i]);
					}
					res.render('resolution/allPositions', {
						countries: countries,
						positions: true
						});
					}
				});
		});
	}
};

exports.savePosition = function(req, res) {
	var simId = req.session.currentSim;
	var user = req.session.user;
	var position = req.body.pos;

	memberDB.GetCountrybySimIdUsername(simId, user, function(data) {
		var country = data;
		simDB.PositionDeadline(simId, function(data2){
			var start = new Date(data2);

			var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var startDate = monthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
			var papersOpen = (new Date() >= start);
			console.log(papersOpen);
			var string =(country+" submited their position paper");
			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
			//console.log(string);
			//logs country position paper submited
			actDB.Add(simId, string, now, true,function(a){});

			positionDB.Add(simId, country, position, function(data3) {
				res.render('resolution/position', {
					success: true,
					Country : country,
					Position : position,
					Delegate: true,
					papersOpen : papersOpen,
					startDate : startDate
				});
			});
		});
	});
};

exports.add = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		res.render('resolution/add', {
			title : "Model UN Security Council Sim"
		});
	}
};

exports.addResolution = function(req, res) {
	var name = req.body.ResName;
	var scenario = req.body.scenario;
	var clauses = [];
	
	if(typeof(req.body.clause) === 'string')
		{
			clauses.push(req.body.clause);
		}
	else
		{
			for(var i = 0; i < req.body.clause.length ; i++) {
				clauses.push(req.body.clause[i]);
			}
		}
	
	var string =("The resolution called "+name+" has been added to the simulation");
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var simId = req.session.currentSim;
	actDB.Add(simId, string, now, false,function(a){});
	resDB.CreateResolution(req.session.currentSim,name,scenario,clauses,function(){
		res.render('resolution/add', {success : true});
	});
};


//Opens the page for submiting a change to the amendment table
exports.submit = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.session.currentSim;
		var userName = req.session.user;
		memberDB.GetSimRolebySimIdUsername(simId, userName,function(simrole) {
			var role = simrole;
			var clauseNum;
			var clauseList;
			resDB.GetClausesbySimId(simId, function(clauses) {
				var clauseNum = [];
				var clauseList = [];
	
				for(var j = 0; j < clauses.length;j++){
					clauseNum.push({
						num: clauses[j].ClauseNumber
					});
					console.log(clauses[j].Description);
					clauseList.push(
							clauses[j].Description
					);
				}
				var role = simrole;
				
				var resId = req.url.split('?')[1].split("=")[1];
				
				
				
				if(role === "Delegate") {
					res.render('resolution/submit', {
						options: clauseNum,
						clause: clauseList
					});
				}
				else {
					res.redirect('/resolution/debate?rid=' +resId);
				}
			});
		});
	}
};

//saves wanted clause change to the amendment table
exports.send = function(req, res) {
	var currentDate = new Date();
    var yyyy = currentDate.getFullYear().toString();
    var mm = (currentDate.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = currentDate.getDate().toString();
    var currDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
	
	var status = req.body.button;
	var clauseNum = req.body.Clause_Num;
	var clause = req.body.clause;
	var simId = req.session.currentSim;
	var user = req.session.user;
	
	resDB.getActive(simId, function(resolution) {
		console.log(status);
		if(status ==="Back To Debate"){
			console.log("redirecting");
			res.redirect('/resolution/debate?rid=' +resolution.rowid);
		}
		else{
			var resolutionName = resolution.ResolutionName;
			memberDB.GetCountrybySimIdUsername(simId, user, function(countryName) {
				var country = countryName;
				//console.log(simId+" "+ resolution.rowid+" "+ country+" "+ clauseNum+" "+ clause+" "+ status+" "+ currDate);
				resDB.GetClausesbySimId(simId, function(clauses) {
					var clauseNumbers = [];
					var clauseList = [];

					for(var j = 0; j < clauses.length;j++){
						clauseNumbers.push({
							num: clauses[j].ClauseNumber
						});
						//console.log(clauses[j].Description);
						clauseList.push(
								clauses[j].Description
						);
					}
				
					//logs country has submitted a clause change to vote on
					var string =(country+" has submitted a clause proposal");
					var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
					//console.log(string);
					actDB.Add(simId, string, now, true,function(){
						resDB.addAmendment(simId, resolution.rowid, country, clauseNum, clause, status, currDate, function(b) {
							statsDB.createEntry(simId, resolution.rowid, clauseNum, country, req.session.user, clause, status, currDate, function(a) {
								res.render('resolution/submit', {
										options: clauseNumbers,
										clause: clauseList,
										success: true
								});
							});
						});
					});
				});
			});
		}
	});
};

exports.toggleResolutions = function(req,res){
	var sid = req.session.currentSim;
	var resId = req.url.split('?')[1].split(";")[0].split("=")[1];
	var currentState = req.url.split('?')[1].split(";")[1].split("=")[1];
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var setState = 'inactive';
	if(currentState === 'inactive')
		{
			setState = 'active';
			var message = "Resolution " +resId +" opened for debate by " +req.session.user;
			//logs resolution has been opened
			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
			actDB.Add(req.session.currentSim, message, now, true,function(a){});
			
				resDB.setActivity(sid,resId,setState,function(){
						messageDB.addResolutionMessage(req.session.user, now , message, "", sid, resId, "Activity", function(){
							res.redirect('/resolution/main');
						});
				});
		}
	else
		{
				resDB.setActivity(sid,resId,setState,function(){
					res.redirect('/resolution/main');
			});
		}
};

//opens the viewSubmit page for the chair or moderator
exports.viewAmendments = function(req, res) {
	var resID = req.url.split('?')[1].split("=")[1];
	var simId = req.session.currentSim;
	var string = [];
	resDB.getWaitingAmendmentsbyResId(simId, resID, function(data) {
		for(var j = 0; j<data.length; j++) {
			string.push({
				res_name: data[j].ResolutionName,
				user_country: data[j].UserCountry,
				clause_num: data[j].ClauseNumber,
				clause_des: data[j].Clause,
				user_req: data[j].Status,
				submit_date: data[j].Date,
				amendID: data[j].rowid,
				fate: data[j].Fate
			});
		}
		res.render('resolution/viewSubmits',{
			submitted: string
		});
	});
	
};

exports.amendmentFate = function(req, res) {
	var amendID = req.url.split('?')[1].split("&")[0].split("=")[1];
	var action = req.url.split('?')[1].split("&")[1].split("=")[1];
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var simId = req.session.currentSim;
	if(action === "Delete")
		{
		resDB.getActive(simId, function(data){
			resDB.getAmendment(simId, amendID, function(data2){
				var message = data2.UserCountry +"'s amendment proposal has been denied by the Chair";
				messageDB.addResolutionMessage(req.session.user,now,message,"",simId,data.rowid, "Activity", function(){
					resDB.deleteAmendment(simId, amendID, function(){
						res.redirect('/resolution/viewamendments?rid=' +data.rowid);
					});
				});
			});
		});
		}
	else
		{
			resDB.getActive(simId, function(data){
				if(action ==="Back"){
					console.log("redirecting");
					res.redirect('/resolution/debate?rid=' +data.rowid);
				}
				else{
					resDB.getAmendment(simId, amendID, function(data2){
						if(data2.Status === "Add")
							{
							var message = data2.UserCountry +"'s Ambassador has proposed the " + data2.ClauseNumber+" of " +data2.Clause;
							}
						if(data2.Status === "Edit")
							{
							var message = data2.UserCountry +"'s Ambassador has motioned to " +data2.Status +" Clause " + data2.ClauseNumber +" to " +data2.Clause;
							}
						if(data2.Status === "Remove")
							{
							var message = data2.UserCountry +"'s Ambassador has motioned to " +data2.Status +" Clause " + data2.ClauseNumber;
							}
						messageDB.addResolutionMessage(req.session.user,now,message,"",simId,data.rowid,"Activity", function(){
							voteDB.CreateVote(simId, data.rowid, message, function(){
								messageDB.addResolutionMessage(req.session.user,now,"Vote to Open Debate","",simId,data.rowid,"Activity", function(){
									resDB.setAmendmentFate(simId, data2.rowid, "Voting to Debate", function(){
										resDB.setVotedOn(simId, data2.rowid, function(){
											res.redirect('/resolution/debate?rid=' +data.rowid);
										});
									});
								});
							});
						});
					});
				}
			});
		}
};

exports.debate = function(req,res){
	if (req.session.user === undefined || req.session.password === undefined) 
	{
		res.redirect('/user/login');
	}
	else
	{
		var simId = req.session.currentSim;
		var user =  req.session.user;
		var resId = req.url.split('?')[1].split(";")[0].split("=")[1];
		
		memberDB.GetCountrybySimIdUsername(simId,user,function(data) {
			var Country = data;
				resDB.isVotingToClose(simId, resId, function(closing){
					var closingStatus = false;
					var Final = false;
					if(closing === "closed")
					{
						closingStatus = true;
					}
					
					if(closing === "true")
					{
						if(Country === "China" || Country === "France" || Country === "United Kingdom"|| Country === "United States"|| Country === "Russian Federation")
						{
							Final = true;
						}	
					}
					memberDB.GetSimRolebySimIdUsername(simId, user, function(data4){
						messageDB.getResolutionMessage(simId, resId,function(usernames, messages){
							memberDB.GetUsersbySimID(simId, function(users) {
								resDB.getActiveResolution(simId,resId,function(resIds,resClauses){
									var Debater = (data4 === "Delegate" || data4 === "Chair" || req.session.isMod);
									var Ambassador = (data4 ==="Delegate");
									var Chair = (data4 === "Chair");
									var Mod = req.session.isMod;
									var mod;
									var simChair;
									var ambassadors = [];
									var isModLoggedIn, isChairLoggedIn = false;
									var isUserLoggedIn = false;
									
									for(var j = 0; j < users.length; j++) {
										if(users[j].UserRole === "Mod") {
											isModLoggedIn = (users[j].Username === req.session.user)?true:false;
											mod = users[j].Username;
										}
										
										if(users[j].SimulationRole === "Chair") {
											isChairLoggedIn = (users[j].Username === req.session.user)?true:false;
											simChair = users[j].Username;
										}
										
										if(users[j].SimulationRole === "Delegate") {
											isUserLoggedIn = (users[j].Username === req.session.user)?true:false;
											ambassadors.push({
												username: users[j].Username,
												country: users[j].SimulationCountry,
												isLoggedIn: isUserLoggedIn
											});
										}
										
										if(users[j].Username === req.session.user) isLoggedIn = true;
										
									}
					
											var clauseList = [];
											var rName = resIds.ResolutionName;
											var rScenario = resIds.Scenario;
											
											for(var j=0; j < resClauses.length; j++){
													clauseList.push({
														clauseNumber:resClauses[j][0],
														clauseDescription:resClauses[j][1]
													});
											}
										
									if(messages.length===0){
										res.render('resolution/debate', {
											messages: false,
											Debater: Debater,
											Ambassador: Ambassador,
											Chair: Chair,
											Mod: Mod,
											resID: resId,
											modName: mod,
											chair: simChair,
											ambassadors: ambassadors,
											resName:rName,
											scenario:rScenario,
											clauseList:clauseList,
											voteOpen: false,
											voted: false,
											getRes: false,
											closingStatus: closingStatus,
											Final: Final,
											waitVote: false,
											isModLoggedIn: isModLoggedIn,
											isChairLoggedIn: isChairLoggedIn
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
													messageList.push({username : messages[i].Username, firstname : usernames[j].fname, lastname : usernames[j].lname, message : messages[i].Message, date : messages[i].Date, country : country, messageType : messages[i].MessageType});
													break;
												}
											}
										}
										
										voteDB.getActiveVote(simId, resId, function(voteId){
											var voteOpen = false;
											var voted = false;
											console.log(voteId);
											if(voteId != null)
											{
												resDB.isResolutionDebating(simId, resId, function(debating){
													if(!debating)
														{
														voteDB.HaveAllCountriesVoted(simId, resId, function(waiting){
															if(Chair || Mod)
															{
																var getRes = false; 
																var waitVote = false;
																if(!waiting && Chair)
																{
																	
																	getRes = true;
																}
																if(waiting && Chair)
																{
																	
																	waitVote = true;
																}
																res.render('resolution/debate', {				
																	messages: messageList,
																	Debater: Debater,
																	Ambassador: Ambassador,
																	Chair: Chair,
																	Mod: Mod,
																	resID: resId,
																	modName: mod,
																	chair: simChair,
																	ambassadors: ambassadors,
																	resName:rName,	
																	scenario:rScenario,
																	clauseList:clauseList,
																	voteOpen: false,
																	voted: false,
																	getRes : getRes,
																	closingStatus: closingStatus,
																	Final: Final,
																	waitVote: waitVote,
																	isModLoggedIn: isModLoggedIn,
																	isChairLoggedIn: isChairLoggedIn
														        });
															}
														
														else
															{
																voteOpen = true;
																voteDB.getCountryVote(simId, resId, Country, function(CountriesVote){
																	voted = CountriesVote;
																	res.render('resolution/debate', {				
																		messages: messageList,
																		Debater: Debater,
																		Ambassador: Ambassador,
																		Chair: Chair,
																		Mod: Mod,
																		resID: resId,
																		modName: mod,
																		chair: simChair,
																		ambassadors: ambassadors,
																		resName:rName,	
																		scenario:rScenario,
																		clauseList:clauseList,
																		voteOpen: voteOpen,
																		voted: voted,
																		getRes : false,
																		closingStatus: closingStatus,
																		Final: Final,
																		waitVote: false,
																		isModLoggedIn: isModLoggedIn,
																		isChairLoggedIn: isChairLoggedIn
															        });
																});
																}
														 	});
														}
													else
														{
														var closeAmend = false;
														if(Chair)
															{
																closeAmend=true;
															}
														res.render('resolution/debate', {				
															messages: messageList,
															Debater: Debater,
															Ambassador: Ambassador,
															Chair: Chair,
															Mod: Mod,
															resID: resId,
															modName: mod,
															chair: simChair,
															ambassadors: ambassadors,
															resName:rName,	
															scenario:rScenario,
															clauseList:clauseList,
															voteOpen: voteOpen,
															voted: voted,
															getRes: false,
															closeAmend: closeAmend,
															closingStatus: closingStatus,
															Final: Final,
															waitVote: false,
															isModLoggedIn: isModLoggedIn,
															isChairLoggedIn: isChairLoggedIn
												        });
														}
													});
												}
											else
												{
													res.render('resolution/debate', {				
														messages: messageList,
														Debater: Debater,
														Ambassador: Ambassador,
														Chair: Chair,
														Mod: Mod,
														resID: resId,
														modName: mod,
														chair: simChair,
														ambassadors: ambassadors,
														resName:rName,	
														scenario:rScenario,
														clauseList:clauseList,
														voteOpen: voteOpen,
														voted: voted,
														getRes: false,
														closingStatus: closingStatus,
														Final: Final,
														waitVote: false,
														isModLoggedIn: isModLoggedIn,
														isChairLoggedIn: isChairLoggedIn
											        });
												}
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

exports.getMessages = function(req,res){
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.session.currentSim;
		var user =  req.session.user;
		var resId = req.url.split('?')[1].split(";")[0].split("=")[1];
		messageDB.getResolutionMessage(simId, resId, function(usernames, messages){
			if(messages.length===0){
				res.json({newMessages : false});
			} else {
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
							messageList.push({username : messages[i].Username, firstname : usernames[j].fname, lastname : usernames[j].lname, message : messages[i].Message, date : messages[i].Date, messageType : messages[i].MessageType, country : country})
							break;
						}
					}
				}
	
				res.json({newMessages : messageList});
			}
		});
	}
}

exports.debateStatus = function(req,res){
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else
	{
		var simId = req.session.currentSim;
		var resId = req.url.split('?')[1].split("=")[1];
		
		resDB.DebateStatus(simId, resId, req.session.user, function(variables) {
			res.json({status : variables});
		});
	}
};

exports.vote = function(req,res){
	var decision = req.body['voteBox'];
	var user =  req.session.user;
	var simID = req.session.currentSim;
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	resDB.getActive(req.session.currentSim, function(resID){
		memberDB.GetCountrybySimIdUsername(req.session.currentSim,user,function(country) {
			//logs country vote on clause
			var string =(country+' has voted '+ decision+ ' for clause '+resID.rowid);
			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
			console.log(string);
			actDB.Add(simID, string, now, true,function(a){});
			
			voteDB.setCountryVote(simID, resID.rowid, country, decision, function(){
				var message = country +"'s vote: " +decision;
				messageDB.addResolutionMessage(user,now,message,country,req.session.currentSim,resID.rowid,"Activity", function(){
					res.redirect('/resolution/debate?rid=' +resID.rowid);
				});
			});
		});
	});
};

exports.calculateResults = function(req,res){
	var user =  req.session.user;
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	resDB.getActive(req.session.currentSim, function(resID){
		if(resID.VotingToClose === "false")
		{
			voteDB.getActiveVote(req.session.currentSim, resID.rowid, function(vID){
				resDB.getAmendmentsbyResId(req.session.currentSim, resID.rowid, function(amends){
					var amendID;
					var amendFate;
					var resultWanted;
					var voteMessage = "";
					for(var i = 0; i < amends.length; i++)
						{
							if(amends[i].Fate != "Waiting" && amends[i].Fate != "Failed" && amends[i].Fate != "Passed")
								{
									amendID = amends[i].rowid;
									amendFate = amends[i].Fate;
									amendVotedOn = amends[i].VotedOn;
									amendClauseNum = amends[i].ClauseNumber;
									amendDesc = amends[i].Clause;
									amendStatus = amends[i].Status;
	
									if(amendFate === "Voting to Debate" && amendVotedOn != "true")
									{
										resultWanted = "Debate";
										
									}
									else if(amendFate === "Voting to Pass" || amendVotedOn === "true")
									{
										resultWanted = "Add";
									}
									else
									{
										resultWanted = "Debating";
									}
										
								}
						}
					
						if(resultWanted != "Debating")
							{
							voteDB.getResults(req.session.currentSim, resID.rowid, vID, resultWanted,function(results, resultString){
								var result = results;
								var fate;
								var fateResult;
								
								//messageDB.addResolutionMessage(req.session.user,now,resultString,"",req.session.currentSim,resID.rowid, "Activity", function(){});
								
								if(result)
									{
										if(amendFate === "Voting to Debate")
										{
											fate = "Debating";
											fateResult = "";
											
											voteDB.setVoteVerdict(req.session.currentSim, resID.rowid, fateResult, function(){
												resDB.setAmendmentFate(req.session.currentSim, amendID, fate, function(){
													messageDB.addResolutionMessage(req.session.user,now,"Vote Result: Passed","",req.session.currentSim,resID.rowid, "Activity", function(){
														messageDB.addResolutionMessage(req.session.user,now,"Debate is now open.","",req.session.currentSim,resID.rowid, "Activity", function(){
															res.redirect('/resolution/debate?rid=' +resID.rowid);
														});
													});
												});
											});
											
										}
										else
										{ 
											fate = "Passed";
											fateResult = "Passed";
											
											voteDB.setVoteVerdict(req.session.currentSim, resID.rowid, fateResult, function(){
												resDB.setAmendmentFate(req.session.currentSim, amendID, fate, function(){
													//logs clause has been passed
													var string =('Clause '+resID.rowid+' has been passed');
													var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
													actDB.Add(req.session.currentSim, string, now, false,function(a){});
													resDB.updateClause(req.session.currentSim,resID.rowid, amendClauseNum, amendDesc, amendStatus, function(){
														messageDB.addResolutionMessage(req.session.user,now,"Vote Result: Passed","",req.session.currentSim,resID.rowid, "Activity", function(){
															res.redirect('/resolution/debate?rid=' +resID.rowid);
														});
													});
												});
											});
										}
									}
								else
									{
										fate = "Failed";
										fateResult = "Failed";
										voteDB.setVoteVerdict(req.session.currentSim, resID.rowid, fateResult, function(){
											resDB.setAmendmentFate(req.session.currentSim, amendID, fate, function(){
												//logs clause has failed
												var string =('Clause '+resID.rowid+' has failed');
												var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
												actDB.Add(req.session.currentSim, string, now, false,function(a){});
												messageDB.addResolutionMessage(req.session.user,now,"Vote Result: Failed","",req.session.currentSim,resID.rowid, "Activity", function(){
													res.redirect('/resolution/debate?rid=' +resID.rowid);
												});
											});
										});	
									}
						});
					}
					else
						{
						res.redirect('/resolution/debate?rid=' +resID.rowid);
						}
				});
			});
		}
		else
		{
			voteDB.getActiveVote(req.session.currentSim, resID.rowid, function(vID){
				voteDB.getResults(req.session.currentSim, resID.rowid, vID, "Close" ,function(results){
					var result = results;
					
					if(result)
					{
						resDB.setVotingToClose(req.session.currentSim, resID.rowid, "closed", function(){
							voteDB.setVoteVerdict(req.session.currentSim, resID.rowid, "Passed", function(){
								messageDB.addResolutionMessage(req.session.user,now,"Vote Result: Passed","",req.session.currentSim, resID.rowid, "Activity", function(){
									messageDB.addResolutionMessage(req.session.user,now,"Debate on Resolution to end","",req.session.currentSim, resID.rowid, "Activity", function(){
										resDB.updateResolution(req.session.currentSim, resID.rowid,function(){
											resDB.renumberClauses(req.session.currentSim, resID.rowid,function(){
												res.redirect('/resolution/debate?rid=' +resID.rowid);
											});
										});
									});
								});
							});	
						});
					}
					else
					{
						resDB.setVotingToClose(req.session.currentSim, resID.rowid, "false", function(){
							voteDB.setVoteVerdict(req.session.currentSim, resID.rowid, "Failed", function(){
								messageDB.addResolutionMessage(req.session.user,now,"Vote Result: Failed","",req.session.currentSim, resID.rowid, "Activity", function(){
									messageDB.addResolutionMessage(req.session.user,now,"Debate on Resolution to continue","",req.session.currentSim, resID.rowid, "Activity", function(){
										res.redirect('/resolution/debate?rid=' +resID.rowid);
									});
								});
							});
						});
					}
					
				});
			});
		}
	});
};

exports.sendResolutionMessage = function(req,res){
	var simId = req.session.currentSim;
	var resId = req.url.split('?')[1].split(";")[0].split("=")[1];
	
	var messages = req.body.newMessage;
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var userName = req.session.user;
	
	memberDB.GetCountryBySimIdUsername(simId,userName,function(countryName){
		messageDB.addResolutionMessage(userName,now,messages,countryName,simId,resId,"Message", function(){
			res.redirect('/resolution/debate?rid=' +resId);		
		});
	});
};

exports.closeDebate = function(req,res){
	var simId = req.session.currentSim;
	var resId = req.url.split('?')[1].split("=")[1];
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	
	resDB.DebatingAmendment(simId, resId, function(aID) {
		resDB.setAmendmentFate(simId, aID, "Voting to Pass", function(){
			voteDB.clearCountryVotes(simId, resId, function(){
				messageDB.addResolutionMessage(req.session.user,now,"Vote to Close Debate","",simId, resId, "Activity", function(){
					res.redirect('/resolution/debate?rid=' +resId);
				});	
			});
		});	
	});
};

exports.closeResolution = function(req,res){
	var simId = req.session.currentSim;
	var resId = req.url.split('?')[1].split("=")[1];
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	
	resDB.setVotingToClose(simId, resId, "true", function(){
		voteDB.CreateVote(simId, resId, "Chair motions to close resolution", function(){
			messageDB.addResolutionMessage(req.session.user,now,"Vote to Close Resolution","",simId, resId, "Activity", function(){
				res.redirect('/resolution/debate?rid=' +resId);
			});
		});
	});
};
