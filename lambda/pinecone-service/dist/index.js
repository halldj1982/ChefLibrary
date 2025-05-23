"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const pinecone = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || ''
});
const index = pinecone.index(process.env.PINECONE_INDEX || '');
const namespace = process.env.PINECONE_NAMESPACE || '';
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type'
};
const handler = async (event) => {
    try {
        const { httpMethod, body, queryStringParameters } = event;
        if (httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
        }
        switch (httpMethod) {
            case 'POST':
                const requestData = JSON.parse(body || '');
                if (requestData.action === 'store') {
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
                    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Recipe stored successfully' }) };
                }
                if (requestData.action === 'search') {
                    const { embedding, limit = 10, filters } = requestData;
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
                        }
                    }
                    const results = await index.namespace(namespace).query(queryParams);
                    return { statusCode: 200, headers, body: JSON.stringify(results.matches) };
                }
                break;
            case 'DELETE':
                const recipeId = queryStringParameters?.recipeId;
                if (!recipeId)
                    throw new Error('Recipe ID is required');
                await index.namespace(namespace).deleteOne(recipeId);
                return { statusCode: 200, headers, body: JSON.stringify({ message: 'Recipe deleted successfully' }) };
        }
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request' }) };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal server error', error: error.message })
        };
    }
};
exports.handler = handler;
