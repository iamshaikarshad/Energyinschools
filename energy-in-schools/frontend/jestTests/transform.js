const config = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    "@babel/plugin-syntax-dynamic-import",
  ],
};
module.exports = require("babel-jest").createTransformer(config);