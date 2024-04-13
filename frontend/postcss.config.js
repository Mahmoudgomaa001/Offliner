export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(globalThis.process.env.NODE_ENV === 'production'
      ? { cssnano: {} }
      : {}),
  },
}
