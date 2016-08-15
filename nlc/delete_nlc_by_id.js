#!/usr/bin/env node

var fs = require('fs');
var watson = require('watson-developer-cloud');
var wnc = require('./watson_nlc_credentials.json');
var cnf = require('./nlc_config.json');
var params = require('./nlc_id.json');
var nlc = watson.natural_language_classifier(wnc.credentials);

//============================================
params.classifier_id = "3a84cfx63-nlc-18752";
params.name = "Wether_Classifier";
//============================================

nlc.remove(params, function(err, status) {
    if (err) {
	console.log("err = ", err);
    } else {
	console.log("status = ", status);
    }
});



