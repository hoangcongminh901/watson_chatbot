#!/usr/bin/env node
//
// Watson に登録された Dialog のリストを取得する
//
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
// 
// 2016/3/24 inital 
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

