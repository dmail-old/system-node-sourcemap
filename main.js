global.System = require('es6-module-loader').System;
System.transpiler = 'babel';
if( process.argv[2] === '--sourcemap' ) require('./index');

System.import('./test.js').catch(function(error){
	console.log(String(error));
});