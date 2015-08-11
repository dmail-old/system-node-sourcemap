/* global System */

if( typeof System === 'undefined' ){
	throw new Error('System is undefined, you must require es6-module-loader or Systemjs before this one');
}

var sourceMap = require('node-sourcemap');

var readSource = function(path){

	if( 'loads' in System === false ){
		console.warn('System.loads is undefined, you must set System.trace = true');
	}
	else{
		path = path.replace('!transpiled', '');
		path = System.normalize(path);

		if( false === path in System.loads ){
			// console.warn('no source for', path);
		}
		else{
			if( false === 'transpiledSource' in System.loads[path] ){
				throw new Error('transpiledSource undefined for ' + path);
			}			
			else{
				return System.loads[path].transpiledSource;
			}
		}
	}
};

System.trace = true;
var importMethod = System.import;
System.import = function(){
	return importMethod.apply(this, arguments).catch(function(error){
		error = sourceMap.transformError(error, readSource);
		return Promise.reject(error);
	});
};

process.on('uncaughtException', function(error){
	sourceMap.transformError(error, readSource);
});

module.exports = function(error){
	return sourceMap.transformError(error, readSource);
};