function monkey(AWS, actionMap) {
  actionMap = actionMap || {};

  //
  // wrap SNS:
  //
  var OriginalSNS = AWS.SNS;
  AWS.SNS = function () {
    var sns = new OriginalSNS(arguments);

    var originalPublish = sns.publish;
    sns.publish = function () {
      if (actionMap.sns) {
        actionMap.sns.apply(this, arguments);
      }
      originalPublish.apply(this, arguments);
    };

    return sns;
  };

  //
  // wrap Lambda:
  //
  var originalLambda = AWS.Lambda;
  AWS.Lambda = function () {
    var lambda = new originalLambda(arguments);

    var originalInvoke = lambda.invoke;
    lambda.invoke = function () {
      if (actionMap.lambda) {
        actionMap.lambda.apply(this, arguments);
      }
      originalInvoke.apply(this, arguments);
    };

    return lambda;
  };

  //
  // wrap S3:
  //
  var originalS3 = AWS.S3;
  AWS.S3 = function () {
    var s3 = new originalS3(arguments);

    var originalUpload = s3.upload;
    s3.upload = function () {
      if (actionMap.s3) {
        actionMap.s3.apply(this, arguments);
      }
      originalUpload.apply(this, arguments);
    };
    return s3;
  };

  AWS.S3.ManagedUpload = originalS3.ManagedUpload;

  return AWS;
}

module.exports = monkey;
