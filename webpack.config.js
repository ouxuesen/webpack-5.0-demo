const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');

const IS_DEV = process.env.NODE_ENV === 'development';
// 入口文件定义
var srcDir = path.resolve(process.cwd(), 'src');
var entries = function () {
    var jsDir = path.resolve(srcDir, 'entries');
    var entryFiles = glob.sync(jsDir + '/*.{js,jsx,ts}');
    // entryFiles = entryFiles.concat(glob.sync(jsDir + '/components/*.{js,jsx}'));
    var map = {};
    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var filename = filePath.substring(
            filePath.lastIndexOf('/') + 1,
            filePath.lastIndexOf('.')
        );
        map[filename] = filePath;
    }
    console.log('map', map);
    return map;
};
const config = {
    mode: IS_DEV ? 'development' : 'production',
    devtool: IS_DEV ? 'eval' : 'inline-source-map',
    devServer: {
        static: './dist',
    },
    entry: entries(),

    output: {
        filename: 'entries/[name].[contenthash].js',
        path: path.resolve(path.resolve(__dirname, 'dist'),'entries'),
        clean: true,
        publicPath: IS_DEV ? '/' : './entries/',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: IS_DEV ? 'css/[name].css' : 'css/[name].[contenthash].css',
            chunkFilename: 'css/[name][hash].css',
        }),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: './public',
                        to: 'public',
                    },
                ]
            }
        ),
    ],
    performance: {
        hints: false
    },
    optimization: {
        moduleIds: 'deterministic',
        //runtime
        runtimeChunk: 'single',
        splitChunks: {
            // 缓存
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                loader: 'babel-loader',
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    // 在开发过程中回退到 style-loader
                    IS_DEV
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            }, {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: '[name].[ext]',
                            fallback: 'file-loader',
                            outputPath: '/public/images',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 50,
                            },
                            pngquant: {
                                quality: [0.5, 0.65],
                                speed: 4,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            webp: {
                                quality: 75,
                            },
                        },
                    },
                ],
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
}
const files = glob.sync('./src/*.html');
files.forEach(file => {
    console.log('file', file);
    let filename = file.substring(
        file.lastIndexOf('/') + 1,
        file.lastIndexOf('.')
    );
    config.plugins.push(
        //1、为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题2
        //2、可以生成创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口
        new htmlWebpackPlugin({
            title: "title",
            filename: path.basename(file),
            template: file,
            // favicon: path.resolve(__dirname, './public/icon.ico'),
            nodeModules: false,
            minify: !IS_DEV,
            // cdns: [
            //     `<script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>`,
            //     `<link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.1/css/bootstrap.min.css" rel="stylesheet">`,
            //     `<script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.1/js/bootstrap.bundle.min.js"></script>`
            // ],
            chunks: ['vendor', 'runtime', 'common', filename],
            inject: 'head',
        })
    );
});


module.exports = config