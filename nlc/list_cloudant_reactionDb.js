#!/usr/bin/env node
//
// DBに登録されている全てのドキュメントを表示する
//
// 2016/8/1 Maho Takara
//
var fs   = require('fs');
var cred = require('./cloudant_credentials_id.json');
var Cloudant = require('cloudant')
var cloudant = Cloudant(cred.credentials.url);
var dbname = "reactions"
var db = cloudant.db.use(dbname);

db.list(function(err, body) {
    if (!err) {
        body.rows.forEach(function(doc) {
            db.get(doc.id, function(err, data) {
                console.log(data);
                console.log("---");
            });
        });
    }
});

