# Pinecone Lambda Service

This Lambda function provides an API for interacting with Pinecone vector database, with enhanced logging capabilities.

## Features

- Store recipes with vector embeddings
- Search recipes by title or vector similarity
- Delete recipes
- Comprehensive structured logging

## Logging

The service includes a structured logging system with the following log levels:

- **INFO**: General operational information
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging information (disabled by default)

### Log Format

All logs are output in JSON format with the following structure:

```json
{
  "level": "INFO|ERROR|DEBUG",
  "timestamp": "ISO timestamp",
  "message": "Log message",
  "data": { /* Additional contextual data */ }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PINECONE_API_KEY | Pinecone API key | Required |
| PINECONE_ENVIRONMENT | Pinecone environment | Required |
| PINECONE_INDEX | Pinecone index name | Required |
| PINECONE_NAMESPACE | Pinecone namespace | Required |
| DEBUG_LOGGING | Enable debug level logs | false |

## API Gateway Configuration

To enable API Gateway logging:

1. In the API Gateway console, select your API
2. Go to Stages > Your Stage > Logs/Tracing
3. Enable CloudWatch Logs
4. Set Log Level to INFO or ERROR
5. Enable Detailed CloudWatch Metrics
6. Enable X-Ray Tracing (optional)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Package for deployment
npm run package
```