#!/usr/bin/env node
//
//
// 作成したダイアログをダイアログ名を指定して削除する
// Watson Dialog からと Cloudant の watson_credentials　の二つから削除する 
//
// 2016/5/8 Maho Takara
//
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var cnf    = require('./dialog_config.json');
var dialog = watson.dialog(auth.dialog[0].credentials);

var params = {
    dialog_id: 'b7d3e91e-55c8-4a74-8ec0-b1067c6f063c'
}

dialog.deleteDialog(params, function(err,resp) {
    if (err) {
	console.log("Watson dialog error = ", err);
    } else {
	console.log("resp = ", resp);
    }
})




