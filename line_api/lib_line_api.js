exports.my_name = function(session_handle, callback) {
    var profile = JSON.parse(session_handle.profile);
    ans = { phrase: profile.contacts[0].displayName}
    callback(null,ans);
}
