const path = require('path');
module.exports = {
    entry: './src/index.ts',
    output: {
        filename: './bundle.js',
    },
    mode: 'development',
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [],
    module: {
        rules: [
            {test: /\.ts$/, use: ['ts-loader']},
        ]
    },
    devServer: {
        static:{
            directory: path.resolve(__dirname, './'),
        },
        compress: true,
        host:'localhost',
        port:3000,
        historyApiFallback: true,
        open: true,
        liveReload:true
    }
}