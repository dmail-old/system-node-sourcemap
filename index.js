/* global System */

if( typeof System === 'undefined' ){
	throw new Error('System is undefined, you must require es6-module-loader or Systemjs before this one');
}

var sourceMap = require('node-sourcemap');
var sources = {};

var readSource = function(path){
	path = path.replace('!transpiled', '');
	//path = System.normalize(path);

	if( false === path in sources ){
		//throw new Error('source undefined for ' + path);
	}			
	else{
		return sources[path];
	}
};

if( !System.nodeSourceMap ){
	System.nodeSourceMap = true;	

	var translateMethod = System.translate;
	System.translate = function(load){
		return translateMethod.call(this, load).then(function(source){
			sources[load.address] = source;
			return source;
		});
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
}

module.exports = function(error){
	return sourceMap.transformError(error, readSource);
};