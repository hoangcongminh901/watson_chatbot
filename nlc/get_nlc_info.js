#!/usr/bin/env node

var fs = require('fs');
var watson = require('watson-developer-cloud');
var wnc = require('./watson_nlc_credentials.json');
var cnf = require('./nlc_config.json');
var nlc = watson.natural_language_classifier(wnc.credentials);
var params = require('./nlc_id.json');

// Get Classifier Status
nlc.status(params, function(err, status) {
    if (err) {
	console.log("error = ", err);
    } else {
	console.log("status = ", status);
    }
});

