#!/usr/bin/env node

var watson = require('watson-developer-cloud');
var fs = require('fs');
var cred = require('./visual_recognition_credentials.json');


var visual_recognition = watson.visual_recognition(cred.credentials);

var params = {
    //images_file: fs.createReadStream('./images/Japanese-Bob-hairstyle-for-girls.jpg')
    //images_file: fs.createReadStream('./images/Fortified-Bicycle-Invincible-Theft-Proof-Bike-10.jpg')
    //images_file: fs.createReadStream('./images/176.jpg')
    images_file: fs.createReadStream('./images/4731676339795.jpg')
};

visual_recognition.classify(params, function(err, res) {
  if (err)
    console.log(err);
  else
    console.log(JSON.stringify(res, null, 2));
});
