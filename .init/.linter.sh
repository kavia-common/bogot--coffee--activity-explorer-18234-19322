#!/bin/bash
cd /home/kavia/workspace/code-generation/bogot--coffee--activity-explorer-18234-19322/frontend_web_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

