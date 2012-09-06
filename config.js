/**
 * A small app to compile CSS from LessCSS
 * @author Marc Diethelm, https://github.com/MarcDiethelm
 * @version 0.1
 */

var docroot = __dirname + '/../../public';

module.exports = {
	sources: [ // files are concatenated in the order entered
		{
			type: 'file', // requires: filename and paths (@import search path) properties
			filename: docroot + '/twitter-bootstrap-b261f97/less/bootstrap.less',
			paths: [docroot + '/twitter-bootstrap-b261f97/less']
		},
		{
			type: 'http', // requires host and path property
			host: 'gmos.nx',
			//host: 'gmos-socialmedia.namics.com',
			path: '/terrific/asset/css?brand=&debug=true&cache=false'
		}
	],
	output: {
		path: docroot + '/Assets/css',
		filename: 'base.css',
		filename_min: 'base.min.css'
	}
};