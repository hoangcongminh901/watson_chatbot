#!/usr/bin/env node
//
// テンプレートを読ませてダイアログを作る
// 
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
// 
// 2016/3/24 初版
// 2016/5/8  Cloudantと連携した形に修正
// 2016/8/8  シンプル化
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');

var dialog = watson.dialog(auth.dialog[0].credentials);
var params = {
    name: cnf.name,
    file: fs.createReadStream(cnf.file),
    language: cnf.lang
}

dialog.createDialog( params, function(err,resp) {
    if (err) {
	console.log("Watson dialog err = ",err);
    } else {
	console.log("response = ", resp);
	resp.name = cnf.name;
	fs.writeFile( "dialog_id.json", JSON.stringify(resp,null,'  '));
    }
});

