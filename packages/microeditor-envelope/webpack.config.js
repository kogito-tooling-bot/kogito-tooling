/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CircularDependencyPlugin = require("circular-dependency-plugin");

const BG_IMAGES_DIRNAME = "bgimages";

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    index: "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2"
  },
  externals: [nodeExternals({ modulesDir: "../../node_modules", whitelist: /@patternfly/ })],
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/, // exclude detection of files based on a RegExp
      failOnError: false, // add errors to webpack instead of warnings
      cwd: process.cwd() // set the current working directory for displaying module paths
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve("./tsconfig.json")
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        // only process modules with this loader
        // if they live under a 'fonts' or 'pficon' directory
        include: [
          path.resolve(__dirname, "../../node_modules/patternfly/dist/fonts"),
          path.resolve(__dirname, "../../node_modules/@patternfly/react-core/dist/styles/assets/fonts"),
          path.resolve(__dirname, "../../node_modules/@patternfly/react-core/dist/styles/assets/pficon"),
          path.resolve(__dirname, "../../node_modules/@patternfly/patternfly/assets/fonts"),
          path.resolve(__dirname, "../../node_modules/@patternfly/patternfly/assets/pficon")
        ],
        use: {
          loader: "file-loader",
          options: {
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
            outputPath: "fonts",
            name: "[name].[ext]"
          }
        }
      },
      {
        test: /\.svg$/,
        include: input => input.indexOf("background-filter.svg") > 1,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 5000,
              outputPath: "svgs",
              name: "[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader if they live under a 'bgimages' directory
        // this is primarily useful when applying a CSS background using an SVG
        include: input => input.indexOf(BG_IMAGES_DIRNAME) > -1,
        use: {
          loader: "svg-url-loader",
          options: {}
        }
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader when they don't live under a 'bgimages',
        // 'fonts', or 'pficon' directory, those are handled with other loaders
        include: input =>
          input.indexOf(BG_IMAGES_DIRNAME) === -1 &&
          input.indexOf("fonts") === -1 &&
          input.indexOf("background-filter") === -1 &&
          input.indexOf("pficon") === -1,
        use: {
          loader: "raw-loader",
          options: {}
        }
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "../../node_modules/patternfly"),
          path.resolve(__dirname, "../../node_modules/@patternfly/patternfly/assets/images"),
          path.resolve(__dirname, "../../node_modules/@patternfly/react-styles/css/assets/images"),
          path.resolve(__dirname, "../../node_modules/@patternfly/react-core/dist/styles/assets/images"),
          path.resolve(
            __dirname,
            "../../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "../../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "../../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images"
          )
        ],
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 5000,
              outputPath: "images",
              name: "[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    modules: [path.resolve("../../node_modules"), path.resolve("./node_modules"), path.resolve("./src")]
  }
};
