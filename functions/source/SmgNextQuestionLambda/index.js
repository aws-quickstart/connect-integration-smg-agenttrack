var https = require('https');
exports.handler = (event, context, callback) => {
    var config = {};
    if (event.keepwarm) {
        callback(null, 'kept warn');
        context.succeed();
        return;
    }
    if(event.body !== undefined){
        var bodyObj = JSON.parse(event.body);
        event.Details = bodyObj.Details;
    }
    var answerQuestionDiff = Date.now() - parseInt(event.Details.Parameters.QuestionTimestamp);
    config.currentAnswer = event.Details.Parameters.CurrentAnswer;
    config.surveyProgress = event.Details.Parameters.SurveyProgress;
    config.previousQuestionPrefixType = event.Details.Parameters.PreviousQuestionPrefixType;
    config.previousResponse = event.Details.Parameters.PreviousResponse;
    config.questionCount = parseInt(event.Details.Parameters.QuestionCount) + 1;
    config.validResponseValues =  event.Details.Parameters.ValidResponseValues;
    config.maxQuestionRetries =  parseInt(event.Details.Parameters.MaxQuestionRetries);
    config.timeBeforeAnswer =  parseInt(event.Details.Parameters.TimeBeforeAnswer);
    config.surveyProgressDetail =  JSON.parse(event.Details.Parameters.SurveyProgressDetail);
    if (!(config.currentAnswer) )
        config.currentAnswer = '';
    config.callback = callback;
    config.context = context;
    if((config.validResponseValues.indexOf(config.currentAnswer) == -1 && config.questionCount < config.maxQuestionRetries) || (answerQuestionDiff <  config.timeBeforeAnswer && config.questionCount < config.maxQuestionRetries)){
        config.response = JSON.parse( config.previousResponse);
        config.response.questionCount = config.questionCount;
        config.response.previousResponse =  config.previousResponse;
        config.response.questionTimestamp = Date.now();
        config.response.questionTimestamp =  config.response.questionTimestamp + (config.timeBeforeAnswer*2)
        config.response.wrongAnswer = true;
        config.surveyProgressDetail.splice(-1,1)
        updateSurveyProgress(1, config.response.nextQuestion, config.currentAnswer,  config.surveyProgressDetail);
        if( config.currentAnswer == 'Timeout' || answerQuestionDiff <  config.timeBeforeAnswer){
             config.response.wrongAnswer = false;
             config.response.questionTimestamp =  config.response.questionTimestamp - (config.timeBeforeAnswer*2)
        }
        
        var lambdaResponse = {
            "statusCode": 200,
            "headers": {},
            "body": JSON.stringify(config.response),
            "isBase64Encoded": false
        };
    
        config.callback(null, lambdaResponse);
        config.context.succeed();  
    }
    else{
        getNextQuestion(config);
    }
 };
function updateSurveyProgress(questionId, questionText, answerInput, progressObj){
    var newQuestion = {
        'questionPrefixType': questionId,
        'questionText': questionText,
        'answerInput': answerInput
    };
    progressObj.push(newQuestion);
} 
function getNextQuestion(config){
    var url = process.env.SURVEY_URL;
    url = url.replace('SURVEYPROGRESS', config.surveyProgress);
    url = url.replace('CURRENTANSWER', config.currentAnswer);
    url = url.replace('PQUESTIONPREFIXTYPE', config.previousQuestionPrefixType);

    https.get(url , function (resp) {
        var respContent = '' ;
        resp.on('data' , function (data) {
            respContent += data.toString();
        }) ;
        resp.on('end' ,  function() {
            config.response = JSON.parse(respContent);
            config.response.previousResponse = respContent;
            config.response.questionCount = 0;
            config.response.questionTimestamp = Date.now();
            
            updateSurveyProgress(1, config.response.nextQuestion, config.currentAnswer,  config.surveyProgressDetail, false);
            config.response.surveyProgressDetail = JSON.stringify(config.surveyProgressDetail);
 
            console.log('API RETURN IS:');
            console.log(config.response);
            
           var lambdaResponse = {
                "statusCode": 200,
                "headers": {},
                "body": JSON.stringify(config.response),
                "isBase64Encoded": false
            };
        
            config.callback(null, lambdaResponse);
            config.context.succeed();
            
        }) ;
    }).on('error', function(e) {
            console.log('Got error: ' + e.message);
            config.context.done(null, 'FAILURE');
        });
}