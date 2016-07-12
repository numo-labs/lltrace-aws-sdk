function monkey(AWS, actionMap) {
  actionMap = actionMap || {};

  //
  // wrap SNS:
  //
  var OriginalSNS = AWS.SNS;
  AWS.SNS = function() {
    var sns = new OriginalSNS(arguments);

    var originalPublish = sns.publish;
    sns.publish = function() {
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
  AWS.Lambda = function() {
    var lambda = new originalLambda();

    var originalInvoke = lambda.invoke;
    lambda.invoke = function() {
      if (actionMap.lambda) {
        actionMap.lambda.apply(this, arguments);
      }
      originalInvoke.apply(this, arguments);
    };

    return lambda;
  };

  return AWS;
}

module.exports = monkey;

// -----------------------%-

if (require.main) {
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
}
