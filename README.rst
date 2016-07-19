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

``require('lltrace-aws-sdk').init(context.invokedFunctionArn);``

All existing code making use of the ``aws`` object should continue working normally.


Requirements
############

- Create a DynamoDB table with the name ``lltrace`` with Primary Key set to:
  1. Partition key ``Caller`` of type String
  2. Sort key ``Target`` of type String
- Lambdas using this library need to be able to write to DynamoDB


Under the hood
##############

SNS publish, Lambda invoke and S3 upload operations are traced at the moment.

The appropriate methods are monkey-patched to log the name of the lambda function and what it's doing to DynamoDB (only a subset of all operations are logged, 10% by default).

The entries in DynamoDB can then be used to create the map of the lambdas and how they communicate (SNS, direct invocations etc) and what triggers different lambdas (SNS, S3 events etc).
