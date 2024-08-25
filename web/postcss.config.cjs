module.exports = {
  plugins: {
    // 'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {
      grid: 'autoplace'
    },
    'postcss-media-minmax': {},
    'postcss-custom-media': {}
  },
}
