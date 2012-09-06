/**
 * A small app to compile CSS from LessCSS
 * @author Marc Diethelm, https://github.com/MarcDiethelm
 * @version 0.1
 */

var less =          require('less'),
	http =          require('http'),
	cleanCSS =      require('clean-css'),
	fs =            require('fs'),
	config =        require('./config.js');


var LessCompiler = function(config) {
	this.aCssChunks = [];
	this.compiledChunkCount = 0;

	this.start = function() {

		config.sources.forEach(
			function(source, index) {

				source.index = index;

				if (source.type == 'http') {
					this.loadHttp(source);
				}
				else {
					this.loadFile(source);
				}
			},

			this
		);
	};

	// 'Controller'
	/////////////////////////


	this.onChunkLoaded = function(lessStr, source) {
		console.log('chunk loaded:', source.type)
		this.compileLess(lessStr, source);
	};


	this.onChunkCompiled = function(cssStr, source) {
		this.storeCssChunk(cssStr, source);
		this.compiledChunkCount++;
		if (config.sources.length == this.compiledChunkCount) {
			this.onAllChunksCompiled();
		}
	};


	this.onAllChunksCompiled = function() {
		console.log('all chunks compiled');

		var cssStr = this.aCssChunks.join('\n'),
			c = config.output;

		if (c.filename) {
			this.writeFile(c.filename, cssStr);
		}

		if (c.filename_min) {
			cssStr = this.minifyCssSync(cssStr);
			this.writeFile(c.filename_min, cssStr);
		}
	};


	// 'Model'
	//////////////////////////


	this.loadFile = function(source) {
		var self = this;
		console.log('file: reading less data...');
		fs.readFile(source.filename, 'utf8', function(error, lessStr) {
			self.onChunkLoaded(lessStr, source);
		});
	};


	this.loadHttp = function(source) {
		var self = this;
		console.log('http: requesting less data...');
		http.get(source, function(res) {
			var lessStr = '';

			res.setEncoding('utf8');

			res.on('data', function (chunk) {
				lessStr += chunk;
				console.log('http: receiving less data...');
			});
			res.on('end', function() {
				console.log('http: finished loading less data...');
				self.onChunkLoaded(lessStr, source);
			});
		});
	};


	this.storeCssChunk = function(data, source) {
		this.aCssChunks[source.index] = data;
	};


	this.compileLess = function(lessStr, source) {
		var parser = new(less.Parser)(source),
			self = this;

		console.log('parsing:', source.type);

		if (!lessStr) {
			console.log(source.filename || source.path, 'is empty. Is the path correct?');
		}

		parser.parse(lessStr, function (err, tree) {
			var cssStr;
			if (err) {
				return console.error(err);
			}

			cssStr = tree.toCSS();
			self.onChunkCompiled(cssStr, source);
		});
	};


	this.minifyCssSync = function(cssStr) {
		return cleanCSS.process(cssStr);
	};


	this.writeFile = function(filename, cssStr) {
		var file = config.output.path + '/' + filename;
		console.log('writing css file:', file);

		fs.writeFile(file, cssStr, function(err) {
			if (err) throw(err);
			console.log('write success:', filename);
		});
	};

};


var lc = new LessCompiler(config);

lc.start();

