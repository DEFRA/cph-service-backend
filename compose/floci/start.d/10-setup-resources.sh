#!/bin/bash

# S3 buckets
aws s3 mb s3://cph-geospatial-data --endpoint-url http://localhost:4566
aws s3 cp /geospatial-data/ s3://cph-geospatial-data/ --recursive --endpoint-url http://localhost:4566

# SQS queues
aws sqs create-queue --queue-name cph-form --endpoint-url http://localhost:4566
