#!/usr/bin/env node
//
// Watson に登録した Dialog を更新する
//
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
// 
//
// 2016/3/24 初版
// 2016/5/8  Cloudantと連携した形に修正
// 2016/8/4  シンプル化
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');
var params = require('./dialog_id.json');
var dialog = watson.dialog(auth.dialog[0].credentials);

params.file = fs.createReadStream(cnf.file);

dialog.updateDialog(params, function(err, resp) {
    if (err) {
	console.log("watson dialog err = ", err);
    } else {
	console.log("resp = ", resp);
    }
});

