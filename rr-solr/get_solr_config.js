#!/usr/bin/env node
//
// Solr clusterの設定を ダウンロードする
//  サイズが０のファイルしかできないけど。。。
// 
// 2016/3/28 Maho Takara
//

var fs     = require('fs');
var auth   = require('./watson.rtrv_rank.auth.json');
auth.credentials['version'] = 'v1';
var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank(auth.credentials);
var params = require('./cluster_id.json');
var rr_cnf = require('./rr_config.json');

params.config_name = rr_cnf.config_name;
config_zip_path = 'downloaded_solr_config.zip';

retrieve_and_rank.getConfig(params).pipe(fs.createWriteStream(config_zip_path));

