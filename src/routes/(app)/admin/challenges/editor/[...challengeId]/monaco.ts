import * as monaco from 'monaco-editor';

import markdownWorker from 'monaco-editor/esm/vs/basic-languages/markdown/markdown?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
	getWorker: function (_: string, label: string) {
		if (label === 'typescript' || label === 'javascript') {
			return new tsWorker();
		}
		if (label === 'markdown') {
			return new markdownWorker();
		}
		throw new Error(`Cannot load worker "${label}"`);
	}
};

export default monaco;
