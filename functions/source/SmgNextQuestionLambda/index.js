var https = require('https');

exports.handler = (event, context, callback) => {
    var config = {};
    var bad = false;
    var failEvent = JSON.stringify(event);

    if (event.keepwarm) {
        callback(null, 'kept warm');
        context.succeed();
        return;
    }

    console.log(JSON.stringify(event));

    if (event.body !== undefined) {
        var bodyObj = JSON.parse(event.body);
        event.Details = bodyObj.Details;
    }
    
    if (!event.Details){
        event.Details = {};
        bad = true;
    }
    if (!event.Details.Parameters){
        event.Details.Parameters = { badRequest: true};
        bad = true;
    }

    if (!event.Details.ContactData || !event.Details.ContactData.ContactId){
        event.Details.ContactData = { badRequest: true, ContactId : "badRequest"};
        bad = true;
    }
    if (!event.Details.ContactData.Attributes){
        event.Details.ContactData.Attributes = { badRequest: true};
        bad = true;
    }    
    
    var ev = {
        ApiKey: process.env.API_KEY,
        ContactId: event.Details.ContactData.ContactId,
        Parameters: JSON.stringify(event.Details.Parameters),
        Attributes: JSON.stringify((event.Details.ContactData.Attributes))
    };
    
    if (bad){
        ev.Event = failEvent;
    }
    
    console.log(JSON.stringify(ev));
    exports.sendData(ev, context, callback);
};


exports.sendData = (reqData, context, callback) => {
    var dto = JSON.stringify(reqData);
    try {
        const options = {
            hostname: process.env.API_HOST,
            path: '/LambdaAccess/v3/NextQuestion',
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dto.length
            }
        };

        console.log(JSON.stringify(options));
        console.log(dto);

        const req = https.request(options, (res) => {
            console.log('statusCode:', res.statusCode);

            res.on('data', (d) => {
                console.log('Response: ' + d.toString());
                callback(null, JSON.parse(d.toString()));
            });
        });

        req.on('error', (e) => {
            console.error('error:', e);
            callback(e);
        });

        req.write(dto);
        req.end();

    } catch (e) {
        console.log("GetData Failed: " + e.message);
        callback(e.message);
    }
}