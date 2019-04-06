var https = require('https');
var querystring = require('querystring');
var url = require('url');


class s3Handler {
    get(key, bucketName) {
        var AWS = require('aws-sdk');
        const params = {
            Bucket: bucketName,
            Key: key,
        };
        const s3 = new AWS.S3();

        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Body.toString());
                }
            });
        });
    }
}

exports.handler = (event, context, callback) => {
    if (event.keepwarm) {
        callback(null, 'kept warm');
        context.succeed();
        return;
    }

    const promises = [];
    const s3 = new s3Handler();

    event.Records.forEach(record => {
        const call = s3
            .get(record.s3.object.key, record.s3.bucket.name)
            .then(data => sendData(data));
        promises.push(call);
    });
    Promise.all(promises).then(x => callback(null, null)).catch(x => callback(x));
};
const sendData = (data) => {
    return new Promise((resolve, reject) => {

        var parsedUrl = url.parse(process.env.SURVEY_URL);

        var params = {
            MessageBody: data,
            PostHost: parsedUrl.hostname,
            PostPath: parsedUrl.path,
            ApiKey: process.env.SURVEY_APIKEY
        };
        var post_data = querystring.stringify({
            message: params.MessageBody,
            apiToken: params.ApiKey
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
        var post_req = https.request(post_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("send succeeded");
                resolve(null);
            });
            res.on('end', function (chunk) {
                console.log("send succeeded");
                resolve(null);
            });
        }).on('error', (err) => {
            console.log(err);
            reject(err);
        });

        post_req.write(post_data);
        post_req.end();
    });
};