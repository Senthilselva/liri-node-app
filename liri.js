//NPM Modules
var fs = require('fs');
var request = require('request');
var twitter = require('twitter');
var spotify = require('spotify');
var inquirer = require('inquirer');


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
	selectAction(action.action,list);
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
	console.log(action);
	switch (action){
		case "my-tweets":
			myTweet();
			break;
		case "spotify-this-song":
			spotifyThisSong(list);
			break;
		case "movie-this":
			movieThis(list);
			break;
		case "do-what-it-says":
			doWhatItSays();
			break;
	}//ending Switch

} //end Select Action 


//Tweeter Function
function myTweet(){
	
	var params = { limit : 20 }

	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	//client.get('search/tweets`', params, function(error, tweets, response) {
  	if (!error) {
  		for(var i=0; i < tweets.length; i++){
    		console.log("Tweet number"+ (i+1)+" is " + JSON.stringify(tweets[i].text,null,2));
    		console.log("It was created on "+ JSON.stringify(tweets[i].created_at));
		}
  	} else{
  		console.log(error)
  	}
});

}

//Spotify Function
function spotifyThisSong(list){
	console.log(list);
}


function movieThis(list){
	console.log(list);
}

function doWhatItSays(){
	console.log("doWhatItSays");
}