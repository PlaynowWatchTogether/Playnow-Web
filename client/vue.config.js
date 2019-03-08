module.exports = {
    pages: {
      'index': {
        entry: 'src/pages/LandingPage/main.js',
        template: 'public/index.html',
        title: 'Landing Page',
        chunks: ['chunk-vendors', 'chunk-common', 'index']
      },
      'main' : {
        entry: 'src/pages/Main/main.js',
        template: 'public/index.html',
        title: 'Main',
        chunks: ['chunk-vendors', 'chunk-common', 'main']
      },
    }
  }
