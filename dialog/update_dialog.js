#!/usr/bin/env node
//
// テンプレートを読ませてダイアログを更新する
// 作成したダイアログのIDと名前はCloudant のwatson_credentialsのDB
// に格納される。
// 
// Maho Takara 
//
// 2016/3/24 初版
// 2016/5/8  Cloudantと連携した形に修正
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');
var params = require('./dialog_id.json');
var dialog = watson.dialog(auth.dialog[0].credentials);

var itemno = 4;
params.file = fs.createReadStream(cnf.dialog[itemno].file),

dialog.updateDialog(params, function(err, resp) {
    if (err) {
	console.log("watson dialog err = ", err);
    } else {
	console.log("resp = ", resp);
    }
});



