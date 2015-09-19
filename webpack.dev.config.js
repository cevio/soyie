var path = require('path');

module.exports = {
    entry: "./examples/test.js",
    output: {
        path: path.resolve(__dirname, './examples'),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.(js)?$/,
                loader: 'babel?stage=0',
                exclude: /node_modules/
            },
            {
                test: /\.(css)$/,
                loaders: [
                    'style',
                    'css',
                    'autoprefixer-loader?browsers=last 5 versions'
                ]
            },
            {
                test: /\.(html)$/,
                loader: 'file?name=[path][name].[ext]&context=./src'
            }
        ]
    }
};
