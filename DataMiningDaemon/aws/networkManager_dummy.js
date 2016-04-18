exports.getAllPrivateIpAddresses = function (callback) {
    setTimeout(function(){
        callback(null, [ '192.168.13.225' ]);
    }, 200);
}