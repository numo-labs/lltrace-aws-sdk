var aws = require('aws-sdk');
var monkey = require('./monkey');
var format = require('util').format;

module.exports = {
  AWS: PatchedAWS,
  init: init
};

function PatchedAWS () {
  return monkey(aws, {
    sns: snsAction,
    lambda: lambdaAction
  });
};

function init (functionName) {
  global.LLTRACE_FUNCTION_NAME = functionName;
}

function snsAction () {
  if (probable(10)) {
    console.log(format('🙈  SNS: %s -> %s',
                       global.LLTRACE_FUNCTION_NAME,
                       arguments[0].TopicArn)); // FIXME: Could be TargetArn
  }
}

function lambdaAction () {
  if (probable(10)) {
    console.log(format('🙀  Lambda: %s -> %s',
                       global.LLTRACE_FUNCTION_NAME,
                       arguments[0].FunctionName));
  }
}

function probable(n) {
  return Math.floor(Math.random() * 100) < n;
}
