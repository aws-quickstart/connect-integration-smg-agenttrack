var https = require('https');
var querystring = require('querystring');
var url = require('url');
exports.handler = (event, context, callback) => {
    var AWS = require('aws-sdk');
    if (event.keepwarm) {
        callback(null, 'kept warm');
        context.succeed();
        return;
    }
    
    var parsedUrl = url.parse(process.env.SURVEY_URL);

    var params = {
        MessageBody: (event.body !== undefined)?JSON.stringify(event.body):JSON.stringify(event),
        PostHost: parsedUrl.hostname,
        PostPath: parsedUrl.path,
        ApiKey: process.env.SURVEY_APIKEY
    };
    var post_data = querystring.stringify({
        message: params.MessageBody,
        apiToken : params.ApiKey
    });
    var post_options = {
      host: params.PostHost,
      path: params.PostPath,
      port: 443,
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
    };
    var post_req = https.request(post_options, function(res) {
         res.setEncoding('utf8');
       
      res.on('data', function (chunk) {
          callback(null, 'Response here!!: ' + chunk);
          context.succeed();
      });
       res.on('end', function (chunk) {
          callback(null, 'Response here!!: ' + chunk);
          context.succeed();
      });
    }).on('error', (err) => {
         callback(err)
        context.succeed();
    });
    post_req.write(post_data);
    post_req.end();
};