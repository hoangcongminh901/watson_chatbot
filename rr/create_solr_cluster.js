#!/usr/bin/env node
//
// Solr clusterを作成する
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
var rr_cnf = require('./rr_config.json');
var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank(auth.credentials);

params = {
    cluster_size: rr_cnf.cluster_size,
    cluster_name: rr_cnf.cluster_name
}

retrieve_and_rank.createCluster(params,function(err,response) {
    if (err) {
	console.log('error:', err); 
    }
    else {
	console.log(JSON.stringify(response, null, 2)); 
	response.cluster_id = response.solr_cluster_id;
	fs.writeFile( "cluster_id.json", JSON.stringify(response,null,'  '));
    }
});

