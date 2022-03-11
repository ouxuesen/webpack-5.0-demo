const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
process.env.NODE_ENV = "development"
const app = express()
const config = require('./webpack.config.js')
const compiler = webpack(config)
app.use(
    webpackDevMiddleware(compiler,{
        publicPath:config.output.publicPath
    })
)

app.listen(3000,function(){
    console.log('prot=3000')
})