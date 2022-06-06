export default {
  ja: {
    Top: {
      title: '',
      siteSetting: 'サイト設定',
    },
    Common: {
      実行: '実行',
      戻る: '戻る',
      作成: '作成',
    },
    Setting: {
      language: '言語',
      colorTheme: {
        title: 'サイトカラーテーマ',
        normal: '通常',
        sky: '空色',
        pink: '桜色',
        green: '翠色',
        dark: '暗色',
        deepSea: '深海',
      },
      equipmentUISetting: {
        title: '装備表示UI調整',
        border: '枠線',
        bold: '太枠',
        radius: '角丸',
        sample: 'さんぷる',
      },
      closeTabSetting: '未保存の編成タブを閉じる際の挙動',
      closeTabConfig: '確認ダイアログを表示する',
      equipmentDetailsVisible: '装備マウスホバー時の詳細情報表示',
      invisibleDetails: '詳細情報を表示しない',
      simulationCount: {
        title: '制空計算時のシミュレーション回数',
        description1: '数値が大きいほど計算の精度が上がりますが、',
        description2: '計算時のパフォーマンスが低下します。',
        unit: '回',
      },
      defaultProficiency: {
        title: '装備選択時のデフォルト熟練度',
        batch: '一括設定',
      },
      deckBuilderReadingSetting: 'デッキビルダー形式データ読込設定',
      loadAllFleet: '常に全艦隊データを読み込む',
      saveDataBackUp: {
        title: '編成データのバックアップ',
        restore: '復元',
        description1: '保存した編成データのバックアップファイルを作成します',
        description2: '復元するバックアップファイルを選択',
      },
    },
    Home: {
      title: '制空権シミュレータ',
      description1: '本サイトの主要機能です。',
      description2: '基地航空隊や艦隊、敵艦隊を編成することで、道中を含めた全ての戦闘の制空状態や艦載機の損耗、全滅率などのシミュレーションが可能です。',
    },
    Manager: {
      title: '艦娘 / 装備管理',
      description1: 'サブの機能です。',
      description2: '自分のゲーム内の艦娘、装備情報を登録すると、シミュレータ内で選択できる艦娘や装備に反映され、あの装備持ってた…？と悩む心配がなくなります。',
    },
    OtherData: {
      title: 'みんなの編成',
      description1: '他の人がアップロードした編成データを閲覧できます。',
    },
    DataImport: {
      title: 'データ引き継ぎ',
      oldVersion: '旧制空権シミュレータ',
      description1: 'で作成していた編成データや、登録されていた装備、艦娘情報を引き継ぎます。',
      importSaveData: 'データ引継ぎ(編成)',
      importShipAndItem: 'データ引継ぎ(装備/艦娘)',
      confirm1: {
        description1: '引き継ぎ対象のデータを格納するフォルダーを作成します。',
        description2: 'フォルダー名を指定し、実行を押すと引き継ぎを開始します。',
      },
      confirm2: {
        description1: '既に本サイトで装備 / 艦娘情報が登録されているようです。',
        description2: '引き継ぎを行うとこれらのデータは上書きされます。',
        description3: '本当に引き継ぎを行いますか？',
      },
    },
    Linkage: {
      title: 'サイト連携',
      description1: 'デッキビルダー形式をURLに ?predeck=...で埋め込めば編成を読み込めます。',
    },
    Warning: {
      message1: '著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。',
      message2: 'また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。',
    },
  },
};
