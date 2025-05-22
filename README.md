# Recipe Extractor App

A web application that allows users to upload photos of recipes, extract text using OpenAI's vision capabilities, analyze the recipe content, and store it in a searchable database. Users can search for recipes using natural language and generate meal plans.

## Features

- Photo upload and recipe text extraction using OpenAI's vision API
- Automatic metadata tagging for recipes (cuisine style, ingredients, main or side, etc.)
- Vector database storage using Pinecone for efficient searching
- Natural language search interface
- Single or Weekly meal planning functionality
- Ability to save created meal plans
- Mobile-friendly responsive design

## Tech Stack

- Frontend: Angular 19
- AI: OpenAI API (GPT-4 Vision and text models)
- Vector Database: Pinecone
- Document Database: AWS DynamoDB
- Styling: Bootstrap for responsive design

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables for OpenAI API, Pinecone, and AWS DynamoDB
4. Run the development server with `ng serve`
5. Open your browser to `http://localhost:4200`
