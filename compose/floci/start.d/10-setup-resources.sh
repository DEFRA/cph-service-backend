#!/bin/bash

# S3 buckets
#aws s3 mb s3://my-bucket

# SQS queues
aws sqs create-queue --queue-name cph-form --endpoint-url http://localhost:4566
