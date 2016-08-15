#!/usr/bin/env node
//
// ダイアログのリストを Watson から取得する
// 
// Maho Takara
// 2016/3/24 v1
// 2016/5/8  update
//

var fs     = require('fs');
var watson = require('watson-developer-cloud');
var auth   = require('./watson_dialog_credentials.json');
var dialog = watson.dialog(auth.dialog[0].credentials);

dialog.getDialogs({}, function(err, resp) {
  if (err) {
      console.log(err);
  } else {
      console.log(resp);
  }
});

