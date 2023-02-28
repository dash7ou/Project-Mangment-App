const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public/dist"),
    publicPath: path.resolve(__dirname, "/dist/"),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "/public/"),
      //   publicPath: path.resolve(__dirname, "public/dist"),
    },
    compress: true,
    port: 9000,
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
