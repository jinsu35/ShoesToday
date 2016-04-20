var _ = require('underscore');

var addresses = [];
var idx = 0;

// Return all proxy IP addresses
function loadAllProxyIpAddresses(callback) {
	addresses = ['117.135.250.134:8081', '117.135.250.133:8083', 
                '117.135.251.134:82', '62.117.96.138:3128', '125.90.207.93:8000'];
 	console.log('Proxy has %d IP addresses available.', addresses.length);

	callback(null, addresses);
}

function nextAvailableAddress() {
	if (idx == addresses.length) idx = idx - 1;

	var addr = addresses[idx];
	idx = (idx + 1) % addresses.length;
	
	return addr;
}

function removeBlockedIpAddress(address) {
	addresses = _.filter(addresses, function(addr) {
		return addr != address;
	});
	console.log('Proxy has %d IP addresses available.', addresses.length);
}

exports.loadAllProxyIpAddresses = loadAllProxyIpAddresses;
exports.nextAvailableAddress = nextAvailableAddress;
exports.removeBlockedIpAddress = removeBlockedIpAddress;