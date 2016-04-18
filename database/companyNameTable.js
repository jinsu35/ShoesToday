exports.selectAll = function (callback) {
    setTimeout(function(){
        callback(null, ['footlocker', 'eastbay']);
    }, 200);
}