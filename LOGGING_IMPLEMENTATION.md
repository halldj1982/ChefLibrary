# API Gateway and Lambda Logging Implementation

This document summarizes the changes made to implement comprehensive logging for the API Gateway and Lambda code.

## Changes Made

### 1. Lambda Function Logging

We've implemented a structured logging system in the Lambda function with the following features:

- **Structured JSON Logs**: All logs are formatted as JSON objects with consistent fields, making them easier to parse and analyze.
- **Log Levels**: Three log levels (INFO, ERROR, DEBUG) for different types of information.
- **Contextual Data**: Each log includes relevant contextual data for better troubleshooting.
- **Timestamps**: ISO-formatted timestamps for accurate timing information.
- **Configurable Debug Logging**: Debug logs can be enabled/disabled via an environment variable.

### 2. Request Logging

- Added detailed logging for all incoming API requests, including:
  - HTTP method
  - Path
  - Query parameters
  - Request ID
  - Source IP
  - Headers (in debug mode)
  - Request body (in debug mode)

### 3. Operation Logging

Added specific logging for each operation:

- **Store Action**:
  - Log when a store action is received
  - Log recipe ID and title
  - Log successful storage

- **Search Action**:
  - Log when a search action is received
  - Log search parameters (title, filters)
  - Log search results count

- **Delete Action**:
  - Log when a delete action is received
  - Log recipe ID
  - Log successful deletion

### 4. Error Handling and Logging

- Enhanced error logging with:
  - Error message
  - Stack trace (when available)
  - Request ID for correlation
  - Contextual information about the operation

### 5. API Gateway Logging Configuration

Added documentation for configuring API Gateway logging:

- CloudWatch Logs integration
- Log level configuration
- Detailed metrics
- X-Ray tracing

### 6. Testing

Created comprehensive tests for the logging functionality:

- Tests for different log levels
- Tests for request logging
- Tests for operation-specific logging
- Tests for error logging
- Tests for debug logging configuration

### 7. Documentation

- Added detailed README with information about:
  - The logging system and its features
  - Log format and structure
  - Environment variables for configuration
  - API Gateway logging configuration instructions

## How to Use

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PINECONE_API_KEY | Pinecone API key | Required |
| PINECONE_ENVIRONMENT | Pinecone environment | Required |
| PINECONE_INDEX | Pinecone index name | Required |
| PINECONE_NAMESPACE | Pinecone namespace | Required |
| DEBUG_LOGGING | Enable debug level logs | false |

### API Gateway Configuration

To enable API Gateway logging:

1. In the API Gateway console, select your API
2. Go to Stages > Your Stage > Logs/Tracing
3. Enable CloudWatch Logs
4. Set Log Level to INFO or ERROR
5. Enable Detailed CloudWatch Metrics
6. Enable X-Ray Tracing (optional)

## Benefits

- **Improved Observability**: Better visibility into the application's behavior and performance.
- **Easier Troubleshooting**: Detailed logs make it easier to identify and fix issues.
- **Performance Monitoring**: Logs can be used to monitor performance and identify bottlenecks.
- **Security Auditing**: Request logs can be used for security auditing and compliance.
- **Operational Insights**: Logs provide insights into how the application is being used.

## Next Steps

- Consider integrating with a log aggregation service like CloudWatch Logs Insights, Elasticsearch, or Splunk.
- Set up alerts based on error logs or unusual patterns.
- Create dashboards to visualize log data and monitor application health.