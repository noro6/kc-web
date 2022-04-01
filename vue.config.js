module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/kc-web/' : '/',
  transpileDependencies: ['vuetify'],
  pages: {
    index: {
      entry: 'src/main.ts',
      title: '制空権シミュレータ',
    },
  },
};
