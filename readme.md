# Sourcemap Polyfill

This module provides source map on error stack trace of SystemJS transpiled code.

## Demo

test.js:

```
"format es6";
throw new Error('test'); // This is the original code
```

main.js:

```javascript
require('systemjs');
System.transpiler = 'babel';
System.paths.babel = './node_modules/babel-core/browser.js';
if( process.argv[2] === '--sourcemap' ) require('system-node-sourcemap');

System.import('./test.js').catch(function(error){
	console.log(String(error));
});
```

`node main`

```
Error: test
```

`node main --sourcemap`

```
system-node-sourcemap/test.js:3
throw new Error('test'); // This is the original code
      ^Error: test
        at execute (system-node-sourcemap/test.js:3:7)
        at ensureEvaluated (system-node-sourcemap\node_modules\systemjs\dist\system.src.js:2108:26)
```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
