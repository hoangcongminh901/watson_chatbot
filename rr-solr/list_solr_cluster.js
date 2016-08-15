#!/usr/bin/env node
//
// Solr clusterを作成する
// 
// 2016/3/27 Maho Takara
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
