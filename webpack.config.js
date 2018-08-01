var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
var WriteFilePlugin = require('write-file-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var views = ['index', 'point'];
var entry = {};
var plugins = [];

/**
 * 遍历需要打包的js文件、遍历多页面入口文件
 */
views.forEach(function(viewName) {
    entry[viewName] = `./src/views/${viewName}/index.js`;
    plugins.push(
        new HtmlWebpackPlugin({
            title: viewName,
            filename: `${viewName}.html`,
            template: `./src/views/template.html`,
            chunks: [viewName],
            inlineSource: '.(js|css)$'
        })
    );
});

module.exports = {
    entry: entry,
    output: {
        path: path.resolve(__dirname, './dist/'),
        publicPath: process.env.NODE_ENV === 'production' ? '/' : '/dist/',
        filename: `[name].js`
    },
    plugins: plugins,
    module: {
        rules: [{
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader?indentedSyntax'
                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader'
                        ],
                        'sass': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader?indentedSyntax'
                        ]
                    }
                    // other vue-loader options go here
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: 'img/[name].[hash:8].[ext]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true,
        port: 8080
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map'
}

if(process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_debugger: true,
                drop_console: true,
                pure_funcs: ['alert'] //去除相应的函数
            },
            output: {
                max_line_len: 100
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]);
    module.exports.plugins.push(
        new HtmlWebpackInlineSourcePlugin() //内联css、js。配合HtmlWebpackPlugin
    );
}