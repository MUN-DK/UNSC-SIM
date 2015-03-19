var fs = require("fs");
var newsDB = require('./adapters/newsfeedAdapter');
var memberDB = require('./adapters/membershipAdapter');

exports.view = function(req,res) {
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		
		var simId = req.session.currentSim;
		var user =  req.session.user;
		
		memberDB.GetSimRolebySimIdUsername(simId, user, function(role){
			var ChairOrMod = (role === "Chair" || req.session.isMod);
			var Mod = req.session.isMod;
			newsDB.GetAllNewsfeed(simId, function(data){
				var feeds = [];
				for(var j = 0; j<data.length; j++) {
					var url = false;
					
					if(data[j].Type === "URL")
					{
						url = true;
					}
					feeds.push({
						newsTitle: data[j].Title,
						text: data[j].Description,
						type: data[j].Type,
						URL: url,
						newsID: data[j].rowid
					});
				}
				res.render('newsfeed/view', {
					newsfeeds: feeds,
					ChairOrMod : ChairOrMod,
					Mod: Mod
				});
			});	
		});
	}
}

exports.add = function(req,res) {
	var newsID = req.url.split('?')[1].split("&")[0].split("=")[1];
	if (req.session.user === undefined || req.session.password === undefined) {
		res.redirect('/user/login');
	}
	else{
		
		if(newsID != "new")
		{
			var selected = true;
			newsDB.GetNewsfeed(newsID, req.session.currentSim, function(data){
				var urlSelect = false;
				var contentSelect = false;
				if(data.Type === "URL")
				{
					urlSelect = true;
				}
				else
				{
					contentSelect = true;
				}
				
				res.render('newsfeed/add', {
					newsTitle: data.Title,
					text: data.Description,
					type: data.Type,
					selected: selected,
					urlSelect: urlSelect,
					contentSelect: contentSelect
				});
			});
		}
		else
		{
		res.render('newsfeed/add');
		}
	}
}

exports.save = function(req,res) {
	var newsID = req.url.split('?')[1].split("&")[0].split("=")[1];
	var simID = req.session.currentSim;
	var title = req.body.newsTitle;
	var text = req.body.description;
	var type = req.body.Type;
	
	if(newsID === "new")
	{
		newsDB.Create(simID, title, text, type, function(data){
			res.render('newsfeed/add', {
				addSuccess: true,
				Complete: true
			});
		});	
	}
	else
	{
		newsDB.Update(newsID, simID, title, text, type, function(data){
			res.render('newsfeed/add', {
				editSuccess: true,
				Complete: true
			});
		});	
	}
}

exports.manage = function(req,res) {
	var newsID = req.url.split('?')[1].split("&")[0].split("=")[1];
	var action = req.url.split('?')[1].split("&")[1].split("=")[1];
	var simID = req.session.currentSim;
	
	if(action != "Remove")
	{
		res.redirect('newsfeed/add?newsID=' +newsID);
	}
	else
	{
		newsDB.Delete(newsID, simID, function(){
			res.redirect('newsfeed/view');
		});
	}
}