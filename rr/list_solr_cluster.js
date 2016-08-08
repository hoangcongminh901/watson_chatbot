#!/usr/bin/env node
//
// Apache Solr cluster をリストする
// 
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
// 
// 2016/3/27 初版
//

var fs     = require('fs');
var auth   = require('./watson.rtrv_rank.auth.json');
auth.credentials['version'] = 'v1';
var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank(auth.credentials);


retrieve_and_rank.listClusters({},
  function (err, response) {
    if (err)
       console.log('watson rr error:', err);
    else
	console.log(JSON.stringify(response, null, 2));
});
