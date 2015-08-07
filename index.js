var sourceMap = require('node-sourcemap');
var readSource = function(path){
	if( 'transpiledSources' in System === false ){
		console.warn('System.transpiledSources is undefined, cannot get source for', path);
	}
	else{
		path = path.replace('!transpiled', '');

		if( path in System.transpiledSources ){
			return System.transpiledSources[path];
		}
	}
};

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