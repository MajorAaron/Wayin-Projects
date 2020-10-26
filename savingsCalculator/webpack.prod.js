const
	path = require('path'),
	webpack = require('webpack');

module.exports = {
	mode: 'production',
	entry: {
		"app.min.js": './src/app.js'
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name]',
		publicPath: '/',
		library:"SAVINGSCALC",
		libraryExport:'default'
	},
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			assetPath: JSON.stringify("https://localhost:8448/img/")
		})
	],


	resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
	},
	
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			use : {
				loader: "babel-loader"
			},
			include: __dirname
		},
		{
			test: /\.vue$/,
			loader: 'vue-loader'
		}]
	}
}
