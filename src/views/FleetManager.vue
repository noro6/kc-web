<template>
  <div class="ma-4">
    <div class="mb-3">
      <v-icon x-large>mdi-database-cog</v-icon>
      <span class="ml-1">艦娘 / 装備管理</span>
    </div>
    <v-tabs v-model="tab">
      <v-tab href="#ships">艦娘</v-tab>
      <v-tab href="#items">装備</v-tab>
      <v-tab href="#read">反映</v-tab>
      <v-tab href="#share" disabled>共有【工事中】</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-tabs-items v-model="tab">
      <v-tab-item value="ships">
        <ships />
      </v-tab-item>
      <v-tab-item value="items">
        <items />
      </v-tab-item>
      <v-tab-item value="read">
        <div class="general-container pa-4 my-2">
          <v-card class="tutorial_box">
            <div>1. 艦これにログイン後、艦これ画面上で右クリックし、コンテキストメニューから「検証」を選択</div>
            <div>※ 以降、反映手順については、PC版ブラウザ『Google Chrome』における説明となっています。</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial1.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>2. ウインドウが開くので、「Console」タブを開き、「Clear console」ボタンを押下</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial2.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>3. consoleに「this.KCS」と入力してEnterを押下、表示されたオブジェクトについて矢印を選択して内容を展開</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial3.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>4. 4つあるオブジェクトのなかで、内容が「{__esModule: true, default: ƒ}」となっているオブジェクトを探す</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial4.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>5. 4で見つけたオブジェクトのうち、「default」まで展開したときに中に「model」が存在するものを探す</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial5.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>
              6. 「model」が存在する方の「default」の上で右クリックし、「Store function as global variable」（なければ「Store as global
              variable」）を選択
            </div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial6.jpg`" />
            </div>
            <div>
              選択すると、下記のように「temp1」と出てきます。もし、temp2など数字が違っている場合、次の手順7.の注意事項欄を見てください。
            </div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial6_2.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>
              7. 下記のJavaScriptコードをconsoleに貼り付け、Enterを押下。※
              押下後、『undefined』と表示されれば、クリップボードに自動コピーされており、そのまま手順8の入力欄に貼り付けることができます。
            </div>
            <div class="d-flex">
              <v-radio-group v-model="includeUnLocked" row hide-details class="py-0">
                <v-radio label="未ロックも含める" :value="true"></v-radio>
                <v-radio label="ロック済みのみ" :value="false"></v-radio>
              </v-radio-group>
            </div>
            <div>
              <v-tabs v-model="code_tab">
                <v-tab href="#ship_code">艦娘</v-tab>
                <v-tab href="#item_code">装備</v-tab>
              </v-tabs>
            </div>
            <v-tabs-items v-model="code_tab">
              <v-tab-item value="ship_code">
                <v-card class="copy_code">
                  copy(JSON.stringify(Object.entries(<span class="red--text">temp1</span>.model.ship._map).map(([,v])=>{return{'id':
                  v._o.api_ship_id,'lv': v._o.api_lv,'locked': v._o.api_locked,'st':
                  v._o.api_kyouka,'exp':v._o.api_exp,'ex':v._o.api_slot_ex,'area':v._o.api_sally_area}})<span v-if="!includeUnLocked"
                    >.filter(v=>v.locked)</span
                  >,['id','lv','st','exp','ex','area']))
                </v-card>
              </v-tab-item>
              <v-tab-item value="item_code">
                <v-card class="copy_code">
                  copy(JSON.stringify(Object.entries(<span class="red--text">temp1</span>.model.slot._map).map(([,v])=>{return
                  {'id':v._o.api_slotitem_id,'lv': v._o.api_level,'locked':v._o.api_locked}})<span v-if="!includeUnLocked"
                    >.filter(v=>v.locked)</span
                  >,['id','lv']))
                </v-card>
              </v-tab-item>
            </v-tabs-items>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial7.jpg`" />
            </div>
            <div class="warning_box mt-3">
              <div>注意事項</div>
              <div class="mt-1">
                手順6.「Store function as global variable」を選択した際に出てくる「<span class="red--text">temp○○</span>」と、
                上記JavaScript内の「<span class="red--text">temp○○</span>」は一致させる必要があります。
              </div>
              <div>
                手順通りやるとtemp1となりますが、手順6.で例えば「temp2」と出てきていたら、JavaScriptコードの「temp1」の部分を「temp2」と自分で書き換えて実行してください。
              </div>
              <div class="tutorial_img">
                <v-img :src="`./img/tutorial/tutorial7_2.jpg`" />
              </div>
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>8. 下記の反映エリアに、手順7.でコピーされた艦隊情報を貼り付けて「在籍艦娘反映」を押下</div>
            <v-textarea v-model.trim="inputText" outlined dense hide-details no-resize label="反映エリア"></v-textarea>
            <v-btn class="mt-2" color="primary" @click="readJson()">在籍艦娘反映</v-btn>
          </v-card>
        </div>
      </v-tab-item>
      <v-tab-item value="share">

      </v-tab-item>
    </v-tabs-items>
    <div class="info-area">
      <v-divider class="mb-2"></v-divider>
      <div class="caption">
        著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。
      </div>
      <div class="caption">また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。</div>
    </div>
    <v-snackbar v-model="readInform" :color="readResultColor" top>
      {{ readInformText }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="readInform = false"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.v-window.v-item-group {
  height: 100%;
  overflow: unset;
}
.info-area {
  margin: 2rem auto 0.5rem auto;
}
.tutorial_box {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
}
.copy_code {
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  margin-bottom: 1rem;
  padding: 1rem;
}
.warning_box {
  border-radius: 0.25rem;
  border: 2px solid rgb(218, 183, 80);
  padding: 0.5rem 1rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Ships from '@/components/database/Ships.vue';
import Items from '@/components/database/Items.vue';
import Convert from '@/classes/convert';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'FleetManager',
  components: { Ships, Items },
  data: () => ({
    tab: 'ship',
    code_tab: 'ship_code',
    includeUnLocked: false,
    readInformText: '',
    readResultColor: 'success',
    inputText: '',
    readInform: false,
  }),
  methods: {
    readJson() {
      // デッキビルダー形式データ読み込み試行
      if (this.setShipStock()) {
        // 在籍艦娘データ読み込み試行
        this.readInformText = '在籍艦娘データの更新が完了しました。';
        this.readResultColor = 'success';
      } else if (this.setItemStock()) {
        // 所持装備データ読み込み試行
        this.readInformText = '所持装備データの更新が完了しました。';
        this.readResultColor = 'success';
      } else {
        // 全部失敗
        this.readInformText = 'データの読み込みに失敗しました。正しいデータではない可能性があります。';
        this.readResultColor = 'error';
      }

      // 後始末と通知
      this.inputText = '';
      this.readInform = true;
    },
    setShipStock(): boolean {
      // 在籍艦娘情報を更新
      try {
        const shipList = Convert.readShipStockJson(this.inputText);
        if (shipList.length === 0) {
          // 何もない在籍データは無意味なので返す
          return false;
        }
        // 設定書き換え
        const setting = this.$store.state.siteSetting as SiteSetting;
        setting.isStockOnlyForShipList = true;
        this.$store.dispatch('updateSetting', setting);
        this.$store.dispatch('updateShipStock', shipList);
        return true;
      } catch (error) {
        return false;
      }
    },
    setItemStock(): boolean {
      // 所持装備情報を更新
      try {
        const itemList = Convert.readItemStockJson(this.inputText);
        if (itemList.length === 0) {
          // 何もない所持装備データは無意味なので返す
          return false;
        }
        const setting = this.$store.state.siteSetting as SiteSetting;
        setting.isStockOnlyForItemList = true;
        this.$store.dispatch('updateSetting', setting);
        this.$store.dispatch('updateItemStock', itemList);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
});
</script>
