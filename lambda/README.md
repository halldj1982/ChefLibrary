# Lambda Functions

## Pinecone Service

This Lambda function provides an API for interacting with Pinecone vector database.

### Building and Deploying

1. First, create the Pinecone dependencies layer:

   **For local Windows development:**
   ```
   cd lambda
   create-pinecone-layer-local.bat
   ```

   **For cloud deployment (Unix):**
   ```
   cd lambda
   bash create-pinecone-layer.sh
   ```

2. Build the Lambda function:

   **For local Windows development:**
   ```
   cd pinecone-service
   build-local.bat
   ```

   **For cloud deployment (Unix):**
   ```
   cd pinecone-service
   bash build.sh
   ```

3. Deploy using Terraform:
   ```
   cd ../terraform
   terraform apply
   ```

### Environment Variables

- `PINECONE_API_KEY`: Your Pinecone API key
- `PINECONE_INDEX`: The name of your Pinecone index
- `PINECONE_NAMESPACE`: The namespace within your Pinecone index
- `PINECONE_ENVIRONMENT`: The Pinecone environment (e.g., "gcp-starter")