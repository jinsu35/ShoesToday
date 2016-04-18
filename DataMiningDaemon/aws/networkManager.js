var MAX_ENI_PER_INSTANCE = 2;
var MAX_IP_PER_ENI = 2;
var PRIMARY_IP_ADDRESS = '172.31.255.137';

var AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });

var instanceId;
function getInstanceId() {
  var metadata = new AWS.MetadataService();
  metadata.host = '169.254.169.254';
  metadata.request('/latest/meta-data/instance-id', function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      instanceId = data;
      console.log('instance-id: ' + instanceId);
    }
  }); 
}

getInstanceId();


// Initialize EC2 instance

var ec2 = new AWS.EC2({apiVersion: '2015-10-01'});

// Generate private addresses. 

var privateAddrs = [];
var num = 138;
for (i = 0; i < MAX_ENI_PER_INSTANCE; i++) {
  for (j = 0; j < MAX_IP_PER_ENI; j++) {
    var newIp = '172.31.255.' + num;
    privateAddrs.push(newIp);
    num++;
  }
}

// Return all private IP addresses
function getAllPrivateIpAddresses(callback) {
  ec2.describeNetworkInterfaces(function(err, data) {
    if (err) {
      console.log('Failed to get network interfaces. %s', err);
      callback(err, null);
    }
    else {
      var networkInterfaces = [];
      for (i = 0; i < data.NetworkInterfaces.length; i++) {
        var iace = data.NetworkInterfaces[i];
        var arr = iace.PrivateIpAddresses;
        var iaceId = iace.NetworkInterfaceId;
        for (j = 0; j < arr.length; j++) {
          var addr = arr[j];
          var association = addr.Association;
          if (association) {
            var netIace = {
              PrivateIpAddress: addr.PrivateIpAddress,
              NetworkInterfaceId: iaceId,
              AllocationId: association.AllocationId,
              PublicIpAddress: association.PublicIp
            };
            console.log('Network Interface found. %s', netIace.PrivateIpAddress);
            networkInterfaces.push(netIace);
          }
        }
      }
      console.log('%d Network Interfaces found.', networkInterfaces.length);
      callback(null, networkInterfaces);
    }
  });
}

exports.getAllPrivateIpAddresses = getAllPrivateIpAddresses;

getAllPrivateIpAddresses(function(err, list) {
  if (err) console.log('ERROR');
  else console.log('%d private IP addresses found.', list.length);
});



function assignPrivateIpAddresses(arr) {
   // Assing private IP addresses that were manually added from EC2 console
  var addresses = arr.map(function(addr, idx, arr) { return addr.PrivateIpAddress; });
  var params = {
    NetworkInterfaceId: iaceId,
    PrivateIpAddresses: addresses 
  };
  ec2.assignPrivateIpAddresses(params, function(err, data) {
    if (err) console.log('Assigning %s private IP addresses failed. - %s', arr.length, err);
    else {
      console.log('%s private IP addresses successfully assigned for NI(%s).', arr.length, iaceId);
    }
  });
}


function changeElasticIpForPrivateIp(privateIp) {
  var netIace = networkInterfaceForPrivateIp(privateIp);
  if (netIace) {
    var params = { AllocationId: netIace.AllocationId };
    ec2.releaseAddress(params, function(err, data) {
      if (err) {
        console.log('Failed to release an elastic IP. %s', err);
      }
      else {
        console.log('An elastic IP successfully released. %s', data);
      }
      spawnElasticIp(netIace);
    });
  } 
}

function networkInterfaceForPrivateIp(privateIp) {
  for (i = 0; i < networkInterfaces.length; i++) {
    var iace = networkInterfaces[i];
    if (iace.PrivateIpAddress == privateIp)  { 
      console.log('FOUND');
      return iace; 
    }
  }
  return null;
}

// Spawn elastic IP address 

function spawnElasticIp(nInterface) {
  var params = {
    Domain: 'vpc | standard',
  };

  ec2.allocateAddress(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log('New elastic IP allocated. [%s]', data.PublicIp);
      nInterface.PublicIpAddress = data.PublicIp;
      associateAddress(nInterface, data.AllocationId);
    }
  });
}

// Associate private addresses with elastic IP's.

function associateAddress(nInterface, allocationId) {
  var params = {
    AllocationId: allocationId,
    AllowReassociation: true,
    NetworkInterfaceId: nInterface.NetworkInterfaceId,
    PrivateIpAddress: nInterface.PrivateAddress
  };
  console.log('associating private(%s) with elastic(%s)', nInterface.PrivateAddress, allocationId);

  ec2.associateAddress(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else {
      console.log('association SUCCESS: %s', data);           
      nInterface.AllocationId = allocationId;
      console.log('#########New Network Interfaces########');
      networkInterfaces.forEach(function(netIace) {
        console.log('Private[%s] Elastic[%s]', netIace.PrivateIpAddress, netIace.PublicIpAddress)
      });
    }
  });
}

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    console.log('Private IP Address - %s',iface.address);
  });
});

