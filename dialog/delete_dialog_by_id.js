#!/usr/bin/env node
//
// Watson からID を指定してダイアログを削除する
//
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
//
// 2016/5/8 初版
//
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');
var dialog = watson.dialog(auth.dialog[0].credentials);


var params = {
    dialog_id: '30f3ac77-5ebd-49ee-a359-59002e6dccf8'
}

dialog.deleteDialog(params, function(err,resp) {
    if (err) {
	console.log("Watson dialog error = ", err);
    } else {
	console.log("resp = ", resp);
    }
})




