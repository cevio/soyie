var path = require('path');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, './build'),
        filename: "soyie.js",
        library: "Soyie",
        libraryTarget: "umd"
    },
    module: {
        loaders: [
            {
                test: /\.(js)?$/,
                loader: 'babel?stage=0',
                exclude: /node_modules/
            }
        ]
    }
};
