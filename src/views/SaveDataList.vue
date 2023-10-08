<template>
  <div class="mb-5">
    <div class="general-container">
      <v-card class="pa-3">
        <div class="mt-2 search-inputs">
          <div class="world-select-all">
            <v-select
              dense
              v-model="selectedArea"
              hide-details
              :items="areaItems"
              :label="$t('Enemies.海域')"
              @change="changedWorld()"
              :menu-props="{ maxHeight: '600px' }"
            />
          </div>
          <div v-show="isEvent">
            <v-select dense v-model="level" hide-details :items="levelItems" @change="changedWorld()" :label="$t('Difficulty.難易度')" />
          </div>
          <div class="ml-3">
            <v-btn color="success" @click="searchPreset()" :disabled="isLoading || isSameSearchCondition">{{ $t("Common.検索") }}</v-btn>
          </div>
          <div class="ml-auto align-self-end caption" v-if="saveData && saveData.length">{{ saveData.length }}{{ $t("Common.件") }}</div>
        </div>
      </v-card>
      <div>
        <v-card v-for="(preset, i) in saveData" :key="`data_${i}`" class="preset-item">
          <div class="d-flex">
            <div class="align-self-end">{{ preset.name }}</div>
            <v-spacer />
            <v-btn icon @click="expandPreset(preset)">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </div>
          <v-divider />
          <div class="d-flex flex-wrap my-1">
            <div v-for="(ship, j) in preset.ships" :key="`ship${i}_${j}`">
              <v-img v-if="ship.data.id && ship.isActive" :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
            </div>
          </div>
          <div class="d-flex flex-wrap my-1" v-if="preset.ships2 && preset.ships2.length">
            <div v-for="(ship, j) in preset.ships2" :key="`ship${i}_${j}`">
              <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
            </div>
          </div>
          <div class="preset-memo" v-if="preset.memo">{{ preset.memo }}</div>
          <div class="d-flex flex-wrap justify-end">
            <div class="d-flex mx-2">
              <div><v-icon small>mdi-account</v-icon></div>
              <div class="caption align-self-center">{{ preset.user }}</div>
            </div>
            <div class="d-flex mx-2">
              <div><v-icon small>mdi-clock-time-four-outline</v-icon></div>
              <div class="caption align-self-center">{{ preset.createdAt }}</div>
            </div>
          </div>
        </v-card>
      </div>
      <div v-if="enabledMoreLoad && !isLoading" class="mt-3">
        <v-btn color="primary" block @click="searchPreset()">{{ $t("Common.さらに読み込む") }}</v-btn>
      </div>
      <div v-if="isLoading" class="py-5">
        <div class="d-flex justify-center">
          <v-progress-circular size="70" color="secondary" indeterminate />
        </div>
      </div>
    </div>
    <div class="info-area">
      <v-divider class="mb-2" />
      <div class="caption">
        {{ $t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。") }}
      </div>
      <div class="caption">
        {{ $t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。") }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-area {
  margin: 2rem auto 0.5rem auto;
  max-width: 1200px;
}
.general-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-inputs {
  display: flex;
}
.search-inputs > div {
  align-self: center;
}

.world-select-all {
  max-width: 70%;
}

.preset-item {
  padding: 0.25rem 0.75rem;
  margin-top: 1rem;
}
.preset-memo {
  padding: 0.25rem;
  font-size: 0.8em;
  white-space: pre-line;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 2px;
  background-color: rgba(128, 128, 128, 0.1);
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const, { DIFFICULTY_LEVEL } from '@/classes/const';
import {
  collection,
  DocumentData,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
  orderBy,
  Query,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore/lite';
import Convert from '@/classes/convert';
import SaveData from '@/classes/saveData/saveData';
import { UploadedPreset } from '@/classes/interfaces/uploadedPreset';
import LZString from 'lz-string';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import { MasterMap, MasterWorld } from '@/classes/interfaces/master';

const STEP = 20;

export default Vue.extend({
  name: 'SaveDataList',
  components: {},
  data: () => ({
    areaItems: [] as ({ divider: boolean } | { header: string } | { value: number; text: string; group: string })[],
    selectedArea: 11,
    level: DIFFICULTY_LEVEL.HARD,
    saveData: [] as UploadedPreset[],
    isLoading: false,
    lastMap: 0,
    lastLevel: 0,
    lastDocument: undefined as undefined | QueryDocumentSnapshot<DocumentData>,
  }),
  mounted() {
    const saveData = this.$store.state.saveData as SaveData;
    saveData.disabledMain();

    this.initWorlds();
    const initialList = this.$store.state.searchedList as UploadedPreset[];
    if (initialList && initialList.length) {
      this.saveData = initialList;
    }
  },
  computed: {
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    levelItems(): { text: string; value: number }[] {
      if (this.needTrans) {
        const items = [];
        for (let i = 0; i < Const.DIFFICULTY_LEVELS.length; i += 1) {
          const { text, value } = Const.DIFFICULTY_LEVELS[i];
          items.push({ text: `${this.$t(`Difficulty.${text}`)}`, value });
        }
        return items;
      }
      return Const.DIFFICULTY_LEVELS;
    },
    getCompletedAll() {
      return this.$store.getters.getCompletedAll;
    },
    isEvent(): boolean {
      return Math.floor(this.selectedArea / 10) > 40;
    },
    isSameSearchCondition(): boolean {
      return this.lastMap === this.selectedArea && this.lastLevel === this.level;
    },
    enabledMoreLoad(): boolean {
      return !!this.lastDocument && this.isSameSearchCondition;
    },
  },
  watch: {
    getCompletedAll(value) {
      if (value) {
        this.initWorlds();
      }
    },
  },
  methods: {
    initWorlds() {
      // 海域セレクトボックス初期化
      const items = [];
      const worlds = this.$store.state.worlds as MasterWorld[];
      const masterMaps = this.$store.state.maps as MasterMap[];
      if (worlds && masterMaps) {
        for (let i = 0; i < worlds.length; i += 1) {
          const world = worlds[i];
          const maps = masterMaps.filter((v) => Math.floor(v.area / 10) === world.world);
          if (!maps.length) {
            continue;
          }
          if (i > 0) {
            items.push({ divider: true });
          }

          items.push({ header: world.name });
          for (let j = 0; j < maps.length; j += 1) {
            const map = maps[j];
            const worldText = world.world > 40 ? 'E' : `${world.world}`;
            items.push({ value: map.area, text: `${worldText}-${map.area % 10}：${map.name}`, group: world.name });
          }
        }
      }
      this.areaItems = items;
    },
    changedWorld() {
      this.isLoading = false;
    },
    async searchPreset() {
      this.isLoading = true;
      if (!this.enabledMoreLoad) {
        this.saveData = [];
      }

      try {
        const db = getFirestore();
        const fbLevel = 4 - this.level;
        let q: Query<DocumentData>;
        if (this.isEvent) {
          if (this.lastDocument) {
            q = query(
              collection(db, 'presets'),
              where('map', '==', this.selectedArea),
              where('level', '==', fbLevel),
              orderBy('createdAt', 'desc'),
              startAfter(this.lastDocument),
              limit(STEP),
            );
          } else {
            q = query(
              collection(db, 'presets'),
              where('map', '==', this.selectedArea),
              where('level', '==', fbLevel),
              orderBy('createdAt', 'desc'),
              limit(STEP),
            );
          }
        } else if (this.lastDocument) {
          q = query(
            collection(db, 'presets'),
            where('map', '==', this.selectedArea),
            where('level', '==', 0),
            orderBy('createdAt', 'desc'),
            startAfter(this.lastDocument),
            limit(STEP),
          );
        } else {
          q = query(collection(db, 'presets'), where('map', '==', this.selectedArea), where('level', '==', 0), orderBy('createdAt', 'desc'), limit(STEP));
        }

        // 今回の検索条件を保持
        this.lastMap = this.selectedArea;
        this.lastLevel = this.level;

        const snapShot = await getDocs(q);
        const fetchData: UploadedPreset[] = [];
        const items = this.$store.state.items as ItemMaster[];
        const ships = this.$store.state.ships as ShipMaster[];
        const enemies = this.$store.state.defaultEnemies as EnemyMaster[];
        const converter = new Convert(items, ships, enemies);
        snapShot.forEach((doc) => {
          // 中間生成物
          const preset = doc.data() as UploadedPreset;
          if (preset.ver === 2) {
            // 新版編成復元
            const managerString = LZString.decompressFromBase64(doc.data().data) || '';
            const manager = SaveData.loadSaveDataManagerString(managerString, items, ships, enemies, true);
            if (manager) {
              preset.ships = manager.fleetInfo.fleets[0].ships;
              if (manager.fleetInfo.isUnion) {
                preset.ships2 = manager.fleetInfo.fleets[1].ships.filter((v) => v.data.id);
              }
              preset.manager = manager;
              preset.createdAt = Convert.formatDate(doc.data().createdAt.toDate(), 'yyyy/MM/dd HH:mm:ss');
              fetchData.push(preset);
            }
          } else {
            // 編成復元
            const manager = converter.restoreOldSaveData(doc.data().data);
            if (manager) {
              preset.ships = manager.fleetInfo.fleets[0].ships;
              if (manager.fleetInfo.isUnion) {
                preset.ships2 = manager.fleetInfo.fleets[1].ships.filter((v) => v.data.id);
              }
              preset.manager = manager;
              preset.createdAt = Convert.formatDate(doc.data().createdAt.toDate(), 'yyyy/MM/dd HH:mm:ss');
              fetchData.push(preset);
            }
          }
        });

        if (this.lastDocument && this.saveData) {
          // 追加読み込みの場合はpushする
          this.saveData = this.saveData.concat(fetchData);
        } else {
          this.saveData = fetchData;
        }

        // 追加読み込み制御
        if (snapShot && snapShot.docs.length >= STEP) {
          this.lastDocument = snapShot.docs[snapShot.docs.length - 1];
        } else {
          this.lastDocument = undefined;
        }

        // 次回訪問時復帰するため保持
        this.$store.dispatch('setSearchedList', this.saveData);
      } catch (error) {
        console.error(error);
        this.saveData = [];
        this.$emit('inform', '編成データ読み込み中にエラーが発生しました。', true);
      }
      this.isLoading = false;
    },
    expandPreset(preset: UploadedPreset) {
      const saveData = this.$store.state.saveData as SaveData;
      saveData.disabledMain();

      // ルートに無題のデータを生成
      const data = new SaveData();
      data.name = preset.name;
      data.remarks = preset.memo;
      data.tempData = [preset.manager];
      data.tempIndex = 0;
      data.isActive = true;
      data.isMain = true;
      saveData.childItems.push(data);

      this.$store.dispatch('updateSaveData', saveData);
      this.$store.dispatch('setMainSaveData', data);
      this.$router.push('aircalc');
    },
  },
});
</script>
