# Gabriel Fialho NFT Gallery (Backend)

Backend system of the nft gallery ("Where is My NFT?"), a website where people can see NFTs from different users and customize their own collection. The technologies used are:

- Typescript as language
- Esbuild for building
- Github Actions for ci/cd
- ApiGateway + AWS Lambda for endpoints
- AWS RDS postgresql for database
- Prisma for database connection
- AWS Serverless Framework + AWS Cloudformation for infrastructure
- AWS S3 for API documentation hosting
- Swagger for automatic API documentation generation
- AWS Parameter Store for secrets management
- Serverless offline for running locally
- Jest for testing
- AWS Cli for CI/CD

This system is splitted into modules, each one with a specific function.

## Infrastructure

All infrastructure is written explicitly in the repository, in folders:
`sls/functions` and `sls/resources`

Inside `sls/functions` we have two API endpoints, one for getting user's account and another one for updating user's account.
In addition, inside `sls/resources` we have the IaC (Infrastructure as Code) of the RDS database with all the network resources needed (vpc, subnet, internet gateway, route table, ...), and we also have the code to create the parameter store for the database secrets, and finally the creation of the s3 bucket where we store the API documentation.

The system is built using a serverless architecture, which means that it scales automatically and it's cost and performance are optimized.

## Functions

The typescript code is in `src/functions/api` for both `getAccount` and `updateAccount` API endpoints.

1. `getAccount` - this endpoint is responsible for returning user informations stored on the database, it receives the address in the path and returns informations about the user preferences such as:

- primary color: primary color to show user's collection
- secondary color: secondary color to show user's collection
- nickname: name to show on user's collection page
- description: description to show on user's collection page

2. `updateAccount` - endpoint to create or update users preferences shown above. This endpoint verifies the web3 message signature to make sure that the one that is calling is the owner of the account.

## Documentation

The documentation is generated automatically using the plugin `serverless-openapi-documenter`, you can check the code in `sls/documentation`.
In addition, a AWS S3 bucket was created to host a website containing the system's documentation, and it is updated automatically whenever the codebase is updated.
In fact, when there is a push on the branch `dev`, the github pipeline is triggered and the updated documentation is generated, uploaded to the s3 bucket and the website is refreshed.
The documentation is on:

http://points-swagger-dev.s3-website-us-east-1.amazonaws.com/

## CI/CD

The deployment system is composed of a Github Action which is triggered whenever a change happens on the `dev` branch. Furthermore, this action is responsible for updating the backend system on the AWS and also to update the documentation, you can check its code on: `.github/workflows/deploy-dev.yml`

## How to test

You can test the system by running:

`npm run test`

## How to run

1. Install all dependencies:
   `npm install`

2. Log in AWS using aws cli:
   `sls configure`

3. Run the server:
   `sls offline -s dev`
