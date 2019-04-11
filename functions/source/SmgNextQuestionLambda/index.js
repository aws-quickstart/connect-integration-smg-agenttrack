var https = require('https');
exports.handler = (event, context, callback) => {
    var config = {};
    if (event.keepwarm) {
        callback(null, 'kept warm');
        context.succeed();
        return;
    }
    console.log(JSON.stringify(event));
    if(event.body !== undefined){
        
        var bodyObj = JSON.parse(event.body);
        event.Details = bodyObj.Details;
    }
    var answerQuestionDiff = Date.now() - parseInt(event.Details.Parameters.QuestionTimestamp, 10);
    config.currentAnswer = event.Details.Parameters.CurrentAnswer;
    config.surveyProgress = event.Details.Parameters.SurveyProgress;
    config.previousQuestionPrefixType = event.Details.Parameters.PreviousQuestionPrefixType;
    config.previousResponse = event.Details.Parameters.PreviousResponse;
    config.questionCount = parseInt(event.Details.Parameters.QuestionCount, 10) + 1;
    config.validResponseValues =  event.Details.Parameters.ValidResponseValues;
    config.maxQuestionRetries =  parseInt(event.Details.Parameters.MaxQuestionRetries, 10);
    config.timeBeforeAnswer =  parseInt(event.Details.Parameters.TimeBeforeAnswer, 10);
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
        config.response.questionTimestamp =  config.response.questionTimestamp + (config.timeBeforeAnswer*2);
        config.response.wrongAnswer = true;
        config.surveyProgressDetail.splice(-1,1);
        updateSurveyProgress(1, config.response.nextQuestion, config.currentAnswer,  config.surveyProgressDetail);
        if( config.currentAnswer == 'Timeout' || answerQuestionDiff <  config.timeBeforeAnswer){
             config.response.wrongAnswer = false;
             config.response.questionTimestamp =  config.response.questionTimestamp - (config.timeBeforeAnswer*2);
        }
        
        config.response.surveyProgressDetail = JSON.stringify(config.surveyProgressDetail);
        
        console.log('LAMBDA RETURN IS:');
        console.log(config.response);

        config.callback(null, JSON.parse(config.response));
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
    var url = getParms(process.env.SURVEY_URL);
    url = url.replace('SURVEYPROGRESS', config.surveyProgress);
    url = url.replace('CURRENTANSWER', config.currentAnswer);
    url = url.replace('PQUESTIONPREFIXTYPE', config.previousQuestionPrefixType);
    getData(url, config);
}


//https://connect-api.smg.com/LambdaAccess/NextQuestion/71f1250b-3221-11e9-9926-54e1addfa841/SURVEYPROGRESS/CURRENTANSWER/PQUESTIONPREFIXTYPE
function getHost(url){
    var a = url.split("/");
    return  a[2];
}
function correctPath(url, path){
    if (path == "_//-1")
    {
        return url.replace("Next","First").replace("/SURVEYPROGRESS/CURRENTANSWER/PQUESTIONPREFIXTYPE", "");
    }
    var a = url.split("/");
    return "/" + a.slice(3,6).join('/') + "/" + path;
}
function getParms(url){
        var a = url.split("/");
        var rtn = a.slice(6).join('/');
        console.log(rtn);
    return rtn;
}

function getData(path, config) {

    var host = getHost(process.env.SURVEY_URL);
    path = correctPath(process.env.SURVEY_URL, path);
  try {
    const options = {
      hostname: host,
      port: 443,
      path: path,
      method: 'POST'
    };
    console.log(JSON.stringify(options));

    const req = https.request(options, (res) => {
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          config.callback(null, JSON.parse(chunk.toString()));
      });
    });

    req.on('error', (e) => {
      console.error(e);
      config.callback(e);
    });
    req.end();

  } catch (e) {
    console.log("GetData Failed: " + e.message);
    config.callback(e.message);
  }
}
