#!/bin/bash
# Runs automatically inside the LocalStack container once it's ready.
# Idempotent: mb fails harmlessly if the bucket already exists (persistence on).
awslocal s3 mb s3://gif-library || true
echo "Bucket gif-library ready."
