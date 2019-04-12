var https = require('https');

exports.handler = (event, context, callback) => {
    var config = {};

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

    var answerQuestionDiff = Date.now() - parseInt(event.Details.Parameters.QuestionTimestamp, 10);
    config.currentAnswer = event.Details.Parameters.CurrentAnswer;
    config.surveyProgress = event.Details.Parameters.SurveyProgress;
    config.previousQuestionPrefixType = event.Details.Parameters.PreviousQuestionPrefixType;
    config.previousResponse = event.Details.Parameters.PreviousResponse;
    config.questionCount = parseInt(event.Details.Parameters.QuestionCount, 10) + 1;
    config.validResponseValues = event.Details.Parameters.ValidResponseValues;
    config.maxQuestionRetries = parseInt(event.Details.Parameters.MaxQuestionRetries, 10);
    config.timeBeforeAnswer = parseInt(event.Details.Parameters.TimeBeforeAnswer, 10);
    config.surveyProgressDetail = JSON.parse(event.Details.Parameters.SurveyProgressDetail);

    if (!(config.currentAnswer)){
        config.currentAnswer = '';
    }
        
    config.callback = callback;
    config.context = context;

    if ((config.validResponseValues.indexOf(config.currentAnswer) == -1 && config.questionCount < config.maxQuestionRetries) || (answerQuestionDiff < config.timeBeforeAnswer && config.questionCount < config.maxQuestionRetries)) {
        config.response = JSON.parse(config.previousResponse);
        config.response.questionCount = config.questionCount;
        config.response.previousResponse = config.previousResponse;
        config.response.questionTimestamp = Date.now();
        config.response.questionTimestamp = config.response.questionTimestamp + (config.timeBeforeAnswer * 2);
        config.response.wrongAnswer = true;
        config.surveyProgressDetail.splice(-1, 1);
        
        updateSurveyProgress(1, config.response.nextQuestion, config.currentAnswer, config.surveyProgressDetail);

        if (config.currentAnswer == 'Timeout' || answerQuestionDiff < config.timeBeforeAnswer) {
            config.response.wrongAnswer = false;
            config.response.questionTimestamp = config.response.questionTimestamp - (config.timeBeforeAnswer * 2);
        }

        config.response.surveyProgressDetail = JSON.stringify(config.surveyProgressDetail);

        console.log('LAMBDA RETURN IS:');
        console.log(config.response);

        config.callback(null, JSON.parse(config.response));
        config.context.succeed();
    } else {
        sendData(config);
    }
};

function updateSurveyProgress(questionId, questionText, answerInput, progressObj) {
    var newQuestion = {
        'questionPrefixType': questionId,
        'questionText': questionText,
        'answerInput': answerInput
    };
    progressObj.push(newQuestion);
}


exports.sendData = (config) => {

    var dto = JSON.stringify({
        apiKey: process.env.API_KEY,
        surveyProgress: config.surveyProgress,
        currentAnswer: config.currentAnswer,
        previousQuestionPrefixType : config.previousQuestionPrefixType,
        surveyDetail: ''
    });
    
    try {
        const options = {
            hostname: process.env.API_HOST,
            path: '/LambdaAccess/v2/NextQuestion',
            port: 443,
            method: 'POST',
            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
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
                config.callback(null, JSON.parse(d.toString()));
            });
        });

        req.on('error', (e) => {
            console.error('error:', e);
            config.callback(e);
        });

        req.write(dto);
        req.end();

    } catch (e) {
        console.log("GetData Failed: " + e.message);
        config.callback(e.message);
    }
}