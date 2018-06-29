var send = function(event, context, responseStatus, responseData, physicalResourceId) {

  var responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
    PhysicalResourceId: physicalResourceId || context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });

  console.log("Response body:\n", responseBody);

  var https = require("https");
  var url = require("url");

  var parsedUrl = url.parse(event.ResponseURL);
  var options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: "PUT",
    headers: {
      "content-type": "",
      "content-length": responseBody.length
    }
  };

  var request = https.request(options, function(response) {
    console.log("Status code: " + response.statusCode);
    console.log("Status message: " + response.statusMessage);
    context.done();
  });

  request.on("error", function(error) {
    console.log("send(..) failed executing https.request(..): " + error);
    context.done();
  });

  request.write(responseBody);
  request.end();
}

exports.quickstart = function(event,context) {
  if (event.RequestType == 'Create') {

    console.log(event); // cloud watch

      try {
        var https = require('https');
        
        var req = https.get('https://connect.smg.com/ConnectSurveysAPI/LambdaAccess/NextQuestion', (res) => {
          var dat = '';
        
          res.on('data', (d) => {
            dat += data;
          });

          res.on('end', function() {
  
            console.log(dat); // cloud watch
  
            var d = JSON.parse(dat);
  
            console.log("Sending generic SUCCESS for now...");
            send(event,context,"SUCCESS",{});
            
          });
        
        }).on('error', (e) => {
          var results = {
            lambdaResult: 'Error',
            errorMessage: 'Problem with request: ' + e.message
          };
          console.log("Oopsie: " + JSON.stringify(e));
          console.log("HTTP Error: " + e.message);
          send(event,context,"FAILED",{SMG: results.errorMessage});
        });

      } catch(e) {
        console.log('JavaScript Error: '+e.message);
        send(event,context,"FAILED",{});
      }

  } else if (event.RequestType == 'Update') {
    console.log('The validation function is not configured to handle the Update request type');
    send(event,context,"SUCCESS",{});
  } else if (event.RequestType == 'Delete') {
    console.log('The validation function is not configured to handle the Delete request type');
    send(event,context,"SUCCESS",{});
  }
 
};