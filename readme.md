# Sourcemap Polyfill

This module provides source map on error stack trace of transpiled code.

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
    at execute (file:///C:/Users/Damien/Documents/GitHub/system-node-sourcemap/test.js!transpiled:9:13)
```

`node main --sourcemap`

```
file:///C:/Users/Damien/Documents/GitHub/system-node-sourcemap/test.js:3
throw new Error('test'); // This is the original code
                        ^Error: test
        at Object.execute (file:///C:/Users/Damien/Documents/GitHub/system-node-sourcemap/test.js:3:25)
```

## Why demo outputs `System.sources is undefined, cannot get source for ...` ?

Currently you have to modify es6-module-loader to enable source map. I've made a pull request https://github.com/ModuleLoader/es6-module-loader/pull/420 on es6-module-loader to include this.

## Enable sourcemap in es6-module-loader

####  SystemJS

In the file `dist/system.src.js`.
After line #1062 insert

```javascript
Loader.prototype.transpiledSources = {};
```

Replace line #1083 by

```javascript
return self.transpiledSources[load.address] = 'var __moduleName = "' + load.name + '";' + transpileFunction.call(self, load, transpiler) + '\n//# sourceURL=' + load.address + '!transpiled';
```

#### es6-module-loader

In the file `dist/es6-module-loader-dev.src.js`.

After line #1240 insert

```javascript
Loader.prototype.transpiledSources = {};
```

Replace line #1260 by

```javascript
return self.transpiledSources[load.address] = 'var __moduleName = "' + load.name + '";' + transpileFunction.call(self, load, transpiler) + '\n//# sourceURL=' + load.address + '!transpiled';
```

## Dependencies

- [node-sourcemap](https://github.com/dmail/node-sourcemap)
