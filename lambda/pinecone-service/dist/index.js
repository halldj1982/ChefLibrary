"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
// Configure logging utility
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
logger.info('Initializing Pinecone service', {
    environment: process.env.PINECONE_ENVIRONMENT,
    index: process.env.PINECONE_INDEX,
    namespace: process.env.PINECONE_NAMESPACE
});
const pinecone = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || ''
});
const index = pinecone.index(process.env.PINECONE_INDEX || '');
const namespace = process.env.PINECONE_NAMESPACE || '';
const headers = {
    'Access-Control-Allow-Origin': 'https://main.dwu6818qyj5l0.amplifyapp.com',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,origin,x-requested-with,accept,authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
};
const handler = async (event) => {
    // Log incoming request
    logger.info('Received API request', {
        httpMethod: event.httpMethod,
        path: event.path,
        queryParams: event.queryStringParameters,
        requestId: event.requestContext?.requestId,
        sourceIp: event.requestContext?.identity?.sourceIp
    });
    logger.debug('Request details', {
        headers: event.headers,
        body: event.body ? JSON.parse(event.body) : null
    });
    try {
        const { httpMethod, body, queryStringParameters } = event;
        if (httpMethod === 'OPTIONS') {
            logger.debug('Handling OPTIONS request');
            return { statusCode: 200, headers, body: '' };
        }
        switch (httpMethod) {
            case 'POST':
                const requestData = JSON.parse(body || '');
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
                    // Search by vector similarity
                    const { embedding, limit = 10, filters } = requestData;
                    logger.info('Processing vector search', {
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
        logger.info('Invalid request received', { httpMethod, action: JSON.parse(body || '{}').action });
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request' }) };
    }
    catch (error) {
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
