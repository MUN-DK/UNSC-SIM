/*
 * GET users listing.
 */

var userDB = require('./adapters/userAdapter');
var memberDB = require('./adapters/membershipAdapter');
var simDB = require('./adapters/simulationAdapter');
var fs = require('fs');

exports.readme = function(req, res) {
	res.render('user/readme');
};

exports.register = function(req, res) {
	res.render('user/register');
};

exports.registerUser = function(req, res) {
	var fname = req.body.first_name;
	var lname = req.body.last_name;
	var dispName = req.body.display_name;
	var email = req.body.email;
	var password = req.body.password;
	var confirmPass = req.body.password_confirmation;

	userDB.UsernameExists(dispName, function(found) {
		// console.log("dispName:" + dispName + "|UsernameExists:" + found);
		if (found) {
			// username already in use
			res.render('user/register', {
				error1 : true
			});
		} else {
			if (password === confirmPass) {
					req.session.user = dispName;
					req.session.password = password;
					req.session.firstname = fname;
					req.session.currentSims = [];
					userDB.Add(dispName, password, fname, lname, email, function(data) {
						memberDB.GetJoinedSimulations(dispName, function(data) {
							
							var currSims = [];

							for ( var d = 0; d < data.length; d++) {
								// if (data[d].EndDate > CurrentDate) {
								currSims.push({
									id : data[d].rowid,
									name : data[d].SimulationName
								});
							}

							memberDB.GetJoinableSimulations(dispName, function(data2) {

								var currentDate = new Date();
								
							    var yyyy = currentDate.getFullYear().toString();                                    
						        var mm = (currentDate.getMonth()+1).toString(); // getMonth() is zero-based         
						        var dd  = currentDate.getDate().toString();             
						                            
						        var currDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); 
								var queryString = [];
								var aSims = [];
								for ( var c = 0; c < data2.length; c++) {
									if(data2[c].RegistrationDeadline >= currDate) {
										aSims.push({
											simID : data2[c].rowid,
											simName : data2[c].SimulationName
										});
									}
								}
								req.session.aSims = aSims;
								req.session.currentSims = currSims;
								req.session.curUser = {firstname: fname};
								res.redirect('user/main');
							});
						});
					});
			} 
			else {
				// passwords don't match
				res.render('user/register', {
					error2 : true
				});
			}
		}
	});
};

exports.login = function(req, res) {

	if (req.session.user == undefined || req.session.password == undefined) {
		res.render('user/login', {
			title : "Model UN Security Council Sim",
			error : false
		});
	} else {
		res.redirect('user/main');
	}
};

exports.loginUser = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	userDB.UsernameExists(username, function(foundUser) {
		if (foundUser) {
			userDB.Authenticate(username, password, function(authenticated) {
				if (authenticated) {
					userDB.GetFName(username, function(userInfo) {
						memberDB.GetJoinedSimulations(username, function(data) {
							
							var currSims = [];

							for ( var d = 0; d < data.length; d++) {
								// if (data[d].EndDate > CurrentDate) {
								currSims.push({
									id : data[d].rowid,
									name : data[d].SimulationName
								});
							}

							memberDB.GetJoinableSimulations(username, function(data2) {

								var currentDate = new Date();
								
							    var yyyy = currentDate.getFullYear().toString();                                    
						        var mm = (currentDate.getMonth()+1).toString(); // getMonth() is zero-based         
						        var dd  = currentDate.getDate().toString();             
						                            
						        var currDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); 
								var queryString = [];
								var aSims = [];
								for ( var c = 0; c < data2.length; c++) {
									if(data2[c].RegistrationDeadline >= currDate) {
										aSims.push({
											simID : data2[c].rowid,
											simName : data2[c].SimulationName
										});
									}
								}

								req.session.aSims = aSims;
								req.session.currentSims = currSims;
								req.session.user = username;
								req.session.password = password;
								//req.session.firstname = userInfo[0];
								userDB.GetRole(username, function(data) {
									var mod = false
									if (data === 'Mod') {
										mod = true;
									}
									req.session.isMod = mod;
									req.session.curUser = {firstname: userInfo[0], mod: mod};
									res.redirect('user/main');
								});
							});
						});
					});
				} else {
					res.render('user/login', {
						error : true
					});
				}
			});
		} else {
			res.render('user/login', {
				error : true
			});
		}
	});

};

exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/user/login');
};

exports.main = function(req, res) {
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
			
			res.render('user/main', {
				title : "Model UN Security Council Sim",
				aSims : aSims
			});
		});
	}
};

exports.changesim = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		var simId = req.url.split('?')[1].split("=")[1];
		req.session.currentSim = simId;
		console.log("current sim: " + simId)
		simDB.Get(simId, function(data) {
			req.session.currentName = data.SimulationName;
			res.redirect('/country/overview');
		});
	}
}

exports.profile = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	} else {
		userDB.GetFLNameEmail(req.session.user, function(data) {
			var exists = fs.existsSync("./public/img/user-icons/"+req.session.user+".png");
			    if (exists) {
			    	var imagePath = "../img/user-icons/"+req.session.user+".png"
			    	res.render('user/profile', {
						userinfo : req.session.user,
						image : imagePath,
						fName : data[0],
						lName : data[1],
						email : data[2]
					});
			    }
			    else {
			    	var imagePath = "../img/noface.jpg"; 
			    	res.render('user/profile', {
						userinfo : req.session.user,
						image : imagePath,
						fName : data[0],
						lName : data[1],
						email : data[2]
					});
			    }
			
		});
	}
};

exports.edit = function(req, res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else {
		userDB.GetFLNameEmail(req.session.user, function(data) {
			var exists = fs.existsSync("./public/img/user-icons/"+req.session.user+".png");
			    if (exists) {
			    	var imagePath = "../img/user-icons/"+req.session.user+".png"
			    	res.render('user/edit', {
						userinfo : req.session.user,
						image : imagePath,
						fName : data[0],
						lName : data[1],
						email : data[2]
					});
			    }
			    else {
			    	var imagePath = "../img/noface.jpg"; 
			    	res.render('user/edit', {
						userinfo : req.session.user,
						image : imagePath,
						fName : data[0],
						lName : data[1],
						email : data[2]
					});
			    }
			
		});
	}
};

exports.save = function(req, res) {
	console.log('starting save');
	var username=req.session.user;
	var fname = req.body.first_name;
	var lname = req.body.last_name;
	var email = req.body.email;
	var newpass = req.body.new_pass;
	var comfirmpass = req.body.comfirm_pass;
	fs.readFile(req.files.image.path,function(err,data){
		if(req.files.image.type.split("/")[0]==="image"){
			var newPath ="./public/img/user-icons/" + req.session.user+".png";
			fs.writeFile(newPath,data,function(err){
				var imagePath = "../img/user-icons/"+req.session.user+".png";
				if(newpass === '' && comfirmpass ===''){
					userDB.Edit(username, fname, lname, email, function(data){
						userDB.GetFLNameEmail(req.session.user, function(data) {
							req.session.curUser.firstname = data[0];
							res.render('user/profile', {
								success : true,
								userinfo : req.session.user,
								image : imagePath,
								fName : data[0],
								lName : data[1],
								email : data[2]
							});
						});
					});
				}
				else if(comfirmpass !== '' && newpass !== ''){
					console.log('there is both passwords');
					if(comfirmpass === newpass){
						console.log('passwords match');
						userDB.EditWithPassword(username,fname, lname, email, newpass, function(data){
							console.log('finished EditWithPassword');
							userDB.GetFLNameEmail(req.session.user, function(data) {
								req.session.curUser.firstname = data[0];
								res.render('user/profile', {
									success : true,
									userinfo : req.session.user,
									image : imagePath,
									fName : data[0],
									lName : data[1],
									email : data[2]
								});
							});
						});
					}
					else{
						userDB.GetFLNameEmail(req.session.user, function(data) {
							res.render('user/edit', {
								userinfo : req.session.user,
								fName : data[0],
								lName : data[1],
								email : data[2],
								error1 : true
							});
						});
					}
				}
				else{
					userDB.GetFLNameEmail(req.session.user, function(data) {
						res.render('user/edit', {
							userinfo : req.session.user,
							fName : data[0],
							lName : data[1],
							email : data[2],
							error2 : true
							
						});
					});
					
				}
			});
		}
		else{
			var exists = fs.existsSync("./public/img/user-icons/"+req.session.user+".png");
		    var imagePath
		    if(exists){
		    	imagePath = "../img/user-icons/"+req.session.user+".png";
		    }
		    else imagePath = "../img/noface.jpg";
			if(newpass === '' && comfirmpass ===''){
				userDB.Edit(username, fname, lname, email, function(data){
					userDB.GetFLNameEmail(req.session.user, function(data) {
						req.session.curUser.firstname = data[0];
						res.render('user/profile', {
							success : true,
							userinfo : req.session.user,
							image : imagePath,
							fName : data[0],
							lName : data[1],
							email : data[2]
						});
					});
				});
			}
			else if(comfirmpass !== '' && newpass !== ''){
				console.log('there is both passwords');
				if(comfirmpass === newpass){
					console.log('passwords match');
					userDB.EditWithPassword(username,fname, lname, email, newpass, function(data){
						console.log('finished EditWithPassword');
						userDB.GetFLNameEmail(req.session.user, function(data) {
							req.session.curUser.firstname = data[0];
							res.render('user/profile', {
								success : true,
								userinfo : req.session.user,
								image : imagePath,
								fName : data[0],
								lName : data[1],
								email : data[2]
							});
						});
					});
				}
				else{
					console.log('pass do not match');
					userDB.GetFLNameEmail(req.session.user, function(data) {
						res.render('user/edit', {
							userinfo : req.session.user,
							fName : data[0],
							lName : data[1],
							email : data[2],
							error1 : true
						});
					});
				}
			}
			else{
				console.log('a password is missing');
				userDB.GetFLNameEmail(req.session.user, function(data) {
					res.render('user/edit', {
						userinfo : req.session.user,
						fName : data[0],
						lName : data[1],
						email : data[2],
						error2 : true
						
					});
				});
				
			}
		}

	});

};
