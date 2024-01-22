import { openApiDocument } from '$lib/openapi/document';

export const load = async () => {
	return {
		spec: openApiDocument
	};
};
