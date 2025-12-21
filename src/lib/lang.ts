import axios from 'axios';
import en from './lang/TranslationsEN';
import jp from './lang/TranslationsJP';
import cn from './lang/TranslationsCN';

const data = Object.assign(en, jp, cn);
axios.get('https://cdn.jsdelivr.net/gh/KC3Kai/kc3-translations@master/data/en/items.json').then((res) => {
  Object.keys(res.data).forEach((key) => {
    (data.en as unknown as { [key: string]: string })[key] = res.data[key];
  });
});
axios.get('https://cdn.jsdelivr.net/gh/KC3Kai/kc3-translations@master/data/en/ships.json').then((res) => {
  Object.keys(res.data).forEach((key) => {
    (data.en as unknown as { [key: string]: string })[key] = res.data[key];
  });
});
export default data;
