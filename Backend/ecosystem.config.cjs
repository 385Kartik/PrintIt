module.exports = {
  apps: [
    {
      name: "print-it",
      script: "dist/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_restarts: 5,
      watch: false,
    },
  ],
};

