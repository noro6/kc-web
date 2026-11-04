import axios from 'axios';

export interface ReleaseNote {
  /** タグ名 (v2.53.10 など) */
  tag: string;
  /** リリース名 */
  name: string;
  /** 公開日時 */
  publishedAt: number;
  /** GitHub がレンダリング・サニタイズ済みの本文 HTML */
  html: string;
  /** GitHub Releases の個別ページ URL */
  url: string;
}

/* eslint-disable camelcase */
interface GitHubRelease {
  tag_name: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  body_html?: string;
  html_url: string;
}
/* eslint-enable camelcase */

const API_URL = 'https://api.github.com/repos/noro6/kc-web/releases?per_page=10';
const CACHE_KEY = 'kc-web-release-notes-cache';
const LAST_SEEN_KEY = 'kc-web-last-seen-release';
/** 未認証 API は IP 単位で 60回/時 の制限があるため、短時間の再読み込みではキャッシュを使う */
const CACHE_TTL = 1000 * 60 * 10;
/** 一度に表示する未読リリースの上限 */
const MAX_UNREAD_COUNT = 5;

/**
 * GitHub Releases を更新情報として扱う
 */
export default class ReleaseNoteManager {
  private static pending: Promise<ReleaseNote[]> | null = null;

  /**
   * 直近のリリース一覧を新しい順で取得する。失敗時は空配列
   * @param siteVersion 現在のサイトバージョン これより新しい (未デプロイの) リリースは除外する
   */
  public static async fetchReleases(siteVersion: string): Promise<ReleaseNote[]> {
    if (!ReleaseNoteManager.pending) {
      ReleaseNoteManager.pending = ReleaseNoteManager.fetchReleasesCore();
    }
    const releases = await ReleaseNoteManager.pending;
    return releases.filter((v) => ReleaseNoteManager.compareVersion(v.tag, siteVersion) <= 0);
  }

  /**
   * 未読のリリースを新しい順で返す
   * @param releases 取得済みリリース一覧
   * @param firstVisitedAt サイト初回訪問日時 0 は記録開始前からの利用者
   */
  public static getUnreadReleases(releases: ReleaseNote[], firstVisitedAt: number): ReleaseNote[] {
    if (!releases.length) {
      return [];
    }

    const lastSeenTag = ReleaseNoteManager.getLastSeenTag();
    if (lastSeenTag) {
      return releases.filter((v) => ReleaseNoteManager.compareVersion(v.tag, lastSeenTag) > 0).slice(0, MAX_UNREAD_COUNT);
    }

    // 既読記録がない場合、初回訪問より後に公開された最新の1件だけを対象にする
    const latest = releases[0];
    if (firstVisitedAt && latest.publishedAt <= firstVisitedAt) {
      return [];
    }
    return [latest];
  }

  /**
   * 指定タグまでを既読にする
   */
  public static markAsRead(tag: string): void {
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, tag);
    } catch {
      // private mode 等で失敗しても次回また表示されるだけ
    }
  }

  /**
   * v2.53.10 形式のタグを比較する
   * @returns a が新しければ正、古ければ負
   */
  public static compareVersion(a: string, b: string): number {
    const parse = (tag: string) => tag.replace(/^v/i, '').split('.').map((v) => parseInt(v, 10) || 0);
    const va = parse(a);
    const vb = parse(b);
    const length = Math.max(va.length, vb.length);
    for (let i = 0; i < length; i += 1) {
      const diff = (va[i] ?? 0) - (vb[i] ?? 0);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  }

  private static getLastSeenTag(): string {
    try {
      return window.localStorage.getItem(LAST_SEEN_KEY) ?? '';
    } catch {
      return '';
    }
  }

  private static async fetchReleasesCore(): Promise<ReleaseNote[]> {
    const cached = ReleaseNoteManager.readCache();
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get<GitHubRelease[]>(API_URL, {
        headers: { Accept: 'application/vnd.github.html+json' },
        timeout: 10_000,
      });
      if (!Array.isArray(response.data)) {
        return [];
      }

      const releases = response.data
        .filter((v) => !v.draft && !v.prerelease && v.published_at)
        .map((v) => ({
          tag: v.tag_name,
          name: v.name || v.tag_name,
          publishedAt: Date.parse(v.published_at as string),
          html: ReleaseNoteManager.decorateHtml(v.body_html ?? ''),
          url: v.html_url,
        }))
        .sort((a, b) => ReleaseNoteManager.compareVersion(b.tag, a.tag));

      ReleaseNoteManager.writeCache(releases);
      return releases;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  /**
   * 見出しに種別クラスを付け、リンクを別タブで開くようにする
   */
  private static decorateHtml(html: string): string {
    if (!html || typeof DOMParser === 'undefined') {
      return html;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('h1, h2, h3, h4').forEach((heading) => {
      const text = heading.textContent ?? '';
      if (text.includes('新規')) {
        heading.classList.add('release-heading-new');
      } else if (text.includes('更新')) {
        heading.classList.add('release-heading-update');
      } else if (text.includes('修正')) {
        heading.classList.add('release-heading-fix');
      }
    });
    doc.querySelectorAll('a').forEach((anchor) => {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    });
    return doc.body.innerHTML;
  }

  private static readCache(): ReleaseNote[] | null {
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) {
        return null;
      }
      const cache = JSON.parse(raw) as { fetchedAt: number; releases: ReleaseNote[] };
      if (!cache || !Array.isArray(cache.releases) || Date.now() - cache.fetchedAt > CACHE_TTL) {
        return null;
      }
      return cache.releases;
    } catch {
      return null;
    }
  }

  private static writeCache(releases: ReleaseNote[]): void {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), releases }));
    } catch {
      // キャッシュできなくても取得結果はそのまま使う
    }
  }
}
