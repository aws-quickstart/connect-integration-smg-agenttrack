var https = require('https');

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
    console.log(JSON.stringify(event));
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

exports.sendData = (data) => {
    return new Promise((resolve, reject) => {

        var dto = JSON.stringify({
            apiKey: process.env.API_KEY,
            record: data
        });

        var post_options = {
            host: process.env.API_HOST,
            path: '/LambdaAccess/v2/ProcessCtr',
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dto.length
            }
        };

        var post_req = https.request(post_options, function (res) {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            if (res.statusCode == 200) {
                console.log("Successful request");
            } else {
                console.log(res.statusCode);
            }

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                console.log("send succeeded:" + chunk.toString());
                resolve(null);
            });

            res.on('end', function (chunk) {
                console.log("send succeeded");
                resolve(null);
            });
        });

        post_req.on('error', (err) => {
            console.log(err);
            reject(err);
        });

        post_req.write(dto);

        post_req.end();
    });
};