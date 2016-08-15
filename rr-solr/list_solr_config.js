#!/usr/bin/env node
//
// Solr clusterの設定を登録する
// 
// 2016/3/28 Maho Takara
//

var fs     = require('fs');
var auth   = require('./watson.rtrv_rank.auth.json');
auth.credentials['version'] = 'v1';
var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank(auth.credentials);
var params = require('./cluster_id.json');
params.config_name = 'example_config';

retrieve_and_rank.listConfigs(params,
   function (err, response) {
       if (err)
           console.log('error:', err);
       else
           console.log(JSON.stringify(response, null, 2));
});

