var https = require('https');
var send = function (event, context, responseStatus, responseData, physicalResourceId) {

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
}

function getBaseUrl(mode) {
  return mode === "QA" ? "qaconnect.smg.com" : "connect.smg.com";
}

function getSurveyUrl(mode, customerId) {
  return `https://${getBaseUrl(mode)}/ConnectSurveysAPI/CustomerSurveys/GetCustomerSurvey/${customerId}`;
}

function getCustomerUrl(mode, apiKey) {
  return `https://${getBaseUrl(mode)}/ConnectSurveysAPI/Customers/GetByKey/${apiKey}`;
}
exports.quickstart = function (event, context) {
  var state = {
    event,
    context,
    apiKey: event.ResourceProperties.apiKey,
    mode: event.ResourceProperties.mode || "Prod",
    connectInstanceId: event.ResourceProperties.connectInstanceId,
    currentMethod: 0,
    getDataUrlMethods: [
      (state) => getCustomerUrl(state.mode, state.apiKey),
      (state) => getSurveyUrl(state.mode, state.customer.id)
    ],
    postGetDataActions: [
      (state, dataReturnedFromGet) => {
        try {
          if (dataReturnedFromGet) {
            state.customer = JSON.parse(dataReturnedFromGet);
            //console.log("GetData returned: " + JSON.stringify(state.customer));
            if (state.customer && state.customer.id) {

              state.currentMethod++;
              getData(state);
              return;
            }
          } else {
            //console.log("first query failed")
          }
        } catch (err) {
          console.log(err.message);
        }
        fail(state);
      },
      (state, dataReturnedFromGet) => {
        console.log("Success")
        send(state.event, state.context, "SUCCESS", {});
      }
    ]
  };
  //console.log(JSON.stringify(state));
  getData(state);
};

function fail(state) {
  console.log("Failure")
  send(state.event, state.context, "FAILED", {});
}

function getData(state) {
  try {
    var theUrl = state.getDataUrlMethods[state.currentMethod](state);
    //console.log(theUrl);
    var req = https.get(theUrl, (res) => {
      var dat = '';
      res.on('data', (d) => dat += d);
      res.on('end', () => state.postGetDataActions[state.currentMethod](state, dat));

    }).on('error', (e) => {
      var results = {
        lambdaResult: 'Error',
        errorMessage: 'Problem with request: ' + e.message
      };

      console.log("HTTP Error: " + e.message);
      send(state.event, state.context, "FAILED", {
        SMG: results.errorMessage
      });
    });

  } catch (e) {
    console.log("GetData Failed: " + e.message);
    fail(state);
  }
}

// exports.quickstart({
//   StackId: 123,
//   ResponseURL: "http://abc.com",
//   ResourceProperties: {
//     apiKey: "C8159D77-1675-4AF0-A310-9880CE377666",
//     connectInstanceId: "df643f57-44ea-42d8-86a1-cba07c492ec9",
//     mode: "QA"
//   }
// }, {
//   logStreamName: "",
//   done: () => console.log("done")
// });
/*

{
  "StackId": "123",
  "ResponseURL": "http://abc.com",
  "ResourceProperties": {
    "apiKey": "C8159D77-1675-4AF0-A310-9880CE377666",
    "connectInstanceId": "df643f57-44ea-42d8-86a1-cba07c492ec9",
    "mode": "QA"
  }
}

*/