var aws = require('aws-sdk');
var monkey = require('./monkey');
var format = require('util').format;

module.exports = {
  AWS: PatchedAWS,
  init: init
};

var dynamo = new aws.DynamoDB();
var logged = [];

function PatchedAWS () {
  var o = monkey(aws, {
    sns: snsAction,
    lambda: lambdaAction,
    s3: s3Action
  });
  o.init = init;
  return o;
};

function init (functionArn) {
  global.LLTRACE_FUNCTION_ARN = functionArn;
}

function snsAction () {
  if (probable(10)) {
    var target = arguments[0].TopicArn || arguments[0].TargetArn;
    var key = format('%s-%s-%s', global.LLTRACE_FUNCTION_ARN, target, 'sns');
    if (logged.indexOf(key) === -1) {
      logged.push(key);

      dynamo.putItem({
        TableName: 'lltrace',
        Item: {
          Caller: { S: global.LLTRACE_FUNCTION_ARN },
          Target: { S: target },
          Type: { S: 'sns' }
        }
      }, function (err, data) {});
    }
  }
}

function lambdaAction () {
  if (probable(10)) {
    var target = arguments[0].FunctionName;
    var key = format('%s-%s-%s', global.LLTRACE_FUNCTION_ARN, target, 'lambda');
    if (logged.indexOf(key) === -1) {
      logged.push(key);

      dynamo.putItem({
        TableName: 'lltrace',
        Item: {
          Caller: { S: global.LLTRACE_FUNCTION_ARN },
          Target: { S: target },
          Type: { S: 'lambda' }
        }
      }, function (err, data) {});
    }
  }
}

function s3Action () {
  if (probable(10)) {
    var target = arguments[0].Bucket;
    var key = format('%s-%s-%s', global.LLTRACE_FUNCTION_ARN, target, 's3');
    if (logged.indexOf(key) === -1) {
      logged.push(key);

      dynamo.putItem({
        TableName: 'lltrace',
        Item: {
          Caller: { S: global.LLTRACE_FUNCTION_ARN },
          Target: { S: target },
          Type: { S: 's3' }
        }
      }, function (err, data) {});
    }
  }
}

function probable (n) {
  return Math.floor(Math.random() * 100) < n;
}
