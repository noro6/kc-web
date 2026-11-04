/** 他タブとの IndexedDB 更新通知用スコープ */
export type TabSyncScope =
  | 'savedata'
  | 'ships'
  | 'items'
  | 'setting'
  | 'itemPresets'
  | 'manualEnemies'
  | 'outputHistories'
  | 'quests';

type TabSyncMessage = {
  tabId: string;
  at: number;
  scope: TabSyncScope;
};

const CHANNEL_NAME = 'kc-web-tab-sync';
const STORAGE_KEY = 'kc-web-tab-sync';

/**
 * 同一オリジンの別タブへ、ローカルDB更新を通知する。
 * BroadcastChannel を優先し、未対応環境では storage イベントにフォールバックする。
 */
export default class TabSync {
  private static readonly tabId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  private static channel: BroadcastChannel | null = null;

  /** 自タブで IndexedDB へ書き込んだ直後に呼ぶ */
  public static notify(scope: TabSyncScope): void {
    const message: TabSyncMessage = {
      tabId: TabSync.tabId,
      at: Date.now(),
      scope,
    };

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        if (!TabSync.channel) {
          TabSync.channel = new BroadcastChannel(CHANNEL_NAME);
        }
        TabSync.channel.postMessage(message);
        return;
      } catch {
        // fall through to localStorage
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
    } catch {
      // private mode 等で失敗してもアプリ本体には影響させない
    }
  }

  /**
   * 他タブからの更新を購読する。
   * @returns 購読解除関数
   */
  public static subscribe(onOtherTabUpdate: (scope: TabSyncScope) => void): () => void {
    const handleMessage = (raw: unknown) => {
      const message = raw as TabSyncMessage;
      if (!message || typeof message !== 'object' || message.tabId === TabSync.tabId) {
        return;
      }
      if (!message.scope) {
        return;
      }
      onOtherTabUpdate(message.scope);
    };

    let channel: BroadcastChannel | null = null;
    const onChannelMessage = (event: MessageEvent) => {
      handleMessage(event.data);
    };

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener('message', onChannelMessage);
      } catch {
        channel = null;
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        handleMessage(JSON.parse(event.newValue));
      } catch {
        // ignore malformed payload
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (channel) {
        channel.removeEventListener('message', onChannelMessage);
        channel.close();
      }
    };
  }
}
