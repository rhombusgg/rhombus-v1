import { generateOpenApiDocument } from 'trpc-openapi';
import { apiRouter } from './router';

export const openApiDocument = generateOpenApiDocument(apiRouter, {
	title: 'Rhombus API',
	version: '0.0.1',
	baseUrl: 'http://localhost:5173/api',
	description:
		'OpenAPI documentation for Rhombus CTFs. Download the raw json schema at <a href="/api/openapi.json">/api/openapi.json</a> for use with other tools. Authorize with Bearer API tokens given from your <a href="/account">account</a>.'
});
