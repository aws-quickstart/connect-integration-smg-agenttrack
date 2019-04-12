var https = require('https');
var send = function (event, context, responseStatus, responseData, physicalResourceId) {

  if (!event.StackId) return;

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

  var request = https.request(options, function (response) {
    console.log("Status code: " + response.statusCode);
    console.log("Status message: " + response.statusMessage);
    context.done();
  });

  request.on("error", function (error) {
    console.log("send(..) failed executing https.request(..): " + error);
    context.done();
  });

  request.write(responseBody);
  request.end();
};


function getIntegrationTestUrl(apiKey, connectInstanceId) {
  return {
    host: "connect-api.smg.com",
    path: "/LambdaAccess/IntegrationTest/" + apiKey + "/" + connectInstanceId
  };
}


exports.quickstart = function (event, context) {
  console.log(JSON.stringify(event));
  var testUrl = getIntegrationTestUrl(event.ResourceProperties.apiKey, event.ResourceProperties.connectInstanceId);
  var state = {
    event,
    context,
    testUrl: testUrl,
  };
  //console.log(JSON.stringify(state));
  getData(state);
};

function fail(state) {
  console.log("Failure");
  send(state.event, state.context, "FAILED", {});
}

function getData(state) {
  try {
    const options = {
      hostname: state.testUrl.host,
      port: 443,
      path: state.testUrl.path,
      method: 'POST'
    };
    console.log(JSON.stringify(state.testUrl));

    const req = https.request(options, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      if (res.statusCode == 200) {
        send(state.event, state.context, "SUCCESS", {});
      } else {
        send(state.event, state.context, "FAILED", {
          code: res.statusCode
        });
      }
    });

    req.on('error', (e) => {
      console.error(e);
      send(state.event, state.context, "FAILED", {
        SMG: e
      });
    });
    req.end();


  } catch (e) {
    console.log("GetData Failed: " + e.message);
    fail(state);
  }
}

