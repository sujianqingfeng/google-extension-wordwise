export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.word-wise',
      transform: function (prefix, selector, prefixedSelector, filePath) {
        if (/\/content\/main.css/.test(filePath)) {
          return selector
        }
        return prefixedSelector
      }
    }
  }
}
