// Import packages
var request = require('request');
var scrapper = require("./../scrapper/brokenLinkChecker.js");

function Hatchery(privateIpAddressList, companyNameList, shoesList, requestInterval) {
	this.privateIpAddressList = privateIpAddressList;
	this.companyNameList = companyNameList;
	this.shoesList = shoesList;
	this.requestInterval = requestInterval;
	this.requestDaemon = undefined;
}

// Start the request daemon.
Hatchery.prototype.startSendingRequests = function() {
	console.log('startSendingRequests: Starts');
	console.log('startSendingRequests: ' + 'Using ' + this.privateIpAddressList.length + ' IPs');
	console.log('startSendingRequests: ' + 'Sending one request every ' + this.requestInterval / 1000 + ' seconds');
	var context = this;

	// Send request for every 'requestInterval' seconds
	var privateIpAddressListIndex = 0;
	var companyNameListIndex = 0;
	var shoesListIndex = 0;
	this.requestDaemon = setInterval(function() {
		// Send request
		sendRequest(context.privateIpAddressList[privateIpAddressListIndex], context.companyNameList[companyNameListIndex], context.shoesList[shoesListIndex]);

		// Increase indexes by one
		privateIpAddressListIndex = (privateIpAddressListIndex + 1) % context.privateIpAddressList.length;
		companyNameListIndex = (companyNameListIndex + 1) % context.companyNameList.length;
		if(companyNameListIndex == 0) {		// This means the link for this shoes has been checked for all websites
			shoesListIndex = (shoesListIndex + 1) % context.shoesList.length;
		}
	}, this.requestInterval);
};

function sendRequest(privateIpAddress, companyName, shoes) {
	var logPrefix = 'Private Ip Address: ' + privateIpAddress + ',' + ' Company Name: ' + companyName + ',' + ' Shoes Model: ' + shoes.model + ',' + ' Shoes SKU: ' + shoes.sku;

	var option = {
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
		},
		localAddress: privateIpAddress,
		uri: "http://www." + companyName + ".com/product/model:" + shoes.model + "/sku:" + shoes.sku
	};

	request(option, function(error, response, body) {
		if(error) {
			console.log('ERROR: error = ' + error);
		} else {
			if (response != null && response.statusCode == 200) {
				console.log('SUCCESS - ' + logPrefix);
				scrapper.checkForBrokenLink(companyName, response, body);
			} else if(response != null && response.statusCode == 403) {
				console.log('BLOCKED: response.statusCode = ' + response.statusCode);
				// Change Elastic IP Address
				// AWS.changeElasticIpForPrivateIp(privateIpAddress)
			}
		}
	});
}

// Stop the request daemon.
Hatchery.prototype.stopSendingRequests = function() {
	if(this.requestDaemon != undefined) {
		clearInterval(this.requestDaemon);
	}
};

// Setter for shoesList
Hatchery.prototype.setShoesList = function(shoesList) {
	this.shoesList = shoesList;
};

module.exports = Hatchery;