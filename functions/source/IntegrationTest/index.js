var https = require('https');

var send = function (event, context, responseStatus, responseData, physicalResourceId) {

  if (!event.StackId){
    return;
  }

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

exports.quickstart = function (event, context) {
  console.log(JSON.stringify(event));

  var state = {
    event,
    context,
    dto: {
      apiToken: event.ResourceProperties.apiKey,
      connectInstanceId: event.ResourceProperties.connectInstanceId
    }
  };
  //console.log(JSON.stringify(state));
  
  getData(state);
};

function fail(state) {
  console.log("Failure");
  send(state.event, state.context, "FAILED", {});
}

exports.getData = function (state) {
  try {

    var dto = JSON.stringify(state.dto);

    const options = {
      hostname: process.env.API_HOST,
      path: '/LambdaAccess/v2/IntegrationTest',
      port: 443,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': dto.length
      }
    };

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

      res.on('data', (d) => {
        // Will only display data if error code = 400
        console.log(d.toString());
      })
    });

    req.on('error', (e) => {
      console.error(e);
      send(state.event, state.context, "FAILED", {
        SMG: e
      });
    });

    req.write(dto);
    req.end();

  } catch (e) {
    console.log("GetData Failed: " + e.message);
    fail(state);
  }
}