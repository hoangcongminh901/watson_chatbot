#!/usr/bin/env node
//
// Watson Dialog 単体テスト用
//
//
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
//
// Maho Takara
// 2016/4/9 1st
// 2016/5/8 update
// 2016/5/14 起動時に例外発生の原因修正
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');
var params = require('./dialog_id.json');
var dialog = watson.dialog(auth.dialog[0].credentials);

var lines=[];
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var session = {
    dialog_id: params.dialog_id
};

reader.on('line', function (line) {
    lines.push(line);
    session.input = line;
    watson_dialog(session, function(err, resp){
	console.log("reply = ",resp);
    });
});

reader.on('close', function () {
  //do something
});

// Dialog を利用した会話処理本体
function watson_dialog(xses, callback) {
    dialog.conversation(xses, function(err,reply) {
	if (err) {
	    console.log("Watson dialog error = ", err);
	    callback(err, null);
	} else {
	    xses.conversation_id = reply.conversation_id;
	    xses.client_id = reply.client_id;
	    callback(null,reply);

	    dialog.getProfile(xses, function(err, profile) {
		if (err) {
		    console.log("Watson dialog error = ", err);
		} else {
		    console.log("profile = ", profile);
		}
	    });
	}
    });
}
