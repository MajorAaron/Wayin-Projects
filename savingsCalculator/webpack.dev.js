const
	path = require('path'),
	webpack = require('webpack'),
	WebpackCopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		"app.js": './src/app.js'
	},

	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name]',
		publicPath: '/',
		library:"SAVINGSCALC",
		libraryExport:'default'
	},

	devServer: {
		port: 8888,
		contentBase: path.resolve('dist'),
		hot: false,
		https: true,
		host: 'localhost',
		inline: true,
		disableHostCheck: true
	},

	resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },

	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			assetPath: JSON.stringify("https://localhost:8448/img/")
		})
	],
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
