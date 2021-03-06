//NPM Modules
var fs = require('fs');
var request = require('request');
var twitter = require('twitter');
var spotify = require('spotify');
var inquirer = require('inquirer');
var moment = require('moment');


//local file
var keys = require('./keys.js');
var client = new twitter(keys.twitterKeys);

//Parseing the arguments
if(process.argv.length <= 2){
	//console.log("Please let me know what to do \n");
	//if no parameter is passed in
	inquirer.prompt([
	{
		type: "list",
		name: "action",
		message: "What do you want to do today?",
		choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"]
	}
	// After the prompt, store the user's response in a variable called location.
	]).then(function(action){
	console.log('action: '+ action.action)
	selectAction(action.action,false);
	});//inquirer Prompt

} else {
	//If enough parameter have 
	var action = process.argv[2];
	process.argv.splice(0,3);
	var list = process.argv;
	selectAction(action,list);
}


//*************************************
//Depending on action select function
//*************************************
function selectAction(action, list){
	//console.log(action);
	switch (action){
		case "my-tweets":
			myTweet();
			break;
		case "spotify-this-song":
			createSongStr(list);
			break;
		case "movie-this":
			createMovieStr(list);
			break;
		case "do-what-it-says":
			doWhatItSays('random.txt');
			break;
		default:
			console.log("Wrong command!! Try again");
			break;
	}//ending Switch

} //end Select Action 


//Tweeter Function 
function myTweet(){
	
	var params = { limit : 20 }
	
	//Gets 
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		//client.get('search/tweets`', params, function(error, tweets, response) {
  		var logStr = "Last 20 Tweets \n";

  	if (!error) {
  		for(var i=0; i < tweets.length; i++){
    		//console.log("Tweet "+ (i+1)+" : " + JSON.stringify(tweets[i].text,null,2));
    		logStr=logStr+"Tweet "+ (i+1)+" : " + JSON.stringify(tweets[i].text,null,2);
    		//console.log("It was created on "+ JSON.stringify(tweets[i].created_at));
    		var tweetDate=new Date(tweets[i].created_at).toISOString();
    		//console.log("\t\tIt was created on "+ moment(tweetDate).format('MM DD YYYY'));
    		logStr = logStr+"\n\t\tIt was created on "+ moment(tweetDate).format('MM DD YYYY')+"\n";
		}
  	} else{
  		console.log(error)
  	}
  	// logStr += "____________________________________________________________________________\n";
  	// 	logStr = moment().format('MM/DD/YYYY HH:MM')
  	// 			 + "\n____________________________________________________________________________\n"
  	// 			 + logStr+"\n";

		writeLogTxt(logStr);

});
}


//create a song query

function createSongStr(sList){
//console.log("create song"+ sList)
	if(!sList){
		//if they did not send us song
		//Prompt for a song and the call the spotifyfuctio
		//console.log("list is null")
		inquirer.prompt([
		{
			type: "input",
			name: "song",
			message: "Please enter the song"
		}
		// After the prompt, store the user's response in a variable called location.
		]).then(function(user){
		//console.log('action: '+ action.action)
			sList = user.song.split(" ");
			sList = sList.join("+")
			//console.log(sList);
			spotifyThisSong(sList);
		});//inquirer prompt
	}
	else {
		sList = sList.join("+")
		spotifyThisSong(sList);
		//console.log("From the terminal:" + sList);
	}

}


//Spotify Function
function spotifyThisSong(songStr){

	var logStr = "";
	//console.log(songStr);
	if(!songStr){
		songStr="the+sign";
		//console.log("You did not enter any song. So it is The Sign");
		logStr = logStr+"You did not enter any song. So it is The Sign\n"
	}
	songStr = songStr.toLowerCase();
	var song = 'https://api.spotify.com/v1/search?query='+songStr+'&offset=20&limit=10&type=track';

	spotify.get( song ,function(err,data){
	    if ( err ) {
	        console.log('Error occurred: ' + err);
	        return;
	    }
			//console.log(JSON.stringify(data, null, 2));
			//console.log(JSON.stringify(data.artists.name, null,2));

		for(var i = 0; i < data.tracks.items.length; i++){
			//console.log(JSON.stringify(data.tracks.items[i], null, 2));
			//console.log("Album "+(i+1) +": " + data.tracks.items[i].album.name);
			//console.log("Listen to the Preview here :" + data.tracks.items[i].preview_url);
			logStr=logStr+"Album "+(i+1) +": " + data.tracks.items[i].album.name+
					"\nListen to the Preview here :"+ data.tracks.items[i].preview_url;
			//
			for(var j=0; j < data.tracks.items[i].artists.length; j++){
				//console.log("Artist " + (j+1) + " : " + data.tracks.items[i].artists[j].name);
				logStr= logStr+"\nArtist" + (j+1) + " : " + data.tracks.items[i].artists[j].name;
			}
			logStr = logStr+"\n------------------------------------------------------------------------\n";
			//console.log("__________________________________________________________________________")
		}
		//console.log(data);
		writeLogTxt(logStr);
	});
}



function createMovieStr(mList){
	if(!mList.length){
		//if they did not send us song
		//Prompt for a song and the call the spotifyfuctio
		inquirer.prompt([
		{
			type: "input",
			name: "movie",
			message: "Please enter the Movie or we can show 'Mr.Nobody'"
		}
		// After the prompt, store the user's response in a variable
		]).then(function(user){
		//console.log('action: '+ action.action)
			mList = user.movie.split(" ");
			mList = mList.join("+")
			//console.log(sList);
			movieThis(mList);
		});//inquirer prompt
	}
	else {
		mList = mList.join("+")
		//console.log("From the terminal:" + mList);
		movieThis(mList);
	}

}//Create Movie Str



function movieThis(movieName){
	console.log(movieName);
	if(!movieName){
		movieName="Mr+Nobody";
		console.log("You did not enter any song. So it is Mr. Nobody");
	}

	movieName = movieName.toLowerCase();
//  create a request 
	request('http://www.omdbapi.com/?t='+movieName+'&y=&plot=short&r=json&tomatoes=true', function (error, response, body) {
		// If the request is successful
		 if (!error && response.statusCode == 200) {
		// Then log for the movie
		// console.log("Title :\t\t" + JSON.parse(body).Title);
		// console.log("Year :\t\t" + JSON.parse(body).Year);
		// console.log("IMDB Rating :\t" + JSON.parse(body).imdbRating);
		// console.log("Country :\t" + JSON.parse(body).Country);
		// console.log("Language :\t" + JSON.parse(body).Language);
		// console.log("Plot :\t\t" + JSON.parse(body).Plot);
		// console.log("Actor :\t\t" + JSON.parse(body).Actors);
		// console.log("Rotten Tomato Rating :\t" + JSON.parse(body).tomatoRating);
		// console.log("Rotten Tomato URL :\t" + JSON.parse(body).tomatoURL);
		// console.log("___________________________________________________________");	

		var logStr = "Title :\t " + JSON.parse(body).Title + "\n Year :\t" + JSON.parse(body).Year+"\nIMDB Rating :\t" + JSON.parse(body).imdbRating+
	    "\nCountry :\t" + JSON.parse(body).Country+"\nLanguage :\t" + 
	    JSON.parse(body).Language + "\nPlot :\t" + JSON.parse(body).Plot+
		"\nActor :\t" + JSON.parse(body).Actors+
		"\nRotten Tomato Rating :\t" + JSON.parse(body).tomatoRating+
		"\nRotten Tomato URL :\t" + JSON.parse(body).tomatoURL+"\n"
		//"\n___________________________________________________________\n"

		writeLogTxt(logStr); 
		//console.log("The movie's rating is: "+ (body));
		}
	});
}



function doWhatItSays(txtFile){
	console.log("doWhatItSays  :  "+ txtFile);
	txtFile=txtFile.toString();
	fs.readFile(txtFile, 'utf8', function(error,data){
		var line = data.split('\r\n');
		for(var i=0; i < line.length; i++){
			if(line[i].indexOf(',') > 0){
				line[i] = line[i].replace(/\"+/g, "");
				line[i] = line[i].split(',');
				var action = line[i].splice(0,1);
				action = action.toString();
				line[i][0]=line[i][0].toString();
				//console.log("action: "+ action);
				//console.log("List: "+ line[i][0]);
				var list = line[i][0];
				list = list.split(" "); //selectAction take in a array of words
			} else {
				var action = line[i].toString();
				list = null;
			}
			
			selectAction(action, list);
			//console.log("***************************************************************************");

		}
	}); //end read file
}


function writeLogTxt(logStr){
	logStr += "____________________________________________________________________________\n";
  	logStr = "Time : " + moment().format('MM/DD/YYYY HH:MM')
  			+ "\n____________________________________________________________________________\n"
  			+ logStr+"\n";
	console.log(logStr);
	fs.appendFile('log.txt', logStr, function(error){
		console.log("Logged to log.txt");
	});

}