# Zealy Code test #

> This project is based on a personal project starter that i have developed and uses the serverless framework and dynamodb, please make sure you have this installed globally `pnpm add -g serverless`

## How to run ##

- `pnpm install`
  - a post install script should download and install a local version of DynamoDB
  this can be inspected when the application is running by executing `pnpm run dynamodb-admin` in a second terminal session. The WebUi will be made available at `http://localhost:8000`
- `pnpm run start`
- send `POST` requests with tool of your choice to `http://localhost:3000/quest/claim/`

> NOTE: the body schema is checked for validity using zod

## Notes on testing ##

I never had enough time to implement automated testing for the handler but the next steps would be to export the handler without the middy middlewares and use jest to test different `access_conditions` and `submission_text`s mirroring the testing i did manually while developing.

## Note on dynamoDB ##

DynamoDB local persists the database to `.dynamodb/shared-local-instance.db` between executions.
