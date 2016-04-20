var _ = require('underscore');

var AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });


// Initialize EC2 instance
var ec2 = new AWS.EC2({apiVersion: '2015-10-01'});
var instanceId;

function getInstanceId() {
  var metadata = new AWS.MetadataService();
  metadata.host = '169.254.169.254';
  metadata.request('/latest/meta-data/instance-id', function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      instanceId = data;
    }
  }); 
}

// Return all private IP addresses
function getAllPrivateIpAddresses(callback) {
  var addresses = ['117.135.250.134:8081', '117.135.250.133:8083', 
                '117.135.251.134:82', '62.117.96.138:3128', '125.90.207.93:8000'];
  callback(null, addresses);
}

exports.getAllPrivateIpAddresses = getAllPrivateIpAddresses;
