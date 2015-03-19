var fs = require("fs");
var file = "./routes/databases/Database.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();

var singleton = function() {
	var db = new sqlite3.Database(file);
	return db;
};

singleton.instance = null;
 
singleton.getInstance = function(){
	//if db connection isn't yet opened
    if(this.instance === null){

    	//create single database connection if none exists already
        this.instance = new singleton();

		//initialize if the file doesn't exist
		if(!exists) {
			initDb(this.instance);
		}
    }

    //return database instance
    return this.instance;
};

//creates tables, etc for db initialization
function initDb(db) {
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS Users (username TEXT, password TEXT, fname TEXT, lname TEXT, email TEXT, role TEXT)", bootstrapUsers); //create default moderator
		db.run("CREATE TABLE IF NOT EXISTS Simulations (SimulationName TEXT, ChairName TEXT, CreatedBy TEXT, RegistrationDeadline TEXT, StartDate TEXT, EndDate TEXT,AutoCountrySort TEXT)", bootstrapSimulations);
		db.run("CREATE TABLE IF NOT EXISTS Country (countryName TEXT)", insertCountries);
		db.run("CREATE TABLE IF NOT EXISTS Memberships (SimulationId INTEGER, SimulationName TEXT, Username TEXT, UserRole TEXT, SimulationCountry TEXT, SimulationRole TEXT)", bootstrapMemberships);
		db.run("CREATE TABLE IF NOT EXISTS Resolutions (SimulationId INTEGER, ResolutionName TEXT, Scenario TEXT, State TEXT, VotingToClose TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS Clauses (ResolutionId INTEGER, SimulationId INTEGER, ClauseNumber TEXT, Description TEXT, OriginalDescription TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS Amendment (SimulationId INTEGER, ResolutionId TEXT, UserCountry TEXT, ClauseNumber TEXT, Clause TEXT, Status TEXT, Date TEXT, Fate TEXT, VotedOn TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS Position (SimulationId TEXT, Country TEXT, PositionText TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS GlobalMessages (Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS ResolutionMessages (Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT, ResolutionId TEXT, MessageType TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS CountryMessages (Username TEXT, Date TEXT, Message TEXT, CountryName TEXT, SimulationId TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS Activity (SimulationId TEXT, Description TEXT, Date TEXT, Visible BOOLEAN)");
		db.run("CREATE TABLE IF NOT EXISTS Directive (SimId TEXT, Direc TEXT, country TEXT, ModName TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS CountryVote (VoteId TEXT, Country TEXT, ResId TEXT, Vote TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS Vote (SimId TEXT, ResId TEXT, Description TEXT, Verdict TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS PersonalMessages (FromUser TEXT, ToUser TEXT, Date TEXT, Message TEXT, SimulationId TEXT, AllowCountryMembersToView TEXT, IsNewMessage TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS Newsfeeds (SimulationId TEXT, Title TEXT, Description TEXT, Type TEXT)");
		db.run("CREATE TABLE IF NOT EXISTS SelectAmbassador (SimId TEXT, country TEXT, user TEXT, votes INTEGER, voted BOOLEAN)");
		db.run("CREATE TABLE IF NOT EXISTS AmendmentStats(SimId INTEGER, ResId TEXT, ClauseNum INTEGER, Country TEXT, Username TEXT, Amendment TEXT, Status TEXT, Date Text, Result TEXT)");
	});

	//bootstrap a user set to database for testing purposes
	function bootstrapUsers() {
		var stmt = db.prepare('INSERT INTO Users VALUES(?,?,?,?,?,?)');
		stmt.run(["mod", "mod", "Moddy", "McModerson", "mod@mod.com", "Mod" ]);
		stmt.run(["user1", "123", "Lesley", "Chard", "test@test.com", "User" ]);
		stmt.run(["user2", "123", "Colin", "Withers", "test@test.com", "User" ]);
		stmt.run(["user3", "123", "Jon", "Wall", "test@test.com", "User" ]);
		stmt.run(["user4", "123", "Jason", "Bater", "test@test.com", "User" ]);
		stmt.run(["user5", "123", "Dongkang", "Li", "test@test.com", "User" ]);
		stmt.run(["user6", "123", "Adrian", "Fiech", "test@test.com", "User" ]);
		stmt.run(["user7", "123", "Tim", "Oram", "test@test.com", "User" ]);
		stmt.run(["user8", "123", "Justin", "Ryan", "test@test.com", "User" ]);
		stmt.run(["user9", "123", "Terri-Lynn", "Rimmer", "test@test.com", "User" ]);
		stmt.run(["user10", "123", "Whymarrh", "Whitby", "test@test.com", "User" ]);
		stmt.run(["user11", "123", "Ryan", "Murphy", "test@test.com", "User" ]);
		stmt.run(["user12", "123", "Andrew", "Caines", "test@test.com", "User" ]);
		stmt.run(["user13", "123", "Tyler", "Stacey", "test@test.com", "User" ]);
		stmt.run(["user14", "123", "Richard", "Bajona", "test@test.com", "User" ]);
		stmt.run(["user15", "123", "Gannon", "Lawlor", "test@test.com", "User" ]);
		stmt.run(["user16", "123", "Mark", "Stacey", "test@test.com", "User" ]);
		stmt.run(["user17", "123", "Jeremy", "Miller", "test@test.com", "User" ]);
	}

	//bootstrap a user set to database for testing purposes
	function bootstrapSimulations() {
		var stmt = db.prepare('INSERT INTO Simulations(SimulationName,RegistrationDeadline,StartDate,EndDate,CreatedBy) VALUES(?,?,?,?,?)');
		stmt.run(["Test Simulation 1", "2014-04-01", "2014-04-02", "2014-05-01", "mod" ]);
		stmt.run(["Test Simulation 2", "2014-04-01", "2014-04-02", "2014-05-01", "mod" ]);
		stmt.run(["Test Simulation 3", "2014-04-01", "2014-04-02", "2014-05-01", "mod" ]);
	}

	function bootstrapMemberships() {
		var stmt = db.prepare('INSERT INTO Memberships(SimulationId,SimulationName,Username,UserRole,SimulationRole) VALUES(?,?,?,?,?)');
		stmt.run(["1", "Test Simulation 1", "mod", "Mod", "Member" ]);
		stmt.run(["2", "Test Simulation 2", "mod", "Mod", "Member" ]);
		stmt.run(["3", "Test Simulation 3", "mod", "Mod", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user1", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user2", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user3", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user4", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user5", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user6", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user7", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user8", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user9", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user10", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user11", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user12", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user13", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user14", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user15", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user16", "User", "Member" ]);
		stmt.run(["1", "Test Simulation 1", "user17", "User", "Member" ]);
	}

	//insert current elected countries into database
	function insertCountries() {
		var countryList = [ "China", "France", "Russian Federation",
		"United Kingdom", "United States", "Argentina", "Australia", "Chad",
		"Chile", "Jordan", "Lithuania", "Luxembourg", "Nigeria",
		"Republic of Korea", "Rwanda" ];

		var stmt = db.prepare("INSERT INTO Country VALUES(?)");
		for ( var i = 0; i < countryList.length; i++) {
			stmt.run(countryList[i]);
		}
	}
}
 
module.exports = singleton.getInstance();
