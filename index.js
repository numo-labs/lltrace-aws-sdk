var aws = require('aws-sdk');
var monkey = require('./monkey');
var format = require('util').format;

module.exports = {
  AWS: PatchedAWS,
  init: init
};

var dynamo = new aws.DynamoDB();

function PatchedAWS () {
  var o = monkey(aws, {
    sns: snsAction,
    lambda: lambdaAction,
    s3: s3Action
  });
  return o;
};

function init (functionName) {
  global.LLTRACE_FUNCTION_NAME = functionName;
}

function snsAction () {
  if (probable(10)) {
    var uid = format('%s-%s-%s',
                     global.LLTRACE_FUNCTION_NAME,
                     process.hrtime(),
                     Math.ceil(Math.random() * 100));
    dynamo.putItem({
      Item: {
        uid: {S: uid},
        lambda: {S: global.LLTRACE_FUNCTION_NAME},
        type: {S: 'sns'},
        destination: {S: arguments[0].TopicArn} // FIXME: Could be TargetArn too
      },
      TableName: 'lltracer'
    }, function (err, data) {});
  }
}

function lambdaAction () {
  if (probable(10)) {
    var uid = format('%s-%s-%s',
                     global.LLTRACE_FUNCTION_NAME,
                     process.hrtime(),
                     Math.ceil(Math.random() * 100));
    dynamo.putItem({
        Item: {
            uid: {S: uid },
            lambda: {S: global.LLTRACE_FUNCTION_NAME},
            type: {S: 'lambda'},
            destination: {S: arguments[0].FunctionName }
        },
        TableName: 'lltracer'
    }, function (err, data) {});
  }
}

function s3Action () {
  if (probable(10)) {
    var uid = format('%s-%s-%s',
                     global.LLTRACE_FUNCTION_NAME,
                     process.hrtime(),
                     Math.ceil(Math.random() * 100));
    dynamo.putItem({
        Item: {
            uid: {S: uid },
            lambda: {S: global.LLTRACE_FUNCTION_NAME},
            type: {S: 's3'},
            destination: {S: arguments[0].Bucket }
        },
        TableName: 'lltracer'
    }, function (err, data) {});
  }
}

function probable (n) {
  return Math.floor(Math.random() * 100) < n;
}


// -----------------------%-

if (require.main) {
  var AWS = new PatchedAWS();
  var sns = new AWS.SNS();
  //console.log(sns);
  sns.publish({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('All good');
    }
  });

  var lambda = new AWS.Lambda();
  lambda.invoke({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('All good');
    }
  });

  var s3 = new AWS.S3();
  s3.upload({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('All good');
    }
  });
}
