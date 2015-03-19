/**
 * New node file
 */
var fs = require("fs");
var userDB = require('./adapters/userAdapter');
var simDB = require('./adapters/simulationAdapter');
var memberDB = require('./adapters/membershipAdapter');
var countryDB = require('./adapters/countryAdapter');
var actDB = require('./adapters/activityAdapter');
var direcDB = require('./adapters/directiveAdapter');
var resDB = require('./adapters/resolutionAdapter');
var messageDB = require('./adapters/messageAdapter');
var positionDB = require('./adapters/positionAdapter');
var voteDB = require('./adapters/voteAdapter');
var statsDB = require('./adapters/amendmentStatsAdapter');
/*
 * Opens the simulation room
 */
exports.main = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		res.render('simulation/main', {
			title : "Model UN Security Council Sim"
		});
	}
};

/*
 * Creates a simulation
 */
exports.add = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		res.render('simulation/add', {
			title : "Model UN Security Council Sim"
		});
	}
};

exports.join = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		memberDB.GetJoinableSimulations(req.session.user, function(
				data) {
	
			var currentDate = new Date();
			var yyyy = currentDate.getFullYear().toString();
	        var mm = (currentDate.getMonth()+1).toString(); // getMonth() is zero-based         
	        var dd  = currentDate.getDate().toString();
	                            
	        var currDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
			var queryString = [];
			var aSims = [];
			for ( var c = 0; c < data.length; c++) {
				if(data[c].RegistrationDeadline >= currDate) {
					aSims.push({
						simID : data[c].rowid,
						simName : data[c].SimulationName
					});
				}
			}
	
			
			res.render('simulation/join', {
				title : "Model UN Security Council Sim",
				availableSimulations : aSims
			});
		});
	}
};


exports.joinSimulation = function(req, res){
	var simID = req.url.split('?')[1].split("=")[1];
	var username = req.session.user;
	var currSims = req.session.currentSims;
	simDB.Get(simID, function(data) {
		var string =(username + " has joined the simulation");
		var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		//console.log(string);
		//logs user joining the simulation
		actDB.Add(simID, string, now, true,function(a){});
		memberDB.Create(simID, data.SimulationName, username, "User", function(){
			currSims.push({
				id : simID,
				name : data.SimulationName
			});

			var aSims = req.session.aSims;

			for(var i = 0; i < aSims.length; i++) {
				if(aSims[i]['simID'] === simID) {
					aSims.splice(i, 1);
				}
			}

			req.session.currentSims = currSims;
			req.session.currentSim = simID;
			req.session.currentName = data.SimulationName;
			req.session.aSims = aSims;
			res.redirect('country/overview');
		});
	});
};
/*
 * Registers a simulation
 */
exports.addSimulation = function(req, res) {
	var name = req.body.session_name;
	var startingDate = req.body.start_date;
	var endingDate = req.body.end_date;
	var regDate = req.body.reg_date;
	// checks if ending date come before starting date
	if (endingDate <= startingDate || endingDate <= regDate) {
		res.render('simulation/add', {
			title : "Model UN Security Council Sim",
			error1 : true
		});
	} else if (startingDate < regDate || endingDate <= regDate) {
		res.render('simulation/add', {
			title : "Model UN Security Council Sim",
			error2 : true
		});
	} else {
		simDB.Create(name, regDate, startingDate, endingDate, req.session.user,
			function(data) {

			var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
				//logs simulation was created
				actDB.Add(data, 'Simulation Was Created', now, false, function(a){
					console.log("simID : " + data +"simName :" +name);
					req.session.currentSims.push({id : data, name : name});
					res.render('simulation/add', {createSuccess : {simID : data}});
				});
			});
	}
};

exports.edit = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.url.split('?')[1].split("=")[1];
		var delegateSuccess = req.session.delegateSuccess;
		req.session.delegateSuccess = false;
		simDB.Get(simId, function(data) {
			countryDB.GetAllCountries(function(countriesArr){
				memberDB.GetUsernamesCountrybySimID(simId, function(data2){
					var simMembers = [];
					for (var j = 0 ; j < data2.length; j++) {
						if(data.ChairName !== data2[j].Username) {
							simMembers.push({
								username: data2[j].Username,
								userCountry: data2[j].SimulationCountry
							});
						}
					}
					var Countries = [];
					for(var k=0; k<countriesArr.length; k++){
						Countries.push({countryName : countriesArr[k].countryName});
					}
					res.render('simulation/edit', {
						simID: simId,
						simName : data.SimulationName,
						startDate : data.StartDate,
						endDate : data.EndDate,
						regDate : data.RegistrationDeadline,
						simChair: data.ChairName,
						list: simMembers,
						delegateSuccess : delegateSuccess,
						Countries : Countries
					});
				});
			});	
		});
	}
};

exports.save = function(req, res) {
	var simId = req.url.split('?')[1].split("=")[1];
	var name = req.body.session_name;
	var startingDate = req.body.start_date;
	var endingDate = req.body.end_date;
	var regDate = req.body.reg_date;
	var chair = req.body.sim_chair;
	var country_sort = req.body.country_sort;
	var manual_sort_data;
	if(country_sort === "Instant Auto Sort"){
		memberDB.CountryAutoSort(simId,function(){});
	}
	else if(country_sort === "Manual Sort"){
		var man_sort_data = req.body.manual_sort_data;
		manual_sort_data = JSON.parse(man_sort_data).toString();
		console.log("manual_sort_data 1: " + manual_sort_data + " length:"+ manual_sort_data.length);
		if(manual_sort_data.length > 2){
			var manArr1 =manual_sort_data.substring(1,(manual_sort_data.length -1));
//			console.log("man:" + manArr1);
			var manArr =manArr1.split(',');
//			console.log(manArr);
			var sort_data = [];
			for(var i = 0;i<manArr.length;i++){
				var user_country = manArr[i].substring(2,manArr[i].length-1);
				i++;
				var country_country = manArr[i].substring(1,manArr[i].length-2);
				sort_data.push([user_country,country_country]);
			}
//			console.log("arr:" + sort_data);
	
			memberDB.SetManualUserCountry(simId,sort_data,function(){});
		}
	}
	// checks if ending date come before starting date
	if (endingDate <= startingDate || endingDate <= regDate) {
		simDB.Get(simId, function(data) {
			memberDB.GetUsernamesbySimID(simId, function(data3){
				countryDB.GetAllCountries(function(countriesArr){
					memberDB.GetUsernamesCountrybySimID(simId, function(data3){
						var simMembers = [];
						for (var j = 0 ; j < data3.length; j++) {
							if(data.ChairName !== data3[j].Username) {
								simMembers.push({
									username: data3[j].Username,
									userCountry: data3[j].SimulationCountry
								});
							}
						}
						var Countries = [];
						for(var k=0; k<countriesArr.length; k++){
							Countries.push({countryName : countriesArr[k].countryName});
						}
						res.render('simulation/edit', {
							title : "Model UN Security Council Sim",
							error1 : true,
							simID: simId,
							simName : data.SimulationName,
							startDate : data.StartDate,
							endDate : data.EndDate,
							regDate : data.RegistrationDeadline,
							simChair: data.ChairName,
							list: simMembers,
							Countries : Countries
						});
					});
				});
			});
		});
	}
	else if (startingDate < regDate || endingDate <= regDate) {
		simDB.Get(simId, function(data) {
			memberDB.GetUsernamesbySimID(simId, function(data2){
				countryDB.GetAllCountries(function(countriesArr){
					memberDB.GetUsernamesCountrybySimID(simId, function(data3){
						var simMembers = [];
						for (var j = 0 ; j < data3.length; j++) {
							if(data.ChairName !== data3[j].Username) {
								simMembers.push({
									username: data3[j].Username,
									userCountry: data3[j].SimulationCountry
								});
							}
						}
						var Countries = [];
						for(var k=0; k<countriesArr.length; k++){
							Countries.push({countryName : countriesArr[k].countryName});
						}
						res.render('simulation/edit', {
							title : "Model UN Security Council Sim",
							error2 : true,
							simID: simId,
							simName : data.SimulationName,
							startDate : data.StartDate,
							endDate : data.EndDate,
							regDate : data.RegistrationDeadline,
							simChair: data.ChairName,
							list: simMembers,
							Countries : Countries
						});
					});
				});
			});
		});
	}
	else {
		simDB.Get(simId,function(sim){
			countryDB.GetAllCountries(function(countriesArr){
				memberDB.GetUsernamesCountrybySimID(simId, function(data2){
					var simMembers = [];
					for (var j = 0 ; j < data2.length; j++) {
						if(sim.ChairName !== data2[j].Username) {
							simMembers.push({
								username: data2[j].Username,
								userCountry: data2[j].SimulationCountry
							});
						}
					}
					var Countries = [];
					for(var k=0; k<countriesArr.length; k++){
						Countries.push({countryName : countriesArr[k].countryName});
					}
					if (chair !== sim.ChairName && chair !== ""){
						var string =(chair+" is now chair of simulation");
						var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
						//console.log(string);
						//logs simulation chair delaration
						actDB.Add(simId, string, now, false,function(a){});
					}
		
					simDB.Edit(simId, name, chair, regDate, startingDate, endingDate, function(data) {
						memberDB.SetSimRole(simId, chair, "Chair", function(data2) {
							var curSims = req.session.currentSims;
							for(var i = 0; i < curSims.length; i++) {
								if(curSims[i].id === simId) {
									curSims[i].name = name;
									break;
								}
							}
							console.log(curSims);
			
							memberDB.GetUsernamesbySimID(simId, function(data3){
								req.session.currentName = name;
								req.session.currentSims = curSims;
			
								res.render('simulation/edit', {
									success : true,
									simID: simId,
									simName : name,
									startDate : startingDate,
									endDate : endingDate,
									regDate : regDate,
									simChair: chair,
									list: simMembers,
									Countries : Countries
								});
							});
						});
					});
				});
			});
		});
	}
};

// Opens the activity log page
exports.activity = function(req,res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var mod = req.session.isMod;
		var user = req.session.user;
		var view = false;
		var simId = req.session.currentSim;
		//check if user is mod or chair
		memberDB.GetSimRolebySimIdUsername(simId,user, function(data) {
			if(mod ===true || data ==='Chair'){
				view = true;
			}
			actDB.Get(simId, view, function(activity) {
				console.log(view);
				var string =[];
				for(var j = 0; j < activity.length ;j++) {
					string.push({
						description: activity[j].Description,
						date: activity[j].Date
					});
				}
				
				res.render('simulation/activity',{
					User: mod,
					history: string
				});
			});
		});
	}
};

exports.delegates = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.url.split('?')[1].split("=")[1];
		countryDB.GetAllCountries(function(data) {
			memberDB.GetUsersbySimID(req.session.currentSim, function(users) {
				var countries = [];
				for(var i = 0; i < data.length; i++) {
					var members = [];
					var delegate = [];
					for(var j = 0; j < users.length; j++) {
						if(users[j].SimulationCountry === data[i].countryName) {
							if(users[j].SimulationRole === "Delegate") {
								delegate.push({ username : users[j].Username });
							} else {
								members.push({ username : users[j].Username });
							}
						}
					}
					var group = i % 3;
	
					countries.push({country : data[i].countryName, users : members, delegate : delegate, group : group});
				}
				res.render('simulation/delegates', { countries : countries});
			});
		});
	}
};

exports.saveDelegates = function(req,res){
	var simId = req.url.split('?')[1].split("=")[1];
	countryDB.GetAllCountries(function(countries) {
		var delegates = [];
		for(var i = 0; i < countries.length; i++) {
			var delVal = req.body[countries[i].countryName];
			if(delVal !== '') { 
				delegates.push(delVal);
				var string =(delVal+" was declared "+countries[i].countryName+"'s ambassador");
				var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
				//console.log(string);
				//logs country ambassador delaration
				actDB.Add(simId, string, now, false,function(){});
			}
		}
		if(delegates.length<=0){
			console.log("No delegates changed");
			res.redirect('/simulation/edit?id='+simId);
		}
		else{
			memberDB.SetDelegates(simId, delegates, function(data){
				req.session.delegateSuccess = true;
				res.redirect('/simulation/edit?id='+simId);
			});
		}
	});
};

exports.directives = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		countryDB.GetAllCountries(function(data) {
			var country = [];
			for(var i=0;i<data.length;i++){
				country.push({country:data[i].countryName});
			}
			direcDB.Get(req.session.currentSim,function(directives){
				res.render('simulation/directives', {countries: country, directives : directives});
			});
		});
	}
};

exports.saveDirectives = function(req, res){
	var simId = req.url.split('?')[1].split("=")[1];
	var c = req.body.country;
	var d = req.body.directive;
	var name = req.session.user;
	req.session.success = true;
	//logs country directive was add/modified
	var string =(c+"'s directive has been added/modified");
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	console.log(string);
	actDB.Add(req.session.currentSim, string, now, true,function(a){});
	
	direcDB.Add(simId,d,c,name,function(data){
		countryDB.GetAllCountries(function(data) {
			var country = [];
			for(var i=0;i<data.length;i++){
				country.push({country:data[i].countryName});
			}
			direcDB.Get(req.session.currentSim,function(directives){
				res.render('simulation/directives', {
					countries: country,
					directives : directives,
					success : true
				});
			});
		
		});
	});
	
};


exports.information = function(req, res){
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
					
					if(resClauses[j].Description !== "")
						{
							clauseList.push({
								clauseNumber:resClauses[j].ClauseNumber,
								clauseDescription:resClauses[j].Description
								
							});
						}
				}
			}
			resoArr.push({
				active:rState,
				enterRoom: false,
				resName:rName,
				scenario:rScenario,
				clauseList:clauseList,
				resoId:resIds[i]
			});
		}
		
		simDB.Get(req.session.currentSim, function(simInfo){
			
			var info = [];
			info.push({
				simName: simInfo.SimulationName,
				creator: simInfo.CreatedBy,
				regDate: simInfo.RegistrationDeadline,
				startDate: simInfo.StartDate,
				endDate: simInfo.EndDate
			});
			
			memberDB.GetUserCount(req.session.currentSim, function(userCount){
				voteDB.GetTotalVoteCount(req.session.currentSim, function(voteCount){
					var stats = [];
					
						statsDB.getAmendments(req.session.currentSim,function(stat){
							//console.log("stat length: "+stat.length);
							for(var j=0; j<resIds.length;j++){
								var count = 0;
								for(var k=0; k< stat.length ;k++){
									var aResId = resIds[j].toString();
									//console.log("comparing "+aResId+" "+stat[k].ResId);
									if(aResId===stat[k].ResId){
										//console.log("count up");
										count++;
									}
								}
								stats.push({resID: resIds[j], stat: count});
							}
						
						res.render('simulation/information',{
							Resolutions: resoArr,
							Simulation: info,
							userCount: userCount,
							voteCount: voteCount,
							amendmentCount: stats
						
						});
					});
				});
			});
		});
	});
};

exports.countryInformation = function(req, res){
	countryDB.GetAllCountries(function(country) {
		var countries = [];
		var countryList=[];
		var messageList = [];
		var userList = [];
		for(var a=0; a<country.length; a++){
			messageList[a] = [];
			userList[a] = [];
		}
		
//all Countries
		for(var i=0;i<country.length;i++){
			countryList.push(country[i].countryName);
			countries.push({country:country[i].countryName, id:i});
		}
//all Messages
		messageDB.getAllCountryMessage(req.session.currentSim, function(usernames, messages){
			console.log("message length: "+ messages.length);
			console.log("user length: "+usernames.length);
			
			var messageList = [];
			for(var i = 0; i < messages.length; i++) {
				for(var j = 0; j < usernames.length; j++) {
					if(messages[i].Username === usernames[j].username) {
						var countryName;
						if(messages[i].CountryName === '') {
							countryName = false;
						} else {
							countryName = messages[i].CountryName;
						}
						messageList.push({username : messages[i].Username, firstname : usernames[j].fname, lastname : usernames[j].lname, message : messages[i].Message, date : messages[i].Date, country : countryName});
						break;
					}
				}
			}
	
//all Position Papers
			positionDB.GetAllPositions(req.session.currentSim, function(pospapers){
				var positions =[];
				for(var j=0; j<country.length; j++){
					var pushed = false;
					for(var k=0; k<pospapers.length; k++){
						//console.log(countryList[j].countryName +' '+ pospapers[k].Country);
						if(country[j].countryName === pospapers[k].Country){
							//console.log(pospapers[k].PositionText);
							positions.push(pospapers[k].PositionText);
							pushed = true;
						}
					}
					if(pushed === false){
						positions.push("");
					}
				}
//all Directives
				direcDB.Get(req.session.currentSim, function(directive){
					var directives =[];
					console.log("directives length: "+directive.length);
					for(var j=0; j<country.length; j++){
						var pushed = false;
						for(var k=0; k<directive.length; k++){
							//console.log(countryList[j].countryName +' '+ pospapers[k].Country);
							if(country[j].countryName === directive[k].country){
								console.log(directive[k].Direc);
								directives.push(directive[k].Direc);
								pushed = true;
							}
						}
						if(pushed === false){
							//console.log("notpushed");
							directives.push("");
						}
					}
					
					
//stats				
					resDB.getFullResolutions(req.session.currentSim,function(resClauses, resIds){
						statsDB.countAmendments(req.session.currentSim,function(data){
							var statsList= [];
							console.log("countryList Length: "+countryList.length);
							console.log('resIds length: '+ resIds.length);
							for( var k = 0; k<resIds.length; k++){
								for(var i = 0; i<countryList.length;i++){
									for(var j=0; j<data.length; j++){
										var aResId = resIds[k].toString();
										if(data[j].Country === countryList[i] && data[j].ResId === aResId ){
											console.log("working");
											statsList.push({resId: resIds[k], country:data[j].Country, stat:data[j].Count});
										}
										else{
											statsList.push({resId: resIds[k], country:countryList[i], stat:0});
										}
									}
								}
							}
						
							console.log("positions:" + positions);
							res.render('simulation/countryinformation', {
								countryList: countries,
								allMessages: messageList,
								allPositions: positions,
								allDirectives: directives,
								allStats: statsList
							});
						});
					});
				});
			});
		});
	});
};
