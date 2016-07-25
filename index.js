var aws = require('aws-sdk');
var monkey = require('./monkey');
var format = require('util').format;

module.exports = {
  AWS: PatchedAWS,
  init: init,
  traceCustom: traceCustom
};

var dynamo = new aws.DynamoDB();
var s3 = new aws.S3();

var logged = [];

var TRACE_PROBABILITY = process.env.TRACE_PROBABILITY || 10;

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
  global.LLTRACE_REGION = functionArn.split(':')[3];
  global.LLTRACE_ACCOUNT = functionArn.split(':')[4];
}

function trace(target, type, caller) {
  if (!probable(TRACE_PROBABILITY)) {
    return;
  }

  var key = format('%s-%s-%s', global.LLTRACE_FUNCTION_ARN, target, type);

  if (logged.indexOf(key) > -1) {
    return;
  }

  logged.push(key);

  caller = caller || global.LLTRACE_FUNCTION_ARN || 'unknown';

  var item = {
    Caller: caller || global.LLTRACE_FUNCTION_ARN,
    Target: target,
    Type: type,
    Timestamp: Date.now()
  };

  s3.putObject({
    Bucket: format('lltrace-%s', global.LLTRACE_ACCOUNT),
    Key: format('%s/%s', global.LLTRACE_REGION, target),
    Body: JSON.stringify(item, null, 4),
    ContentType: 'application/json'
  }, function (err, data) {});

  dynamo.putItem({
    TableName: 'lltrace',
    Item: {
      Caller: { S: caller },
      Target: { S: target },
      Type: { S: type },
      Timestamp: { N: String(item.Timestamp) }
    }
  }, function (err, data) {});
}

function snsAction () {
  var target = arguments[0].TopicArn || arguments[0].TargetArn;
  trace(target, 'sns');
}

function lambdaAction () {
  var qualifier = arguments[0].Qualifier ? ':' + arguments[0].Qualifier : '';
  var target = arguments[0].FunctionName + qualifier;
  trace(target, 'lambda');
}

function s3Action () {
  var target = arguments[0].Bucket;
  trace(target, 's3');
}

function traceCustom (opts) {
  opts = opts || {};
  var caller = opts.caller || global.LLTRACE_FUNCTION_ARN || 'unknown';
  var target = opts.target;
  var type = opts.type || 'unknown';
  trace(target, type, caller);
}

function probable (n) {
  return Math.floor(Math.random() * 100) < n;
}
