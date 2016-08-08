#!/usr/bin/env node
//
// Watson に登録したダイアログを削除する
//
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');
var params = require('./dialog_id.json');
var dialog = watson.dialog(auth.dialog[0].credentials);

dialog.deleteDialog(params, function(err,resp) {
    if (err) {
	console.log("Watson dialog error = ", err);
    } else {
	console.log("resp = ", resp);
    }
})




