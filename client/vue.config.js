module.exports = {
    pages: {
      index: {
        entry: 'src/pages/LandingPage/main.js',
        template: 'public/index.html',
        filename: 'index.html',
        title: 'Landing Page',
        chunks: ['chunk-vendors', 'chunk-common', 'index']
      },
    }
  }
  