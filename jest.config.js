/** @type {import('jest').Config} */
const config = {
  verbose: true,
  resetMocks: false,
};

// module.exports = config;

module.exports = {
  config,
  // Add this line to your Jest config
  setupFilesAfterEnv: ["./setupTests.js"],
};
