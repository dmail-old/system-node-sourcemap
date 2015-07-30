# Sourcemap Polyfill for nodejs ES6 modules

Because systemjs support sourcemap by default this module is useless.
This module provides source map on error stack trace of ES6 modules.

## Demo

test.js:

throw new Error('test'); // This is the original code

main.js:

```javascript
require('systemjs');
require('system-node-sourcemap');

System.import('./test.js').catch(function(error){
	console.log(String(error));
});
```