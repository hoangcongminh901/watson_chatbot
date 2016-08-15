#!/usr/bin/env node
//
// テンプレートを読ませてダイアログを作る
// 作成したダイアログのIDと名前はCloudant のwatson_credentialsのDB
// に格納される。
// 
// Maho Takara 
//
// 2016/3/24 初版
// 
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');

var dialog = watson.dialog(auth.dialog[0].credentials);

var itemno = 4;
var params = {
    name: cnf.dialog[itemno].name,
    file: fs.createReadStream(cnf.dialog[itemno].file),
    language: cnf.dialog[itemno].lang
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
