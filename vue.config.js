module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/kc-web/' : '/',
  transpileDependencies: ['vuetify', 'gkcoi'],
  pages: {
    index: {
      entry: 'src/main.ts',
      title: '制空権シミュレータ v2',
    },
  },
};
