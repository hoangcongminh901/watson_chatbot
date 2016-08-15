#!/usr/bin/env node

var fs = require('fs');
var watson = require('watson-developer-cloud');
var wnc = require('./watson_nlc_credentials.json');
var cnf = require('./nlc_config.json');
var nlc = watson.natural_language_classifier(wnc.credentials);

// Create NLC Classifier
var params = {
    language: 'ja',
    name: cnf.nlc_name,
    training_data: fs.createReadStream(cnf.training_csv),
};

nlc.create(params, function(err, response) {
    if (err) {
	console.log("err=", err);
    } else {
	fs.writeFile( "nlc_id.json", JSON.stringify(response,null,'  '));
    }
});
