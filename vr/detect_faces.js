#!/usr/bin/env node

var watson = require('watson-developer-cloud');
var fs = require('fs');
var cred = require('./visual_recognition_credentials.json');


var visual_recognition = watson.visual_recognition(cred.credentials);

var params = {
    images_file: fs.createReadStream('./images/Japanese-Bob-hairstyle-for-girls.jpg')
};

visual_recognition.detectFaces(params,
  function(err, response) {
    if (err)
      console.log(err);
    else
      console.log(JSON.stringify(response, null, 2));
  });


