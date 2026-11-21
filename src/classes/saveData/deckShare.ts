import axios from 'axios';

/** 共有する編成の中身 */
export interface DeckShareContent {
  /** 編成名 */
  name: string;
  /** 補足情報 */
  remarks: string;
  /** SaveData.createURLSaveDataString() の出力 */
  manager: string;
}

/** 失敗時の status は HTTP ステータスで、通信エラー（CORS で止められた場合を含む）は 0 */
export type DeckShareResult<T> = { ok: true; data: T } | { ok: false; status: number };

/**
 * 編成共有URL（https://kc.noro6.net/d/{code}）の発行と取得
 * 中身は短縮URLサービス（VUE_APP_SHORTENER_BASE_URL）経由でサーバーに保存する
 */
export default class DeckShare {
  /** 共有できる補足情報の文字数。ブラウザの .length で数えると、サーバーの数え方（コードポイント）より多くなるので、ここで通ればサーバーでも通る */
  public static readonly MAX_REMARKS_LENGTH = 10000;

  /** サーバーは100文字を超える編成名を受け付けない */
  private static readonly MAX_NAME_LENGTH = 100;

  private static readonly TIMEOUT = 10_000;

  private static get baseURL(): string {
    return (process.env.VUE_APP_SHORTENER_BASE_URL || '').replace(/\/$/, '');
  }

  private static failed(error: unknown): { ok: false; status: number } {
    console.error(error);
    return { ok: false, status: axios.isAxiosError(error) ? error.response?.status ?? 0 : 0 };
  }

  /**
   * 共有を発行し、共有URLを返す
   * @param {DeckShareContent} content
   * @return {*}  {Promise<DeckShareResult<string>>}
   */
  public static async create(content: DeckShareContent): Promise<DeckShareResult<string>> {
    const body = {
      v: 1,
      name: Array.from(content.name).slice(0, DeckShare.MAX_NAME_LENGTH).join(''),
      remarks: content.remarks,
      manager: content.manager,
    };
    try {
      const response = await axios.post(`${DeckShare.baseURL}/api/deck-shares`, body, { timeout: DeckShare.TIMEOUT });
      const code = response?.data?.code as string | undefined;
      if (code) {
        return { ok: true, data: `${DeckShare.baseURL}/d/${code}` };
      }
      return DeckShare.failed(response?.data);
    } catch (error) {
      return DeckShare.failed(error);
    }
  }

  /**
   * 共有の中身を取得する
   * @param {string} code
   * @return {*}  {Promise<DeckShareResult<DeckShareContent>>}
   */
  public static async fetch(code: string): Promise<DeckShareResult<DeckShareContent>> {
    try {
      const response = await axios.get(`${DeckShare.baseURL}/api/deck-shares/${encodeURIComponent(code)}`, { timeout: DeckShare.TIMEOUT });
      const data = response?.data as Partial<DeckShareContent> | undefined;
      if (data && typeof data.manager === 'string') {
        return { ok: true, data: { name: data.name ?? '', remarks: data.remarks ?? '', manager: data.manager } };
      }
      return DeckShare.failed(data);
    } catch (error) {
      return DeckShare.failed(error);
    }
  }
}
