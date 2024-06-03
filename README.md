# Points Service

This project is a serverless application for managing points, built using TypeScript and the AWS Serverless framework. Below is an overview of the resources utilized and their purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- Serverless Framework
- AWS CLI

## Setup

1. Clone the repository.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure AWS credentials:

   ```bash
   aws configure
   ```

4. Deploy the service:

   ```bash
   serverless deploy --stage dev
   ```

## AWS Resources

### Lambda Functions

Lambda functions are used to handle the core logic of the service. They are defined to manage different aspects of the points system, such as adding points, creating projects, and retrieving points. The functions are defined in separate YAML files for better organization and maintainability.

- `addPoints.yml`
- `createProject.yml`
- `getPoints.yml`
- `authorizer.yml`

### RDS (Relational Database Service)

RDS is used to store and manage relational data. In this project, PostgreSQL is used as the database to store points-related data. RDS provides a scalable, highly available, and secure database solution, which is crucial for ensuring data integrity and performance.

- `database.yml`: Defines the PostgreSQL database configuration.
- `vpc.yml`: Sets up a Virtual Private Cloud (VPC) for the RDS instance to enhance security by isolating it from the public internet.

### S3 (Simple Storage Service)

S3 is utilized for storing and serving static assets, such as OpenAPI documentation. It provides a scalable, durable, and secure storage solution that is cost-effective for handling large amounts of static data.

- `swaggerBucket.yml`: Configures an S3 bucket for storing the Swagger API documentation.
- `bucketPolicy.yml`: Defines the access policies for the S3 bucket to ensure that only authorized users can access the stored documents.

### API Gateway

API Gateway is used to expose the Lambda functions as RESTful APIs. It acts as the front door for the service, enabling it to handle HTTP requests and responses. API Gateway provides features like authorization, request validation, and response transformation.

- `response.yml`: Configures custom responses for the API Gateway to standardize the API responses across different endpoints.

### Parameter Store (AWS Systems Manager)

Parameter Store is used to manage configuration data and secrets securely. It allows storing and retrieving parameter values, such as database credentials, in a secure and scalable manner.

- `database.yml`: Defines parameters related to the database configuration, including credentials and connection details.

### Plugins

Several Serverless Framework plugins are used to enhance the development and deployment process:

- **serverless-openapi-documenter**: Generates OpenAPI documentation for the endpoints, providing a standardized way to document the API.
- **serverless-esbuild**: Translates TypeScript to JavaScript, optimizing the Lambda functions for deployment.
- **serverless-prune-plugin**: Deletes past Lambda versions to save space and reduce costs.
- **serverless-offline**: Allows running the service locally for testing, speeding up the development process by providing a local simulation of the AWS environment.

## Environment Variables

Environment variables are used to configure the service dynamically based on the deployment stage (e.g., development, production). They include sensitive information such as database credentials, which are stored securely in AWS Systems Manager Parameter Store.

Ensure the necessary parameters are set in your AWS account:

- `/rds/password`: Stores the database password.
- `/rds/host-dev`: Stores the database host for the development stage.
- `/rds/host-prod`: Stores the database host for the production stage.

## Prisma ORM

Prisma is a modern database toolkit and Object-Relational Mapping (ORM) that simplifies database interactions and enhances developer productivity. Here's why Prisma is used in the Points Service:

### 1. **Type Safety and Autocompletion**

Prisma generates a type-safe client based on the database schema. This provides autocompletion and compile-time type checking, which significantly reduces the chances of runtime errors and improves development speed.

### 2. **Schema Management**

Prisma uses a schema file (`schema.prisma`) to define the data model and relationships in the database. This schema file acts as a single source of truth, making it easy to manage and visualize the database structure.

### 3. **Migrations**

Prisma provides a powerful migration system that allows for versioning of the database schema. This ensures that database changes are tracked, reproducible, and easily deployable across different environments.

### 4. **Query Optimization**

Prisma translates TypeScript/JavaScript queries into efficient SQL queries, optimizing them for performance. This abstraction allows developers to focus on business logic without worrying about database-specific optimizations.

### 5. **Ease of Integration**

Prisma integrates seamlessly with TypeScript and the Serverless Framework. It provides a simple API for querying the database, which fits well with the Lambda functions in the Points Service.

### 6. **Developer Experience**

Prisma improves the developer experience by providing clear and concise documentation, a visual database schema editor, and a powerful CLI for database management. These tools streamline the development process and enhance productivity.

### 7. **Database Agnosticism**

While this project uses PostgreSQL, Prisma supports multiple databases, including MySQL, SQLite, and SQL Server. This flexibility allows for easy migration to different database systems if required in the future.

### 8. **Data Validation**

Prisma enforces data validation rules defined in the schema, ensuring that only valid data is stored in the database. This helps maintain data integrity and reduces the likelihood of bugs caused by invalid data.

### Integration in the Project

In the `serverless.yml` configuration, Prisma is integrated as part of the build process through the `serverless-esbuild` plugin. The `packagerOptions` in the custom section includes a script to generate Prisma client:

```yaml
custom:
  esbuild:
    target: "node18"
    bundle: true
    minify: false
    packagerOptions:
      scripts:
        - npx prisma generate
```

This ensures that the Prisma client is generated and included in the Lambda functions during the build process. The generated client is then used within the Lambda functions to interact with the database.

### Authorization

The purpose of this custom authorizer Lambda function is to control access to AWS API Gateway endpoints by validating API keys. It ensures that only authorized users can invoke the API methods, enhancing the security of the service.

### How It Works

1. **Authentication Token Verification**:

   - The function receives an API key (provided in the `Authorization` header of the request) and verifies its validity.
   - The API key is hashed to ensure secure storage and comparison.

2. **Database Lookup**:

   - The function checks the hashed API key against entries in a database to see if it corresponds to a valid project or user.
   - If the hash matches a record in the database, it means the API key is valid and belongs to an authorized user or project.

3. **Policy Document Generation**:
   - Based on the outcome of the database lookup, the function generates an IAM policy document that either allows or denies access to the requested API endpoint.
   - If the API key is valid, the policy document grants access (`Effect: "Allow"`). If not, it denies access (`Effect: "Deny"`).

### Why Use a Custom Authorizer

1. **Enhanced Security**:
   - By using a custom authorizer, you can implement complex logic for authentication and authorization beyond simple token validation, such as checking against a database or incorporating business rules.
2. **Centralized Authorization Logic**:

   - The custom authorizer centralizes the authorization logic in a single Lambda function, making it easier to manage and update.

3. **Flexibility**:

   - You can customize the logic to fit specific requirements, such as supporting multiple types of authentication methods or integrating with external identity providers.

4. **Separation of Concerns**:
   - The custom authorizer separates the authorization logic from the core business logic of the API endpoints, leading to cleaner and more maintainable code.

### Use Cases

- **API Key Management**: Ensuring that only clients with valid API keys can access the API.
- **Multi-Tenant Applications**: Validating that requests are made by users belonging to the correct tenant or project.
- **Role-Based Access Control (RBAC)**: Implementing custom rules for different user roles and permissions.

### Create Project

This AWS Lambda function handles the creation of a new project in the system. It generates a unique API key for the project, stores a hashed version of this key in the database, and returns the API key and project ID to the client. This function is used to onboard new projects by providing them with credentials to interact with the system.

#### Security Considerations

- Hashing API Keys: By storing hashed API keys in the database, the system ensures that even if the database is compromised, the plain API keys are not exposed.
- UUID for API Keys: Using randomUUID ensures that the API keys are unique and difficult to guess, enhancing security.
- Consistent Error Handling: The function returns appropriate HTTP status codes and messages, helping clients understand and handle errors effectively.

### Add Points

This AWS Lambda function handles the addition of points to a user's balance for a specific event within a project. It ensures that users and their balances are properly managed in the database, updating existing records or creating new ones as necessary.

## Get Points

This AWS Lambda function retrieves the balance of a user for a specific event or the total balance across all events within a project. The function is designed to respond to HTTP GET requests, providing balance information based on query parameters and path parameters.

### CI/CD

#### GitHub Action

The purpose of this GitHub Action workflow is to automate the deployment process for the development branch of a project. It triggers whenever there's a push event on the master branch. The workflow executes a series of steps to deploy the project to an AWS environment, generate an OpenAPI documentation file, and upload it to an S3 bucket along with Swagger UI for visualization.

1. **Workflow Trigger**:

   - The workflow triggers on a `push` event to the `master` branch.

   ```yaml
   on:
     push:
       branches:
         - master
   ```

2. **Jobs**:

   - The workflow defines a single job named `deploy`.

   ```yaml
   jobs:
     deploy:
       name: deploy
       runs-on: ubuntu-latest
   ```

3. **Node.js Setup**:

   - The workflow sets up the Node.js environment using the specified version.

   ```yaml
   - name: Use Node.js ${{ matrix.node-version }}
     uses: actions/setup-node@v3
     with:
       node-version: ${{ matrix.node-version }}
   ```

4. **Deployment Steps**:

   - The workflow executes the following steps:
     - Checks out the repository.
     - Installs project dependencies using `npm ci`.
     - Installs the Serverless Framework globally.
     - Deploys the Serverless application to the development stage (`dev`) with verbose logging.
     - Generates the OpenAPI documentation using the `sls openapi generate` command.
     - Uploads the OpenAPI JSON file to an S3 bucket (`points-swagger-dev`) with the specified content type.
     - Downloads and extracts Swagger UI files.
     - Copies Swagger UI files to the specified directory.
     - Syncs the contents of the directory with the S3 bucket (`points-swagger-dev`).

   ```yaml
   - run: |
       npm ci
       export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
       export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
       sudo npm i -g serverless@3.6.0
       npm run test
       sls deploy -s dev --verbose
       sls openapi generate
       aws s3api put-object --bucket points-swagger-dev --key apis/points --content-type "application/json" --body openapi.json --debug
       wget https://github.com/swagger-api/swagger-ui/archive/refs/tags/v4.1.3.tar.gz
       tar -zxf v4.1.3.tar.gz
       cp swagger/* swagger-ui-4.1.3/dist/
       cd swagger-ui-4.1.3/dist/
       aws s3 sync . s3://points-swagger-dev
   ```

5. **Environment Variables**:

   - The workflow sets up environment variables for AWS credentials using GitHub Secrets.

   ```yaml
   env:
     AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
     AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
     AWS_EC2_METADATA_DISABLED: true
   ```

#### Use of GitHub Action and Workflow

- **Automation**: The workflow automates the deployment process, reducing manual intervention and ensuring consistency in deployments.
- **Continuous Integration/Continuous Deployment (CI/CD)**: It enables continuous integration and deployment of the project, allowing changes to be quickly deployed to the development environment.
- **S3 Bucket and Swagger UI Integration**: The workflow uploads OpenAPI documentation and Swagger UI to an S3 bucket, making it accessible for visualization and interaction.
- **Scalability**: By leveraging GitHub Actions, the workflow can scale to handle multiple deployments across different branches and environments.

### Jest Tests

Jest is used for unit testing all the functions in the service to ensure their correctness and reliability and it is also included in the CI/CD.
The test scripts are located in the tests directory, organized by function.
