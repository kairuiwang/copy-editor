const HtmlWebPackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");

module.exports = {
    mode: "development",
    entry: {
        app: "./index.js",
    },
    output: {
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: [/\.js$/, /\.jsx$/],
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/react", "@babel/flow"],
                },
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                    {
                        loader: "react-svg-loader",
                        options: {
                            jsx: true, // true outputs JSX tags
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|webp)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "assets",
                        },
                    },
                ],
            },
        ],
    },
    devtool: "inline-source-map",
    devServer: {
        contentBase: ".",
        historyApiFallback: true,
        port: "8000",
        disableHostCheck: true,
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./index.html",
            filename: "./index.html",
        }),
    ],
};
