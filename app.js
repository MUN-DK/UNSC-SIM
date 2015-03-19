/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var hjs = require('hjs');
//controllers
var user = require('./routes/user_controller');
var country = require('./routes/country_controller');
var simulation = require('./routes/simulation_controller');
var resolution = require('./routes/resolution_controller');
var membership = require('./routes/membership_controller');
var message = require('./routes/message_controller');
var newsfeed = require('./routes/newsfeed_controller');

var userDB = require('./routes/models/user');
var http = require('http');
var path = require('path');

var app = express();

//app.engine('hjs', require('hjs'));
//app.engine('html', require('hogan-express'));

//app.set('view options', {layout: true});
//app.set('layout', 'layouts/main');

// all environments
app.set('port', process.env.PORT || 3333);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
//app.set('view engine', 'html')

app.set('title', 'Model UN Security Council Sim');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(express.cookieParser('secret'));
app.use(express.methodOverride());
app.use(express.session());

app.use(function(req,res,next){
	res.locals.user = req.session.curUser;
	res.locals.username = req.session.user;
	res.locals.sims = req.session.currentSims;
	res.locals.currentSim = req.session.currentSim;
	res.locals.currentSimName = req.session.currentName;
	res.locals.currentSimInfo = req.session.currentSimInfo;
	res.locals.joinSims = req.session.aSims;
	res.locals.partials = {
	    header: 'layouts/mainheader',
	    footer: 'layouts/mainfooter',
	    logheader: 'layouts/loginheader',
	    logfooter: 'layouts/loginfooter',
	    firstheader: 'layouts/firstloginheader'       
	};
  next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

// GET
//user controller
app.get('/', routes.index);
app.get('/user/readme', user.readme);
app.get('/user/profile', user.profile);
app.get('/user/edit', user.edit);
app.get('/user/login', user.login);
app.get('/user/register', user.register);
app.get('/user/logout', user.logout);
app.get('/user/main', user.main);
app.get('/user/changesim', user.changesim);
//country controller
app.get('/country/overview', country.overview);
app.get('/country/selectAmbassador', country.selectAmbassador);
//simulation controller
app.get('/simulation/main', simulation.main);
app.get('/simulation/add', simulation.add);
app.get('/simulation/edit', simulation.edit);
app.get('/simulation/join', simulation.join);
app.get('/simulation/delegates', simulation.delegates);
app.get('/simulation/activity', simulation.activity);
app.get('/simulation/directives', simulation.directives);
app.get('/simulation/information', simulation.information);
app.get('/simulation/countryinformation', simulation.countryInformation);
//resolution controller
app.get('/resolution/allpositions', resolution.allPositions);
app.get('/resolution/main', resolution.main);
app.get('/resolution/position', resolution.position);
app.get('/resolution/add', resolution.add);
app.get('/resolution/submit', resolution.submit);
app.get('/resolution/viewamendments', resolution.viewAmendments);
app.get('/resolution/debate', resolution.debate);
app.get('/resolution/getMessages', resolution.getMessages);
app.get('/resolution/debatestatus', resolution.debateStatus);

//membership controller
app.get('/membership/list', membership.list);
//messages controller
app.get('/message/global', message.global);
app.get('/message/personal', message.personal);
//newsfeed controller
app.get('/newsfeed/view', newsfeed.view);
app.get('/newsfeed/add', newsfeed.add);

//app.get('/forums', session.forums);
//app.get('/message', session.message);

// POST
//user controller
app.post('/user/login', user.loginUser);
app.post('/user/register', user.registerUser);
app.post('/user/edit', user.save);
//simulation controller
app.post('/simulation/add', simulation.addSimulation);
app.post('/simulation/edit', simulation.save);
app.post('/simulation/join', simulation.joinSimulation);
app.post('/simulation/delegates', simulation.saveDelegates);
app.post('/simulation/directives', simulation.saveDirectives);
//message controller
app.post('/message/global', message.sendGlobalMessage);
app.post('/message/personal', message.sendPersonalMessage);
//country controller
app.post('/country/overview', country.sendCountryMessage);
app.post('/country/selectAmbassador', country.ambassador);
//newsfeed controller
app.post('/newsfeed/view', newsfeed.manage);
app.post('/newsfeed/add', newsfeed.save);
//resolution controller
app.post('/resolution/position', resolution.savePosition);
app.post('/resolution/add',resolution.addResolution);
app.post('/resolution/submit',resolution.send);
app.post('/resolution/main',resolution.toggleResolutions);
app.post('/resolution/debate', resolution.sendResolutionMessage);
app.post('/resolution/viewamendments', resolution.amendmentFate);
app.post('/resolution/vote', resolution.vote);
app.post('/resolution/results', resolution.calculateResults);
app.post('/resolution/closedebate', resolution.closeDebate);
app.post('/resolution/closeresolution', resolution.closeResolution);


http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
