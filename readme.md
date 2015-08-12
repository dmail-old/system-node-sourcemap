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
if( process.argv[2] === '--sourcemap' ) require('system-node-sourcemap');

System.import('./test.js').catch(function(error){
	console.log(String(error));
});
```

`node main`

```
Error: test
    at execute (system-node-sourcemap/test.js!transpiled:9:13)
```

`node main --sourcemap`

```
system-node-sourcemap/test.js:3
throw new Error('test'); // This is the original code
                        ^Error: test
        at Object.execute (system-node-sourcemap/test.js:3:25)
```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
