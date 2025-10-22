module.exports = {
  // Keep plugins explicit. If you have tailwindcss installed, it will be used.
  // We intentionally avoid forcing autoprefixer here to prevent Next.js from
  // trying to require it when it's not installed. For full production builds,
  // install autoprefixer and postcss (npm install --save-dev autoprefixer postcss).
  plugins: {
    // If tailwindcss is installed, enable it; otherwise skip.
    ...(function () {
      try {
        // require.resolve used to avoid throwing on import if package missing
        require.resolve("tailwindcss");
        return { "tailwindcss": {} };
      } catch {
        return {};
      }
    })(),
    // Do not automatically add autoprefixer here to avoid build-time require errors.
  },
};
