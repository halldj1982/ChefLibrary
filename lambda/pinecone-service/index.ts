import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Pinecone } from '@pinecone-database/pinecone';

// Configure logging utility
type Logger = {
  info: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
  warn: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
};

const logger: Logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      data: data || {}
    }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error ? (error.stack || error.message || String(error)) : undefined
    }));
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      data: data || {}
    }));
  },
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG_LOGGING === 'true') {
      console.log(JSON.stringify({
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        data: data || {}
      }));
    }
  }
};

logger.info('Initializing Pinecone service', {
  environment: process.env.PINECONE_ENVIRONMENT,
  index: process.env.PINECONE_INDEX,
  namespace: process.env.PINECONE_NAMESPACE
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_ENVIRONMENT || ''
});

const index = pinecone.index(process.env.PINECONE_INDEX || '');
const namespace = process.env.PINECONE_NAMESPACE || '';

// Removed getResponseHeaders function as we're handling headers directly in the handler

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log incoming request
  logger.info('Received API request', {
    httpMethod: event.httpMethod,
    path: event.path,
    queryParams: event.queryStringParameters,
    requestId: event.requestContext?.requestId,
    sourceIp: event.requestContext?.identity?.sourceIp
  });
  
  // Get origin from request headers
  const origin = event.headers?.origin || event.headers?.Origin || 'https://main.dymhmcupnyjl5.amplifyapp.com';
  
  // Define CORS headers directly
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,Origin,Accept',
    'Content-Type': 'application/json'
  };
  
  logger.debug('Request details', { 
    headers: event.headers,
    origin: origin,
    body: event.body ? (event.body.startsWith('{') ? JSON.parse(event.body) : event.body) : null 
  });

  // Handle OPTIONS requests immediately, before any other processing
  if (event.httpMethod === 'OPTIONS') {
    logger.info('Handling OPTIONS preflight request');
    // Return specific headers for OPTIONS requests
    return { 
      statusCode: 204, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,Origin,Accept',
        'Access-Control-Max-Age': '86400'
      }, 
      body: ''
    };
  }

  try {
    const { httpMethod, body, queryStringParameters } = event;

    switch (httpMethod) {
      case 'POST':
        if (!body) {
          logger.error('Empty request body');
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Request body is required' }) };
        }
        
        let requestData;
        try {
          requestData = JSON.parse(body);
        } catch (e) {
          logger.error('Invalid JSON in request body', e);
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON in request body' }) };
        }
        
        if (requestData.action === 'store') {
          logger.info('Processing store action', { 
            recipeId: requestData.recipe.id,
            title: requestData.recipe.title
          });
          
          await index.namespace(namespace).upsert([{
            id: requestData.recipe.id,
            values: requestData.recipe.embedding,
            metadata: {
              title: requestData.recipe.title,
              cuisine: requestData.recipe.cuisine || '',
              mealType: Array.isArray(requestData.recipe.mealType) ? requestData.recipe.mealType.join(',') : String(requestData.recipe.mealType || ''),
              dietaryInfo: Array.isArray(requestData.recipe.dietaryInfo) ? requestData.recipe.dietaryInfo.join(',') : String(requestData.recipe.dietaryInfo || ''),
              ingredients: requestData.recipe.ingredients.join(',')
            }
          }]);
          
          logger.info('Recipe stored successfully', { recipeId: requestData.recipe.id });
          return { statusCode: 200, headers, body: JSON.stringify({ message: 'Recipe stored successfully' }) };
        }
        
        if (requestData.action === 'search') {
          // Log the full request data for debugging
          logger.debug('Search request data', requestData);
          
          // Check if searching by title
          if (requestData.title) {
            logger.info('Processing title search', { title: requestData.title });
            
            // Search by title using metadata filter
            const queryParams = {
              vector: new Array(1536).fill(0), // Dummy vector
              topK: 10,
              includeMetadata: true,
              includeValues: false,
              filter: {
                title: { $eq: requestData.title }
              }
            };
            
            const results = await index.namespace(namespace).query(queryParams);
            logger.info('Title search completed', { 
              title: requestData.title,
              resultsCount: results.matches.length 
            });
            
            return { statusCode: 200, headers, body: JSON.stringify(results.matches) };
          }

          // Check if embedding exists
          if (!requestData.embedding || !Array.isArray(requestData.embedding)) {
            logger.error('Missing or invalid embedding in search request', { 
              hasEmbedding: !!requestData.embedding,
              embeddingType: typeof requestData.embedding
            });
            return { 
              statusCode: 400, 
              headers, 
              body: JSON.stringify({ 
                message: 'Search request requires a valid embedding vector',
                requestData: requestData
              }) 
            };
          }

          // Search by vector similarity
          const { embedding, limit = 10, filters } = requestData;
          logger.info('Processing vector search', { 
            embeddingLength: embedding.length,
            limit,
            filters: filters || 'none'
          });
          
          const queryParams: any = {
            vector: embedding,
            topK: limit,
            includeMetadata: true,
            includeValues: false
          };

          if (filters) {
            const filterConditions: any = {};
            if (filters.cuisine) filterConditions.cuisine = { $eq: filters.cuisine };
            if (filters.mealType) filterConditions.mealType = { $eq: filters.mealType };
            if (filters.dietaryInfo) filterConditions.dietaryInfo = { $eq: filters.dietaryInfo };
            if (Object.keys(filterConditions).length > 0) {
              queryParams.filter = filterConditions;
              logger.debug('Applied filters', { filterConditions });
            }
          }

          const results = await index.namespace(namespace).query(queryParams);
          logger.info('Vector search completed', { resultsCount: results.matches.length });
          return { statusCode: 200, headers, body: JSON.stringify(results.matches) };
        }
        break;

      case 'DELETE':
        const recipeId = queryStringParameters?.recipeId;
        if (!recipeId) {
          logger.error('Missing recipe ID in DELETE request');
          throw new Error('Recipe ID is required');
        }
        
        logger.info('Processing delete request', { recipeId });
        await index.namespace(namespace).deleteOne(recipeId);
        logger.info('Recipe deleted successfully', { recipeId });
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Recipe deleted successfully' }) };
    }

    let action = '';
    try {
      action = body ? JSON.parse(body).action : 'none';
    } catch (e) {
      action = 'unparseable';
    }
    logger.info('Invalid request received', { httpMethod, action });
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request' }) };
  } catch (error: any) {
    logger.error('Error processing request', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        requestId: event.requestContext?.requestId
      })
    };
  }
};