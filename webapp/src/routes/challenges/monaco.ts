import * as monaco from 'monaco-editor';

import markdownWorker from 'monaco-editor/esm/vs/basic-languages/markdown/markdown?worker';

self.MonacoEnvironment = {
	getWorker: function (_: string, label: string) {
		if (label !== 'markdown') {
			throw new Error(`Cannot load worker "${label}"`);
		}
		return new markdownWorker();
	}
};

export default monaco;
