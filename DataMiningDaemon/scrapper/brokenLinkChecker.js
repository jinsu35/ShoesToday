// Keywords for checking broken link for each site
var footlockerBrokenLinkCheckKeyword = 'recently_viewed';
var eastbayBrokenLinkCheckKeyword = 'recently_viewed';

function checkForBrokenLink(site, response, body) {
	if(site == 'footlocker') {
		checkForBrokenLinkAtSpecificSite(response, body, footlockerBrokenLinkCheckKeyword);
	} else if(site == 'eastbay') {
		checkForBrokenLinkAtSpecificSite(response, body, eastbayBrokenLinkCheckKeyword);
	}
}

function checkForBrokenLinkAtSpecificSite(response, body, keyword) {
	if(body.indexOf(keyword) > -1) {
		// page is found
		console.log('Product Is Available');
	} else {
		// page is not found
		console.log('Product Is Not Available');
	}
};

module.exports.checkForBrokenLink = checkForBrokenLink;
