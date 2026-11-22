<template>
  <div>
    <div class="home">
      <header class="home-hero">
        <div>
          <h1 class="home-title">{{ $t("Common.制空権シミュレータ") }}</h1>
        </div>
        <button type="button" class="version-pill" :title="$t('Home.更新履歴')" @click="releaseDialog = true">v{{ $store.state.siteVersion }}</button>
      </header>

      <div class="section-head">{{ $t("Home.メインメニュー") }}</div>
      <div class="main-grid">
        <div class="nav-slot" :class="{ 'nav-slot--feature': index === 0 }" v-for="(page, index) in mainPages" :key="page.title">
        <v-tooltip
          bottom
          color="black"
          max-width="400px"
          open-delay="400"
          :disabled="!page.text"
        >
          <template v-slot:activator="{ on, attrs }">
            <button
              class="nav-card"
              :class="{ 'nav-card--feature': index === 0 }"
              :style="{ '--accent': accentOf(page.color) }"
              v-bind="attrs"
              v-on="on"
              v-ripple="{ class: `${page.color}--text` }"
              @click="clickedButton(page)"
              :disabled="page.clicked"
            >
              <div class="nav-icon">
                <v-icon>{{ page.icon }}</v-icon>
              </div>
              <div class="nav-card-body">
                <div class="nav-card-title-row">
                  <div class="nav-card-title">{{ $t(`${page.title}`) }}</div>
                  <v-icon class="nav-go" size="18">mdi-chevron-right</v-icon>
                </div>
                <div class="nav-card-desc" v-if="page.text">{{ pageLead(page) }}</div>
              </div>
            </button>
          </template>
          <div v-if="page.text">
            <div v-for="t in page.text" :key="t">{{ $t(`${t}`) }}</div>
          </div>
        </v-tooltip>
        </div>
      </div>

      <div class="section-head">{{ $t("Home.おまけ") }}</div>
      <div class="extra-grid">
        <div class="nav-slot" v-for="page in extraPages" :key="page.title">
        <v-tooltip bottom color="black" max-width="340px" open-delay="400">
          <template v-slot:activator="{ on, attrs }">
            <button
              class="nav-card nav-card--compact"
              :style="{ '--accent': accentOf(page.color) }"
              v-bind="attrs"
              v-on="on"
              v-ripple="{ class: `${page.color}--text` }"
              @click="clickedButton(page)"
              :disabled="page.clicked"
            >
              <div class="nav-icon">
                <v-icon>{{ page.icon }}</v-icon>
              </div>
              <div class="nav-card-body">
                <div class="nav-card-title-row">
                  <div class="nav-card-title">{{ $t(`${page.title}`) }}</div>
                  <v-icon class="nav-go" size="18">mdi-chevron-right</v-icon>
                </div>
                <div class="nav-card-desc">{{ pageLead(page) }}</div>
              </div>
            </button>
          </template>
          <div>{{ $t(`${page.text}`) }}</div>
        </v-tooltip>
        </div>
      </div>

      <div class="section-head">{{ $t("Database.その他") }}</div>
      <div class="expansion-area">
        <v-expansion-panels class="home-panels" flat multiple>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-database-arrow-up</v-icon>
                <div class="ml-2">{{ $t("Home.データ引き継ぎ") }} ( v2 <v-icon>mdi-arrow-right-thin</v-icon> v2 )</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4">{{ $t("Home.本サイトで作成した編成データなどを他の端末やブラウザに引き継げます") }}</div>
              <div class="mt-3">
                1. <v-btn @click="createBackUp" color="primary" small :disabled="created" depressed>{{ $t("Home.バックアップファイルを作成する") }}</v-btn>
              </div>
              <div class="mt-2">2. {{ $t("Home.作成されたバックアップファイルを、引き継ぎ先のPCや端末に移動させる") }}</div>
              <div class="mt-2">3. {{ $t("Home.引き継ぎ先で制空権シミュレータv2を開き、サイト設定を開く") }}</div>
              <div class="mt-1">
                4. 「{{ $t("Setting.編成データのバックアップ") }}」<v-icon>mdi-arrow-right-thin</v-icon>「{{
                  $t("Setting.復元するバックアップファイルを選択")
                }}」
              </div>
              <div class="mt-1">5. {{ $t("Home.手順2で移動させてきたバックアップファイルを選択すれば引き継ぎは完了です") }}</div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-database-arrow-down</v-icon>
                <div class="ml-2">{{ $t("Home.データ引き継ぎ") }} ( v1 <v-icon>mdi-arrow-right-thin</v-icon> v2 )</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4 body-2">
                <a href="https://noro6.github.io/kcTools" target="_blank">{{ $t("Home.旧制空権シミュレータ") }}</a>
                (v1){{ $t("Home.で作成していた編成データや、登録されていた装備、艦娘情報を引き継ぎます。") }}
              </div>
              <div class="d-flex flex-wrap mt-2">
                <v-btn color="teal" class="mr-2 mb-2" @click="checkOldData()" :dark="!imported" :disabled="imported">
                  {{ $t("Home.データ引継ぎ(編成)") }}
                </v-btn>
                <v-btn color="teal" class="mr-2 mb-2" @click="checkOldStockData()" :dark="!importedStock" :disabled="importedStock">
                  {{ $t("Home.データ引継ぎ(装備/艦娘)") }}
                </v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-link-variant</v-icon>
                <div class="ml-2">{{ $t("Home.サイト連携") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4">
                <div>{{ $t("Home.デッキビルダー形式をURLに ?predeck=で埋め込めば編成を読み込めます。") }}</div>
                <div class="text--secondary">(e.g.) https://noro6.github.io/kc-web?predeck={"version":4,"hqlv":120,"f1":{"s1":...</div>
              </div>
              <div class="mt-6">
                <div>{{ $t("Home.URLが長すぎて上記の方法でエラーが出る場合は、URL fragmentsを利用した受け渡しも可能です。") }}</div>
                <div class="text--secondary">(e.g.) https://noro6.github.io/kc-web#import:{"predeck":{"version":4,"hqlv":120,"f1":{"s1":...}</div>
              </div>
              <div class="mt-6">
                <div>{{ $t("Home.また、URL fragmentsを利用した形式では艦隊分析コード(艦娘、装備)形式の読み込みも同時に行うことができます。") }}</div>
                <div class="text--secondary">
                  (e.g.)
                  https://noro6.github.io/kc-web#import:{"predeck":{...},"ships":[{"api_ship_id":1,"api_lv":1,"api_kyouka":[0,0,0,0,0,0,0],"api_exp":[0,100,0],"api_slot_ex":0,"api_sally_area":0}],"items":[{"api_slotitem_id":1,"api_level":10}]}
                </div>
              </div>
              <div class="mt-6">
                <div class="d-flex align-center flex-wrap">
                  <div>{{ $t("Home.このサイトが読み込めるデッキビルダー形式の例です。") }}</div>
                  <v-btn class="ml-auto" small text @click="copyDeckBuilderSample">
                    <v-icon small left>{{ deckSampleCopied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
                    {{ deckSampleCopied ? $t("Common.コピーされました。") : $t("Common.コードをコピー") }}
                  </v-btn>
                </div>
                <pre class="deck-sample mt-1">{{ deckBuilderSample }}</pre>
                <section v-for="group in deckBuilderNoteGroups" :key="group.title" class="deck-note-group">
                  <div class="deck-note-title">{{ $t(group.title) }}</div>
                  <ul class="deck-sample-notes">
                    <li v-for="note in group.notes" :key="`${group.title}-${note.label}`">
                      <span class="deck-sample-key">{{ note.label }}</span>
                      <span>{{ $t(note.text) }}</span>
                    </li>
                  </ul>
                </section>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-file-document</v-icon>
                <div class="ml-2">{{ $t("Home.更新履歴") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-2">
                <div v-if="releasesLoading" class="d-flex justify-center py-4">
                  <v-progress-circular indeterminate size="24" />
                </div>
                <template v-else-if="releases.length">
                  <div v-if="needTrans" class="caption mt-2">{{ $t("Home.更新内容は日本語のみの提供です。") }}</div>
                  <release-note-list :releases="releases" />
                </template>
                <div v-else class="mt-2 body-2 text--secondary">{{ $t("Home.更新履歴を取得できませんでした。") }}</div>
              </div>
              <div class="mt-2 body-2 d-flex align-center">
                <div class="mr-3">{{ $t("Home.雑です。") }}</div>
                <v-btn text href="https://github.com/noro6/kc-web/releases" target="_blank" outlined small>
                  <v-icon>mdi-github</v-icon>
                  <span class="mx-1">GitHub Releases</span>
                </v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-party-popper</v-icon>
                <div class="ml-2">{{ $t("Home.ご支援") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4">
                <div>{{ $t("Home.本サイトは無料ですが、それでもご支援いただけるという方向けに支援の手段を用意しました。") }}</div>
                <div>{{ $t("Home.いつも本当にありがとうございます。") }}</div>
              </div>
              <div class="support-buttons">
                <div>
                  <v-btn color="teal darken-1" large dark target="_blank" href="https://ofuse.me/noro">
                    <span class="ofuse-label">OFUSEで応援する</span>
                  </v-btn>
                  <div class="mt-2">{{ $t("Home.匿名でも利用可能な投げ銭サービスです。") }}</div>
                </div>
                <div>
                  <v-btn color="orange darken-1" large dark target="_blank" href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share">
                    {{ $t("Home.Amazon ほしい物リスト") }}
                  </v-btn>
                  <div class="mt-2">{{ $t("Home.物資やギフト券といった形であればこちら。") }}</div>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <footer class="info-area">
        <div>
          {{ $t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。") }}
        </div>
        <div>
          {{ $t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。") }}
        </div>
      </footer>
    </div>
    <v-dialog v-model="releaseDialog" scrollable width="680">
      <v-card>
        <v-card-title>
          {{ $t("Home.更新履歴") }}
          <v-spacer />
          <v-btn icon @click="releaseDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="releasesLoading" class="d-flex justify-center py-6">
            <v-progress-circular indeterminate size="24" />
          </div>
          <template v-else-if="releases.length">
            <div v-if="needTrans" class="caption mb-2">{{ $t("Home.更新内容は日本語のみの提供です。") }}</div>
            <release-note-list :releases="releases" />
          </template>
          <div v-else class="body-2 text--secondary">{{ $t("Home.更新履歴を取得できませんでした。") }}</div>
          <div class="mt-2 body-2 d-flex align-center">
            <div class="mr-3">{{ $t("Home.雑です。") }}</div>
            <v-btn text href="https://github.com/noro6/kc-web/releases" target="_blank" outlined small>
              <v-icon>mdi-github</v-icon>
              <span class="mx-1">GitHub Releases</span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="importConfirmDialog" transition="scroll-x-transition" width="500">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <div class="body-2">{{ $t("Home.引き継ぎ対象のデータを格納するフォルダーを作成します。") }}</div>
          <div class="mb-5 body-2">{{ $t("Home.フォルダー名を指定し、実行を押すと引き継ぎを開始します。") }}</div>
          <v-text-field v-model="importFileName" dense outlined maxlength="100" counter :label="$t('SaveData.フォルダー名')" />
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="importOldData" :disabled="isNameEmpty || imported">{{ $t("Common.実行") }}</v-btn>
            <v-btn class="ml-4" color="secondary" @click.stop="importConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="480">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="body-2">{{ $t("Home.既に本サイトで装備 / 艦娘情報が登録されているようです。") }}</div>
          <div class="body-2">{{ $t("Home.引き継ぎを行うとこれらのデータは上書きされます。") }}</div>
          <div class="body-2 mt-3">{{ $t("Home.本当に引き継ぎを行いますか？") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="success" dark :disabled="!confirmDialog" @click.stop="importOldStockData()">{{ $t("Common.実行") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.home {
  --card-bg: rgba(255, 255, 255, 0.86);
  --card-border: rgba(22, 26, 34, 0.08);
  margin: 4px auto 28px;
  max-width: 1120px;
}
.theme--dark .home {
  --card-bg: rgba(255, 255, 255, 0.045);
  --card-border: rgba(255, 255, 255, 0.09);
}
.deep-sea .theme--dark .home {
  --card-bg: rgba(8, 20, 40, 0.5);
  --card-border: rgba(160, 196, 255, 0.14);
}

.home-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.home-title {
  margin: 0;
  font-size: 18px;
  font-weight: unset;
  letter-spacing: 0.02em;
  line-height: 1.3;
}
.version-pill {
  flex: none;
  margin: 0;
  padding: 3px 10px;
  color: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 999px;
  opacity: 0.75;
  transition: opacity 0.16s ease, border-color 0.16s ease;
}
.version-pill:hover {
  opacity: 1;
  border-color: rgba(128, 128, 128, 0.7);
}
.version-pill:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 26px 2px 12px;
  font-size: 13px;
  opacity: 0.72;
}
.section-head::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(128, 128, 128, 0.35);
}

.main-grid,
.extra-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.nav-slot {
  display: flex;
  min-width: 0;
}
.nav-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  min-height: 92px;
  margin: 0;
  padding: 16px 16px 15px;
  overflow: hidden;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background:
    linear-gradient(115deg, color-mix(in srgb, var(--accent) 14%, transparent), transparent 46%),
    var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(16, 20, 28, 0.04);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}
.nav-card::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: var(--accent);
}
.nav-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 55%, var(--card-border));
  box-shadow: 0 14px 32px rgba(16, 20, 28, 0.12);
}
.nav-card:active {
  transform: translateY(0);
}
.nav-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.nav-card:disabled {
  cursor: progress;
  opacity: 0.55;
  transform: none;
}
.theme--dark .nav-card {
  box-shadow: none;
}
.theme--dark .nav-card:hover {
  background:
    linear-gradient(115deg, color-mix(in srgb, var(--accent) 22%, transparent), transparent 48%),
    rgba(255, 255, 255, 0.07);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.32);
}

.nav-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
.nav-icon ::v-deep .v-icon {
  color: var(--accent);
  font-size: 22px;
}
.nav-card-body {
  flex: 1;
  min-width: 0;
}
.nav-card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-card-title {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  letter-spacing: 0.02em;
  line-height: 1.35;
}
.nav-card-desc {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  font-size: 12.5px;
  line-height: 1.55;
  opacity: 0.68;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.nav-go {
  flex: none;
  opacity: 0.35;
  transition: transform 0.16s ease, opacity 0.16s ease;
}
.nav-card:hover .nav-go {
  opacity: 0.9;
  transform: translateX(3px);
}

.nav-card--feature {
  min-height: 112px;
}
.nav-card--feature .nav-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
}
.nav-card--feature .nav-icon ::v-deep .v-icon {
  font-size: 28px;
}
.nav-card--feature .nav-card-title {
  font-size: 16px;
}
.nav-card--feature .nav-card-desc {
  max-width: 68ch;
  -webkit-line-clamp: 3;
}
.nav-card--compact {
  align-items: center;
  min-height: 84px;
  padding: 13px 14px;
}
.nav-card--compact .nav-card-desc {
  -webkit-line-clamp: 2;
}

.expansion-area {
  font-size: 14px;
}
.home-panels {
  background: transparent !important;
}
.home-panels ::v-deep .v-expansion-panel {
  margin-bottom: 10px;
  overflow: hidden;
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border);
  border-radius: 14px !important;
}
.home-panels ::v-deep .v-expansion-panel::before,
.home-panels ::v-deep .v-expansion-panel::after {
  display: none;
  border: none !important;
  box-shadow: none !important;
}
.home-panels ::v-deep .v-expansion-panel-header {
  min-height: 52px;
  padding: 12px 16px;
}
.home-panels ::v-deep .v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 52px;
}
.home-panels ::v-deep .v-expansion-panel-header .v-icon {
  opacity: 0.85;
}

.deck-sample {
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  color: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.28);
  border-radius: 8px;
}
.theme--dark .deck-sample {
  background: rgba(0, 0, 0, 0.28);
}
.deck-note-group {
  margin-top: 14px;
}
.deck-note-title {
  font-size: 12.5px;
  font-weight: 700;
}
.deck-sample-notes {
  display: grid;
  gap: 4px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  line-height: 1.55;
}
.deck-sample-notes li {
  display: grid;
  grid-template-columns: 7.5em 1fr;
  gap: 2px 14px;
  align-items: baseline;
}
.deck-sample-key {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
.deck-sample-notes li span:last-child {
  opacity: 0.78;
}

.info-area {
  margin-top: 32px;
  padding-top: 14px;
  border-top: 1px solid rgba(128, 128, 128, 0.22);
  font-size: 11px;
  line-height: 1.7;
  opacity: 0.55;
}
.support-buttons {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
  margin-top: 12px;
}

@media (min-width: 700px) {
  .main-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .nav-slot--feature {
    grid-column: 1 / -1;
  }
  .nav-card--feature {
    align-items: center;
    padding: 20px 22px;
  }
  .extra-grid {
    grid-template-columns: 1fr 1fr;
  }
  .support-buttons {
    grid-template-columns: 1fr 1fr;
    column-gap: 20px;
  }
}
@media (min-width: 1100px) {
  .extra-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';
import Convert, { OldShipStockJson } from '@/classes/convert';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ShipMaster from '@/classes/fleet/shipMaster';
import ReleaseNoteManager, { ReleaseNote } from '@/classes/releaseNote';
import ReleaseNoteList from '@/components/common/ReleaseNoteList.vue';

/** ホーム画面に並べるリリース数 */
const HOME_RELEASE_COUNT = 5;

/** サイト連携に載せる、このサイトが読み込むデッキビルダー形式の例 */
const DECK_BUILDER_SAMPLE = `{
  "version": 4,
  "hqlv": 120,
  "f1": {
    "name": "春雨艦隊",
    "t": 0,
    "s1": {
      "id": 975,
      "lv": 188,
      "luck": 79,
      "hp": 37,
      "asw": 132,
      "exa": true,
      "items": {
        "i1": { "id": 577, "rf": 10 },
        "i2": { "id": 577, "rf": 10 },
        "i3": { "id": 577, "rf": 10 },
        "ix": { "id": 412, "rf": 10 }
      },
      "spi": [{ "kind": 1, "fp": 0, "tp": 1, "ar": 1, "ev": 0 }]
    },
    "s2": {
      "id": 975,
      "lv": 188,
      "luck": -1,
      "items": {
        "i1": { "id": 529, "rf": 10 }
      }
    }
  },
  "f2": {
    "name": "支援",
    "s1": {
      "id": 975,
      "lv": 188,
      "luck": -1,
      "items": {
        "i1": { "id": 529, "rf": 10 }
      }
    }
  },
  "a1": {
    "name": "第1基地航空隊",
    "mode": 1,
    "items": {
      "i1": { "id": 312, "rf": 2, "mas": 7, "ac": 4 },
      "i2": { "id": 225, "rf": 0, "mas": 7, "ac": 18 },
      "i3": { "id": 484, "rf": 10, "mas": 7, "ac": 18 },
      "i4": { "id": 484, "rf": 10, "mas": 7, "ac": 18 }
    },
    "sp": [1, 1]
  },
  "a2": {
    "name": "第2基地航空隊",
    "mode": 2,
    "items": {
      "i1": { "id": 312, "rf": 0, "mas": 7, "ac": 4 }
    }
  },
  "s": {
    "a": 0,
    "i": 0,
    "c": [
      {
        "c": 0,
        "pf": 1,
        "ef": 1,
        "f1": {
          "s": [
            { "id": 1512, "items": [{ "id": 1519 }, { "id": 1523 }, { "id": 1516 }] },
            { "id": 1513, "items": [{ "id": 1519 }] }
          ]
        }
      },
      {
        "c": 1,
        "pf": 1,
        "ef": 1,
        "f1": {
          "s": [
            { "id": 1512, "items": [{ "id": 1519 }, { "id": 1523 }, { "id": 1516 }] },
            { "id": 1513, "items": [{ "id": 1519 }] }
          ]
        }
      }
    ]
  }
}`;

const DECK_BUILDER_NOTE_GROUPS = [
  {
    title: 'Home.デッキ例の全体',
    notes: [
      { label: 'version', text: 'Home.形式のバージョンです。このサイトは数値を見ていません。' },
      { label: 'hqlv', text: 'Home.司令部レベルです。無いときは 120 です。' },
    ],
  },
  {
    title: 'Home.デッキ例の艦隊',
    notes: [
      { label: 'name', text: 'Home.艦隊名です。空欄と、「第1艦隊」「第一艦隊」のような定型名は未設定になり、12文字で切ります。' },
      { label: 't', text: 'Home.f1 だけ見ます。0 が通常艦隊、1 が空母機動部隊、2 が水上打撃部隊、3 が輸送護衛部隊です。1 以上で連合になります。' },
      { label: 's1〜s7', text: 'Home.艦娘の位置です。s7 は7隻目で、空の枠は s6 まで作ります。' },
    ],
  },
  {
    title: 'Home.デッキ例の艦娘',
    notes: [
      { label: 'id', text: 'Home.艦娘idです。' },
      { label: 'lv', text: 'Home.レベルです。無いときは 99 です。' },
      { label: 'luck', text: 'Home.運です。0 以下か無いときは、素の運です。' },
      { label: 'hp', text: 'Home.耐久です。0 以下か無いときは、レベルに応じた素の耐久です。' },
      { label: 'asw', text: 'Home.表示対潜です。装備と改修を除いた差分を、対潜改修として取り込みます。0 以下は見ません。' },
      { label: 'exa', text: 'Home.補強増設を開放しているとき true です。' },
      { label: 'items', text: 'Home.装備です。' },
      { label: 'spi', text: 'Home.spi の先頭の kind だけ見ます。1 が海色リボン、2 が白たすきです。fp などの数値は見ません。' },
    ],
  },
  {
    title: 'Home.デッキ例の装備',
    notes: [
      { label: 'i1〜', text: 'Home.スロット順の装備です。艦娘はマスタのスロット数まで、基地は i1 から i4 まで読みます。' },
      { label: 'ix', text: 'Home.補強増設です。スロット数+1 のキーでも読めます。' },
      { label: 'id', text: 'Home.装備idです。' },
      { label: 'rf', text: 'Home.改修値です。' },
      { label: 'mas', text: 'Home.熟練度です。0 がなし、1 から 7 が熟練度です。' },
      { label: 'ac', text: 'Home.搭載数です。無いときは、艦娘はマスタの搭載数、基地は機種ごとの既定値です。' },
    ],
  },
  {
    title: 'Home.デッキ例の基地',
    notes: [
      { label: 'name', text: 'Home.基地名です。このサイトでは読み込みません。' },
      { label: 'mode', text: 'Home.0 が待機、1 が出撃、2 が防空です。' },
      { label: 'items', text: 'Home.基地の装備です。項目は艦娘の装備と同じです。' },
      { label: 'sp', text: 'Home.第1波と第2波の派遣先です。出撃 s のセル c と一致する戦闘へ送り、一致しなければ最後の戦闘です。' },
    ],
  },
  {
    title: 'Home.デッキ例の出撃',
    notes: [
      { label: 'a', text: 'Home.海域idです。' },
      { label: 'i', text: 'Home.マップidです。' },
      { label: 'c', text: 'Home.セルの配列です。並びが戦闘順になります。' },
    ],
  },
  {
    title: 'Home.デッキ例のセル',
    notes: [
      { label: 'c', text: 'Home.セルidです。a と i と組んで、このサイトのマス一覧を引きます。1-1 の A なら a が 1、i が 1、c が 1、2026夏 E-1 の A なら a が 62、i が 1、c が 1 です。当たるとマス名と戦闘形式と半径が入り、当たらないときは敵と陣形だけ入ります。' },
      { label: 'pf', text: 'Home.味方陣形です。1 単縦、2 複縦、3 輪形、4 梯形、5 単横、6 警戒、11 第一警戒、12 第二警戒、13 第三警戒、14 第四警戒です。最後のセルの値が、艦隊の陣形にもなります。' },
      { label: 'ef', text: 'Home.敵陣形です。番号は pf と同じです。' },
      { label: 'f1', text: 'Home.敵の第1艦隊です。先頭から 6 隻まで、id があるものだけ読みます。' },
      { label: 'f2', text: 'Home.敵の第2艦隊です。id がある敵艦を随伴として読みます。' },
    ],
  },
  {
    title: 'Home.デッキ例の敵',
    notes: [
      { label: 'id', text: 'Home.敵艦idです。' },
      { label: 'items', text: 'Home.敵の装備idです。このサイトでは読み込みません。' },
    ],
  },
];

let deckSampleCopyTimer = 0;

const CARD_ACCENT: Record<string, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f59e0b',
  grey: '#94a3b8',
  teal: '#14b8a6',
  'light-blue': '#0ea5e9',
  red: '#ef4444',
  pink: '#ec4899',
};

export default Vue.extend({
  name: 'TopPage',
  components: {
    ReleaseNoteList,
  },
  mounted() {
    const saveData = this.$store.state.saveData as SaveData;
    saveData.disabledMain();
    this.loadReleases();
  },
  data: () => ({
    releases: [] as ReleaseNote[],
    releasesLoading: true,
    releaseDialog: false,
    created: false,
    imported: false,
    importConfirmDialog: false,
    importFileName: '引き継ぎデータ',
    confirmDialog: false,
    importedStock: false,
    deckBuilderSample: DECK_BUILDER_SAMPLE,
    deckBuilderNoteGroups: DECK_BUILDER_NOTE_GROUPS,
    deckSampleCopied: false,
    mainPages: [
      {
        title: 'Home.制空権シミュレータ',
        icon: 'mdi-calculator',
        color: 'green',
        text: [
          'Home.本サイトの主要機能です。',
          'Home.基地航空隊や艦隊、敵艦隊を編成することで、道中を含めた全ての戦闘の制空状態や艦載機の損耗、全滅率などのシミュレーションが可能です。',
        ],
        url: 'aircalc',
      },
      {
        title: 'Home.艦娘 / 装備管理',
        icon: 'mdi-database-cog',
        color: 'blue',
        text: [
          'Home.サブの機能です。',
          'Home.自分のゲーム内の艦娘、装備情報を登録すると、シミュレータ内で選択できる艦娘や装備に反映され、あの装備持ってた…？と悩む心配がなくなります。',
        ],
        url: 'manager',
      },
      {
        title: 'Home.みんなの編成',
        icon: 'mdi-human-greeting-variant',
        color: 'orange',
        text: ['Home.他の人がアップロードした編成データを閲覧できます。'],
        url: 'list',
      },
      {
        title: 'Common.サイト設定',
        icon: 'mdi-cog',
        color: 'grey',
        url: 'setting',
      },
    ],
    extraPages: [
      {
        title: 'Extra.艦娘性能一覧',
        icon: 'mdi-account-switch',
        color: 'green',
        text: 'Extra.艦娘の基本ステータスの確認と比較を行えます。',
        url: 'extra',
      },
      {
        title: 'Extra.装備性能一覧',
        icon: 'mdi-compare-horizontal',
        color: 'teal',
        text: 'Extra.装備の基本ステータスの確認と比較を行えます。',
        url: 'extra#items',
      },
      {
        title: 'Extra.対潜値計算機',
        icon: 'mdi-finance',
        color: 'light-blue',
        text: 'Extra.艦娘と装備から、指定した対潜値と必要なLvを計算します。',
        url: 'extra#asw-calculator',
      },
      {
        title: 'Extra.戦果砲管理',
        icon: 'mdi-progress-check',
        color: 'orange',
        text: 'Extra.戦果に関係する任務の進捗を管理する機能です。',
        url: 'extra#quest',
      },
      {
        title: 'Extra.敵艦生息地検索',
        icon: 'mdi-map-search',
        color: 'red',
        text: 'Extra.指定した敵艦が登場する海域を検索します。データが更新されていない場合もあるので、あくまで参考程度に。',
        url: 'extra#habitat',
      },
      {
        title: 'Extra.敵対空おばけ',
        icon: 'mdi-fire-alert',
        color: 'pink',
        text: 'Extra.敵艦の対空砲火ランキングです。見かけたら気を付けるか覚悟しましょう。',
        url: 'extra#aa-ranking',
      },
    ],
  }),
  computed: {
    isNameEmpty(): boolean {
      return this.importFileName.length <= 0;
    },
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja';
    },
  },
  methods: {
    async loadReleases() {
      const releases = await ReleaseNoteManager.fetchReleases(this.$store.state.siteVersion);
      this.releases = releases.slice(0, HOME_RELEASE_COUNT);
      this.releasesLoading = false;
    },
    accentOf(color: string): string {
      return CARD_ACCENT[color] || '#94a3b8';
    },
    copyDeckBuilderSample() {
      const showCopied = () => {
        this.deckSampleCopied = true;
        window.clearTimeout(deckSampleCopyTimer);
        deckSampleCopyTimer = window.setTimeout(() => {
          this.deckSampleCopied = false;
        }, 1600);
      };
      const text = this.deckBuilderSample;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(() => {
          this.copyDeckBuilderSampleByTextarea(text, showCopied);
        });
        return;
      }
      this.copyDeckBuilderSampleByTextarea(text, showCopied);
    },
    copyDeckBuilderSampleByTextarea(text: string, done: () => void) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'true');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      done();
    },
    pageLead(page: { text?: string | string[] }): string {
      const { text } = page;
      if (!text) return '';
      const key = Array.isArray(text) ? text[text.length - 1] : text;
      return String(this.$t(key));
    },
    clickedButton(page: { url: string; clicked: boolean }) {
      if (page.clicked) return;
      switch (page.url) {
        case 'aircalc':
          page.clicked = true;
          this.goAirCalcPage();
          break;
        case 'setting':
          this.$emit('showSiteSetting');
          break;
        default:
          page.clicked = true;
          this.$router.push(page.url);
          break;
      }
    },
    goAirCalcPage() {
      const saveData = this.$store.state.saveData as SaveData;
      saveData.disabledMain();

      // ルートに無題のデータを生成
      const data = new SaveData();
      data.name = saveData.getNewSaveDataName();
      if (this.needTrans) {
        data.name = data.name.replace('新規データ', `${this.$t('SaveData.新規データ')} `);
      }
      data.isActive = true;
      data.isMain = true;
      saveData.childItems.push(data);
      this.$store.dispatch('updateSaveData', saveData);
      this.$store.dispatch('setMainSaveData', data);
      this.$router.push('aircalc');
    },
    checkOldData() {
      // 過去データが存在するかチェック
      const storage = window.localStorage;
      if (!storage) {
        this.$emit('inform', '旧編成データが見つかりませんでした。', true);
        this.imported = true;
        return;
      }

      const presets = storage.getItem('presets');
      const presetJSON = presets ? JSON.parse(presets) : undefined;
      if (!presetJSON || !presetJSON.length) {
        this.$emit('inform', '旧編成データが見つかりませんでした。', true);
        this.imported = true;
        return;
      }

      if (this.needTrans) {
        this.importFileName = `${this.$t('SaveData.引き継ぎデータ')}`;
      }
      this.imported = false;
      this.importConfirmDialog = true;
    },
    checkOldStockData() {
      this.importedStock = true;

      // 過去データが存在するかチェック
      const storage = window.localStorage;
      if (!storage) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      const shipStocks = storage.getItem('shipStock');
      const itemStocks = storage.getItem('planeStock');
      const shipStocksJSON = shipStocks ? JSON.parse(shipStocks) : undefined;
      const itemStocksJSON = itemStocks ? JSON.parse(itemStocks) : undefined;
      if ((!shipStocksJSON || !shipStocksJSON.length) && (!itemStocksJSON || !itemStocksJSON.length)) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      const hasCurrentStock = !!this.$store.state.shipStock.length || !!this.$store.state.itemStock.length;
      if (hasCurrentStock) {
        // 既にデータがあるならダイアログ
        this.confirmDialog = true;
        this.importedStock = false;
      } else {
        this.importOldStockData();
      }
    },
    importOldStockData() {
      this.importedStock = true;

      // 過去データが存在するかチェック
      const storage = window.localStorage;
      if (!storage) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      const shipStocks = storage.getItem('shipStock');
      const itemStocks = storage.getItem('planeStock');
      const shipStocksJSON = shipStocks ? JSON.parse(shipStocks) : undefined;
      const itemStocksJSON = itemStocks ? JSON.parse(itemStocks) : undefined;
      if ((!shipStocksJSON || !shipStocksJSON.length) && (!itemStocksJSON || !itemStocksJSON.length)) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      try {
        const setting = this.$store.state.siteSetting as SiteSetting;
        let restoreResult = false;
        if (shipStocksJSON && shipStocksJSON.length) {
          // 在籍艦娘情報変換 & 上書き
          const newStocks = Convert.restoreShipStock(shipStocksJSON as OldShipStockJson[], this.$store.state.ships as ShipMaster[]);
          if (newStocks.length) {
            restoreResult = true;
            // 設定書き換え
            setting.isStockOnlyForShipList = true;
            this.$store.dispatch('updateShipStock', newStocks);
          }
        }

        if (itemStocksJSON && itemStocksJSON.length) {
          // 所持装備情報変換 & 上書き
          const newStocks = Convert.restoreItemStock(itemStocksJSON as ItemStock[]);
          if (newStocks.length) {
            restoreResult = true;
            // 設定書き換え
            setting.isStockOnlyForItemList = true;
            this.$store.dispatch('updateItemStock', newStocks);
          }
        }

        this.$store.dispatch('updateSetting', setting);

        if (!restoreResult) {
          this.$emit('inform', 'データを読み込みましたが、引き継ぎ可能な編成データがありませんでした。', true);
          return;
        }

        this.$emit('inform', '所持装備 / 艦娘データの引き継ぎが完了しました。');
      } catch (error) {
        this.$emit('inform', 'データ引継ぎに失敗しました。', true);
        console.error(error);
      }
      this.confirmDialog = false;
    },
    importOldData() {
      this.imported = true;
      // 旧データ引継ぎ
      const storage = window.localStorage;
      try {
        const presets = storage.getItem('presets');
        const presetJSON = presets ? JSON.parse(presets) : undefined;
        if (!presetJSON || !presetJSON.length) {
          return;
        }

        const setting = storage.getItem('setting');
        const settingJSON = setting ? JSON.parse(setting) : undefined;
        const converter = new Convert(this.$store.state.items, this.$store.state.ships, this.$store.state.defaultEnemies);
        const oldData = converter.convertOldSimulatorToSaveData(presetJSON, settingJSON);

        if (oldData && oldData.childItems.length) {
          oldData.name = this.importFileName ? this.importFileName : '引き継ぎデータ';
          // セーブデータルート取得
          const saveData = this.$store.state.saveData as SaveData;
          const root = saveData.childItems.find((v) => v.isDirectory);
          if (root) {
            root.childItems.push(oldData);
            root.sortChild();
            this.$store.dispatch('updateSaveData', saveData);

            // 旧データ取り込み完了通知
            this.$emit('inform', '編成データの引き継ぎが完了しました。');
            this.$emit('openSidebar');
          }
        } else {
          this.$emit('inform', 'データを読み込みましたが、引き継ぎ可能な編成データがありませんでした。', true);
        }
      } catch (error) {
        this.$emit('inform', 'データ引継ぎに失敗しました。', true);
        console.error(error);
      }

      this.importConfirmDialog = false;
    },
    createBackUp() {
      this.created = true;
      this.$emit('downloadBackupFile');
    },
  },
});
</script>
