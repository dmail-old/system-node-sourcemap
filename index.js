var sourceMap = require('node-sourcemap');
var readSource = function(path){
	if( 'sources' in System === false ){
		console.warn('System.sources is undefined, cannot get source for', path);
	}
	else if( path in System.sources ){
		return System.sources[path];
	}
};

var importMethod = System.import;
System.import = function(){
	return importMethod.apply(this, arguments).catch(function(error){
		error = sourceMap.transformError(error, readSource);
		error.fromImport = true;

		return Promise.reject(error);
	});
};

process.on('unhandledRejection', function(error, promise){
	if( error && !error.fromImport ){
		console.log('unhandled rejection', error);
	}
});