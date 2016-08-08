//
// LINE API の DISPLAY NAME を返す
// 
// 作者 Maho Takara    takara@jp.ibm.com
//
// Copyright (C) 2016 International Business Machines Corporation 
// and others. All Rights Reserved. 
// 
// 2016/8/8  初版
//

exports.my_name = function(session_handle, callback) {
    var profile = JSON.parse(session_handle.profile);
    ans = { phrase: profile.contacts[0].displayName}
    callback(null,ans);
}
