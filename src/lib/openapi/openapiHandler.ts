import { json, type Handle } from '@sveltejs/kit';
import { createRequest, createResponse, type Headers } from 'node-mocks-http';
import { createOpenApiHttpHandler } from 'trpc-openapi';
import { transformHeaders } from '@trpc/server/adapters/aws-lambda';
import { apiRouter } from '$lib/openapi/router';
import { createContext } from '$lib/openapi/context';
import { openApiDocument } from './document';

const openapiHandler = () => {
	const openApiHttpHandler = createOpenApiHttpHandler({
		router: apiRouter,
		createContext,
		responseMeta: undefined,
		onError: undefined,
		maxBodySize: undefined
	});

	const fn: Handle = async ({ event, resolve }) => {
		if (event.url.pathname === '/api/openapi.json') {
			return json(openApiDocument);
		}

		if (event.url.pathname.startsWith('/api') && event.url.pathname !== '/api/docs') {
			event.url.pathname = event.url.pathname.replace('/api', '');

			const headers: Headers = {};
			for (const [key, value] of event.request.headers) {
				headers[key.toLowerCase()] = value;
			}

			const req = createRequest({
				url: event.url.toString(),
				body: event.request.body || undefined,
				headers
			});

			const res = createResponse();

			await openApiHttpHandler(req, res);

			return json(JSON.parse(res._getData()), {
				status: res.statusCode,
				headers: transformHeaders(res._getHeaders())
			});
		}

		return resolve(event);
	};

	return fn;
};

export { openapiHandler };
