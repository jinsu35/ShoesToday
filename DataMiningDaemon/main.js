var async = require("async");
var networkManager = require("./aws/networkManager.js");
var Hatchery = require("./crawler/Hatchery.js");
// var database_companyNameTable = require('./database/companyNameTable.js');
var database_shoesTable = require('./database/shoesTable.js');

// Adjust numberOfRequestPerSecondPerIp for maximum performance, which can reduce number of public IPs needed.
var numberOfRequestPerSecondPerIp = 4;
// var requestInterval = 1000 / numberOfRequestPerSecondPerIp / proxyIpAddressList.length;
var requestInterval = 5000;

async.parallel([
    networkManager.getAllProxyIpAddresses,
    database_shoesTable.selectAll
],
function(err, results){
	if(err) {
		console.log(err);
		return;
	}
	
	// the results array will equal [proxyIpList, shoesList]
	console.log('Initialization Finished: ' + results);
	var hatchery = new Hatchery(results[0], results[1], requestInterval);
	hatchery.startSendingRequests();
});

























/*
// PrivateIp addresses do not change. They are fixed.
var privateIpList = networkManager.getAllPrivateIpAddresses();
console.log('main.js: privateIpList size = ' + privateIpList.length);
// var privateIpList = [ '192.168.13.225' ];

// Contains each website's domain name.
// These values will be used to send data to their website
var companyNameList = ['footlocker', 'eastbay'];

// List of all shoes, extracted from 'SHOES' table.
// This list should be refreshed everytime the 'TASK' table is updated, which results in updating the 'SHOES' table.
// var shoesList = Database.getShoesList;
// var shoesList = [{model:259316, sku:14962002}];		// Alive link
// var shoesList = [{model:259224, sku:32816122}];		// Broken link
var shoesList = [{model:259316, sku:14962002}, {model:259224, sku:32816122}, {model:266424, sku:18897701}];		// Alive link & Broken link

// Adjust numberOfRequestPerSecondPerIp for maximum performance, which can reduce number of public IPs needed.
var numberOfRequestPerSecondPerIp = 4;
//var requestInterval = 1000 / numberOfRequestPerSecondPerIp / shoesList.length;
var requestInterval = 5000;

var hatchery = new Hatchery(privateIpList, companyNameList, shoesList, requestInterval);
hatchery.startSendingRequests();
*/
