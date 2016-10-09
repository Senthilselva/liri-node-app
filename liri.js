//npm Module

var fs = require('fs');
var request = require('request');
var twitter = require('twitter');
var spotify = require('spotify');
var inquirer = require('inquirer');

//local file

var require('./key.js');


var client = new twitter(keys.twitterKeys);