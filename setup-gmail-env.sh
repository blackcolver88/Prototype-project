#!/bin/bash

# Gmail credentials
export EMAIL_USERNAME="khchimmadi.moemen@gmail.com"
export EMAIL_PASSWORD="yxwiklzzubuqziwz"

echo "Environment variables set:"
echo "EMAIL_USERNAME: $EMAIL_USERNAME"
echo "EMAIL_PASSWORD is set: $(if [ -n \"$EMAIL_PASSWORD\" ]; then echo \"yes\"; else echo \"no\"; fi)"

# Note: Run this script with 'source setup-gmail-env.sh' to set variables in your current shell
echo "Remember to run this script with 'source setup-gmail-env.sh'"
