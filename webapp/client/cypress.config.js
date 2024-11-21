import pkg from "@cypress/webpack-preprocessor";
const { webpack } = pkg;
import { configurePlugin } from 'cypress-mongodb';

export default {
  ...(on) => {
    const options = {
      webpackOptions: {
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
      },
    };

    on("file:preprocessor", webpack(options));
  },

  projectId: "ffuiki", // For cypress cloud recording
  
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      configurePlugin(on); // For mongodb-cypress plugin
    },
    baseUrl: 'http://localhost:5173'
  },

  env: {
    REACT_APP_BASE_URL: 'http://localhost:3001',
    DATABASE_NAME: "production",
    mongodb: {
      // It's too difficult to use env for this uri since frontend env is public, and /client can't access /server files.
      uri: 'mongodb+srv://georginabrowning0:8MmajQrxJGyoaiw0@cluster0.vkwpm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      database: 'production'
    }
  }
};
