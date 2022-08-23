import {
  child, get, getDatabase, ref,
} from 'firebase/database';
import sum from 'lodash/sum';
import LZString from 'lz-string';
import ShipStock from './fleet/shipStock';
import ItemStock from './item/itemStock';

export default class FirebaseManager {
  /**
   * 所持情報をアップロード用オブジェクトに変換
   * @static
   * @param {ShipStock[]} ships
   * @param {ItemStock[]} items
   * @return {{ ships: string, items: string }}
   * @memberof Convert
   */
  public static createFirebaseStockObject(ships: ShipStock[], items: ItemStock[]): { ships: string, items: string } {
    const result = { ships: '', items: '' };
    // 圧縮処理
    if (ships && ships.length) {
      // 情報圧縮
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postShips: [number, any[]][] = [];
      for (let i = 0; i < ships.length; i += 1) {
        const data = ships[i];
        const st = data.improvement;
        const stArray = [st.fire, st.torpedo, st.antiAir, st.armor, st.luck, st.hp, st.asw];
        const releaseExpand = data.releaseExpand ? 1 : 0;
        const postShip = postShips.find((v) => v[0] === data.id);
        if (postShip) {
          // ユニークid, Lv, 経験値, 改修値, 海域, 増設の順
          postShip[1].push([data.uniqueId, data.level, data.exp, stArray, data.area, releaseExpand]);
        } else {
          postShips.push([data.id, [[data.uniqueId, data.level, data.exp, stArray, data.area, releaseExpand]]]);
        }
      }
      result.ships = LZString.compressToEncodedURIComponent(JSON.stringify(postShips));
    }
    if (items && items.length && items.some((v) => v.num.some((x) => x > 0))) {
      // 情報圧縮
      const postItems: ([number, number[]] | [number])[] = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        let postItem: [number] | [number, number[]] = [item.id, []];
        let sumItemCount = sum(item.num);
        if (sumItemCount) {
          for (let remodel = 0; remodel < item.num.length; remodel += 1) {
            const count = item.num[remodel];
            sumItemCount -= count;
            postItem[1].push(count);
            // 全体所持数格納し終わったらその時点で終了 => 容量削減のため
            if (sumItemCount <= 0) break;
          }
        } else {
          postItem = [item.id];
        }
        postItems.push(postItem);
      }
      result.items = LZString.compressToEncodedURIComponent(JSON.stringify(postItems));
    }
    return result;
  }

  /**
   * stocksコードより所持情報データを取得
   * @static
   * @param {string} stockid
   * @return {*}  {Promise<{ shipStocks: ShipStock[], itemStocks: ItemStock[] }>}
   * @memberof FirebaseManager
   */
  public static async getAndRestoreStockData(stockid: string): Promise<{ shipStocks: ShipStock[], itemStocks: ItemStock[] }> {
    let result = { shipStocks: [] as ShipStock[], itemStocks: [] as ItemStock[] };
    const dbRef = ref(getDatabase());
    await get(child(dbRef, `stocks/${stockid}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          result = FirebaseManager.restoreStocksFirebaseStockObject(data.ships, data.items);
        }
      })
      .catch((error) => {
        throw error;
      });

    return result;
  }

  /**
   * Firebase所持データから所持数情報を復元
   * @static
   * @param {string} shipsString
   * @param {string} itemsString
   * @return {*}  {{ shipStocks: ShipStock[], itemStocks: ItemStock[] }}
   * @memberof Convert
   */
  private static restoreStocksFirebaseStockObject(shipsString: string, itemsString: string): { shipStocks: ShipStock[], itemStocks: ItemStock[] } {
    const result = { shipStocks: [] as ShipStock[], itemStocks: [] as ItemStock[] };

    try {
      const shipsJSONString = LZString.decompressFromEncodedURIComponent(shipsString);
      if (shipsJSONString) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shipsJSON = JSON.parse(shipsJSONString) as [number, any[]][];

        for (let i = 0; i < shipsJSON.length; i += 1) {
          const data = shipsJSON[i];
          const masterId = data[0];
          for (let j = 0; j < data[1].length; j += 1) {
            const detail = data[1][j];
            const newStock = new ShipStock();
            newStock.uniqueId = +detail[0];
            newStock.id = masterId;
            newStock.level = +detail[1];
            newStock.exp = +detail[2];
            newStock.area = detail[4] ? +detail[4] : 0;
            newStock.releaseExpand = !!detail[5];

            const st = detail[3];
            if (st) {
              newStock.improvement.fire = st[0] ? +st[0] : 0;
              newStock.improvement.torpedo = st[1] ? +st[1] : 0;
              newStock.improvement.antiAir = st[2] ? +st[2] : 0;
              newStock.improvement.armor = st[3] ? +st[3] : 0;
              newStock.improvement.luck = st[4] ? +st[4] : 0;
              newStock.improvement.hp = st[5] ? +st[5] : 0;
              newStock.improvement.asw = st[6] ? +st[6] : 0;
            }
            result.shipStocks.push(newStock);
          }
        }
      }

      const itemsJSONString = LZString.decompressFromEncodedURIComponent(itemsString);
      if (itemsJSONString) {
        const itemsJSON = JSON.parse(itemsJSONString) as ([number, number[]] | [number])[];
        for (let i = 0; i < itemsJSON.length; i += 1) {
          const data = itemsJSON[i];
          const newStock = new ItemStock(+data[0]);
          const n = data[1];
          if (n) {
            for (let remodel = 0; remodel <= 10; remodel += 1) {
              const count = n[remodel];
              if (count) {
                newStock.num[remodel] = +count;
              }
            }
          }
          result.itemStocks.push(newStock);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return result;
  }

  /**
   * 短い(?)URL要求
   * @static
   * @param {string} url
   * @return {*}  {Promise<string>}
   * @memberof FirebaseManager
   */
  public static async getShortURL(url: string): Promise<string> {
    if (!url) return '';
    const data = {
      longDynamicLink: `https://aircalc.page.link/?link=${url}`,
      suffix: { option: 'SHORT' },
    };

    let createdURL = '';
    const response = await fetch('https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyC_rEnvKFFlZv54xvxP8MXPht081xYol4s', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((error) => console.error(error));

    if (response) {
      await response.json().then((json) => {
        if (json.error || !json.shortLink) {
          console.log(json.error);
        } else {
          createdURL = json.shortLink;
        }
      });
    }

    return createdURL;
  }
}
