#!/usr/bin/env node
//
// 
// 2016/4/5 Maho Takara
//

var fs     = require('fs');
var auth   = require('./watson.rtrv_rank.auth.json');
auth.credentials['version'] = 'v1';
var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank(auth.credentials);
var params = require('./cluster_id.json');
var rr_cnf = require('./rr_config.json');
var ranker = require('./ranker_id.json');
var qs = require('qs');

params.config_name = rr_cnf.config_name;
params.collection_name = rr_cnf.collection_name;
params.wt = 'json';


var question  = 'q=モビルスーツとは何ですか';
console.log("ニンゲンの質問= " + question);

var query = qs.stringify({q: question, ranker_id: ranker.ranker_id, fl: 'id,title,body'});
var solrClient = retrieve_and_rank.createSolrClient(params);


solrClient.get('fcselect', query, function(err, searchResponse) {
    if(err) {
	console.log('Error searching for documents: ' + err);
    }
    else {
	console.log('Found ' + searchResponse.response.numFound + ' documents.');
	console.log(JSON.stringify(searchResponse.response.docs, null, 2));
    }
});

