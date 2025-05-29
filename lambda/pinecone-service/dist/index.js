"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const logger = {
    info: (message, data) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            data: data || {}
        }));
    },
    error: (message, error) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            error: error ? (error.stack || error.message || String(error)) : undefined
        }));
    },
    warn: (message, data) => {
        console.warn(JSON.stringify({
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            data: data || {}
        }));
    },
    debug: (message, data) => {
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
// Log Pinecone configuration (without sensitive data)
logger.info('Initializing Pinecone service', {
    index: process.env.PINECONE_INDEX,
    namespace: process.env.PINECONE_NAMESPACE,
    hasApiKey: !!process.env.PINECONE_API_KEY
});
// Validate required environment variables
if (!process.env.PINECONE_API_KEY) {
    logger.error('Missing PINECONE_API_KEY environment variable');
}
if (!process.env.PINECONE_INDEX) {
    logger.error('Missing PINECONE_INDEX environment variable');
}
// Initialize Pinecone client - for version 6.0.1
const pinecone = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY || ''
});
// Get index reference
const indexName = process.env.PINECONE_INDEX || '';
const namespace = process.env.PINECONE_NAMESPACE || '';
const index = pinecone.index(indexName);
const handler = async (event) => {
    // Extract HTTP method from the event structure for HTTP API
    const httpMethod = event.requestContext?.http?.method || 'UNKNOWN';
    // Log incoming request
    logger.info('Received API request', {
        httpMethod: httpMethod,
        path: event.rawPath,
        routeKey: event.routeKey,
        requestId: event.requestContext?.requestId,
        sourceIp: event.requestContext?.http?.sourceIp
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
    if (httpMethod === 'OPTIONS') {
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
        // Verify Pinecone connection before processing requests
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
            logger.error('Missing required Pinecone configuration');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    message: 'Server configuration error: Pinecone not properly configured',
                    details: {
                        hasApiKey: !!process.env.PINECONE_API_KEY,
                        hasIndex: !!process.env.PINECONE_INDEX
                    }
                })
            };
        }
        const body = event.body;
        const queryStringParameters = event.queryStringParameters;
        switch (httpMethod) {
            case 'POST':
                if (!body) {
                    logger.error('Empty request body');
                    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Request body is required' }) };
                }
                let requestData;
                try {
                    requestData = JSON.parse(body);
                }
                catch (e) {
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
                        const results = await index.namespace(namespace).query({ ...queryParams });
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
                    const queryParams = {
                        vector: embedding,
                        topK: limit,
                        includeMetadata: true,
                        includeValues: false
                    };
                    if (filters) {
                        const filterConditions = {};
                        if (filters.cuisine)
                            filterConditions.cuisine = { $eq: filters.cuisine };
                        if (filters.mealType)
                            filterConditions.mealType = { $eq: filters.mealType };
                        if (filters.dietaryInfo)
                            filterConditions.dietaryInfo = { $eq: filters.dietaryInfo };
                        if (Object.keys(filterConditions).length > 0) {
                            queryParams.filter = filterConditions;
                            logger.debug('Applied filters', { filterConditions });
                        }
                    }
                    const results = await index.namespace(namespace).query({ ...queryParams });
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
        }
        catch (e) {
            action = 'unparseable';
        }
        logger.info('Invalid request received', { httpMethod, action });
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request' }) };
    }
    catch (error) {
        // Check for Pinecone connection errors specifically
        if (error.name === 'PineconeConnectionError' || error.message?.includes('Pinecone')) {
            logger.error('Pinecone connection error', {
                errorName: error.name,
                errorMessage: error.message,
                pineconeConfig: {
                    index: process.env.PINECONE_INDEX,
                    hasApiKey: !!process.env.PINECONE_API_KEY
                }
            });
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    message: 'Error connecting to Pinecone service',
                    details: 'Please check Lambda environment variables and Pinecone service status',
                    requestId: event.requestContext?.requestId
                })
            };
        }
        // Handle other errors
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
exports.handler = handler;
