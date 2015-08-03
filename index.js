var sourceMap = require('node-sourcemap');
var readSource = function(path){
	if( 'transpiledSources' in System === false ){
		console.warn('System.transpiledSources is undefined, cannot get source for', path);
	}
	else if( path in System.transpiledSources ){
		return System.transpiledSources[path];
	}
};

var importMethod = System.import;
System.import = function(){
	return importMethod.apply(this, arguments).catch(function(error){
		error = sourceMap.transformError(error, readSource);
		return Promise.reject(error);
	});
};

// promise unhandled rejection hook
process.on('unhandledRejection', function(error, promise){
	if( error ){
		error = sourceMap.transformError(error, readSource);
		console.log('unhandled rejection', String(error));
	}
});