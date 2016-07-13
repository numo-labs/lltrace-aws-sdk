lltrace-aws-sdk
***************

Purpose
#######

This is (almost) a drop-in replacement for ``aws-sdk`` to be used in AWS Lambda functions.

Some of the methods are monkey-patched to allow for the activity of lambda functions to be traced.

Usage
#####

In your lambda, instead of this:

``var aws = require('aws-sdk');``

Do this:

``var aws = require('lltrace-aws-sdk').AWS;``

And then at the top of the ``handler`` function:

``require('lltrace-aws-sdk').init(context.functionName);``

All existing code making use of the ``aws`` will continue working normally.


Requirements
############

- Create a DynamoDB table with the name ``lltracer``
- Lambdas using this library need to be able to write to DynamoDB


What it does
############

SNS publish and Lambda invoke operations are traced at the moment.

The appropriate methods are monkey patched to log the name of the lambda function and the topic it's sending a message to / the name of the other lambda function being invoked.

The logs are published to CloudWatch and are used to visualize the map of the lambdas and how they communicate (SNS, direct invocations etc) and what triggers different lambdas (SNS, S3 events etc).
