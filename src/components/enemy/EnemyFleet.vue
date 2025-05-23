<template>
  <v-card class="py-2">
    <div class="d-flex align-center pl-2 pr-1">
      <div class="battle-title">{{ $t("Enemies.x戦目", { number: index + 1 }) }}</div>
      <div v-if="fleet.existUnknownEnemy" class="align-self-start ml-1">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="warning" v-bind="attrs" v-on="on">mdi-alert</v-icon>
          </template>
          <div>{{ $t("Enemies.搭載数が未確定の敵艦が含まれています。") }}</div>
          <div>{{ $t("Enemies.表示制空値は目安のもので、正確な制空値ではありません。") }}</div>
        </v-tooltip>
      </div>
      <v-spacer />
      <div v-if="capturing && fleet.nodeName" class="mr-2">{{ fleet.nodeName }}</div>
      <div v-if="!capturing" class="mr-1">
        <v-btn class="d-none d-sm-block" outlined small @click.stop="showWorldList">
          {{ fleet.nodeName ? fleet.nodeName : $t("Enemies.海域選択") }}
        </v-btn>
        <v-btn class="d-sm-none" icon small color="primary" @click.stop="showWorldList">
          <v-icon>mdi-sync</v-icon>
        </v-btn>
      </div>
      <div v-if="existEnemy && !capturing">
        <v-btn color="primary" icon small @click="clickedInfo()">
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
        <v-btn icon small @click="resetFleet()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="px-2">
      <div class="select-container">
        <div class="cell-type-select">
          <v-select dense v-model="fleet.cellType" hide-details :items="cellTypes" @change="changedCombo()" />
        </div>
        <div class="formation-select">
          <v-select dense v-model="fleet.formation" hide-details :items="formations" @change="changedCombo()" />
        </div>
      </div>
      <div class="d-flex total-status">
        <div class="text--secondary">{{ $t("Common.艦隊防空") }}</div>
        <div class="ml-1">{{ fleet.fleetAntiAir }}</div>
        <v-spacer />
        <div class="mx-1 text--secondary">{{ $t("Common.制空") }}</div>
        <div class="enemy-air-power">{{ fleet.fullAirPower }}</div>
        <div class="ml-1" v-if="fleet.existUnknownEnemy">&#x3f;</div>
      </div>
      <div class="d-flex total-status">
        <div class="text--secondary">{{ $t("Common.半径") }}</div>
        <div class="ml-1">{{ fleet.radius ? fleet.radius.join(" or ") : 0 }}</div>
        <v-spacer />
        <div class="mx-1 text--secondary">{{ $t("Common.基地制空") }}</div>
        <div class="enemy-air-power">{{ fleet.fullAirbaseAirPower }}</div>
        <div class="ml-1" v-if="fleet.existUnknownEnemy">&#x3f;</div>
      </div>
    </div>
    <v-divider />
    <div class="enemy-list mt-1">
      <div
        v-for="(enemy, index) in fleet.enemies"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="enemy-list-item pr-2"
        :class="{ 'disabled-stage2': enemy.disabledMainAerialPhase }"
        @click="openMenu(index)"
        @keypress.enter="openMenu(index)"
      >
        <template v-if="enemy.data.id || (!capturing && enemy.data.id === 0)">
          <div class="item-index-area">
            <div class="enemy-index caption primary--text mr-1" :class="{ 'success--text': index >= 6 }">{{ (index % 6) + 1 }}</div>
          </div>
          <div
            v-if="enemy.data.id > 0"
            @mouseenter="bootTooltip(enemy, $event)"
            @mouseleave="clearTooltip"
            @focus="bootTooltip(enemy, $event)"
            @blur="clearTooltip"
          >
            <div class="enemy-img">
              <v-img :src="`./img/ship/banner/${enemy.data.id}.png`" height="30" width="120" />
              <div v-if="enemy.hasRadar" class="radar-icon">
                <v-img :src="`./img/type/icon11.png`" height="22" width="22" />
              </div>
            </div>
          </div>
          <div v-if="enemy.data.id === 0" class="enemy-name text-center text--secondary">{{ $t("Enemies.敵艦選択") }}</div>
          <div class="d-none d-sm-block ml-auto pl-1 caption text--secondary">{{ $t("Common.制空") }}</div>
          <div
            class="d-none d-sm-block enemy-air-power"
            :class="{ 'orange--text text--darken-2': enemy.data.isUnknown }"
            v-if="enemy.fullAirPower === enemy.fullLBAirPower"
          >
            {{ enemy.fullAirPower }}
          </div>
          <div class="d-none d-sm-block enemy-air-power" :class="{ 'orange--text text--darken-2': enemy.data.isUnknown }" v-else>
            ({{ enemy.fullLBAirPower }})
          </div>
        </template>
      </div>
    </div>
    <v-dialog width="1100" v-model="detailDialog" transition="scroll-x-transition" @input="toggleDetailDialog" :fullscreen="isMobile">
      <enemy-detail v-if="!destroyDialog" :handle-show-item-list="showItemList" :fleet="fleet" :handleClose="closeDetail" />
    </v-dialog>
    <v-dialog width="400" v-model="menuDialog" transition="scroll-x-transition" @input="toggleMenuDialog">
      <v-card class="pa-5">
        <v-btn class="my-3" color="primary" block @click="showEnemyList(editEnemyIndex)">{{ $t("Enemies.変更する") }}</v-btn>
        <v-btn class="my-3" color="secondary" block @click="removeEnemy(editEnemyIndex)">{{ $t("Enemies.はずす") }}</v-btn>
        <div class="type-divider mt-10">
          <div class="caption text--secondary">{{ $t("Enemies.詳細設定") }}</div>
          <div class="type-divider-border" />
        </div>
        <v-btn class="mt-3" color="error" block :disabled="editEnemy.disabledMainAerialPhase" @click="toggleDisabledStage2(editEnemyIndex)">
          {{ $t("Enemies.基地航空隊フェーズで撃沈する") }}
        </v-btn>
        <v-btn class="mt-3" color="success" block :disabled="!editEnemy.disabledMainAerialPhase" @click="toggleDisabledStage2(editEnemyIndex)">
          {{ $t("Enemies.基地航空隊フェーズで撃沈しない") }}
        </v-btn>
      </v-card>
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <enemy-tooltip v-model="tooltipEnemy" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.battle-title {
  font-size: 14px;
}
@media (min-width: 600px) {
  .battle-title {
    font-size: unset;
    cursor: move;
  }
}

.v-btn--outlined {
  padding: 0 0.25rem !important;
}

.enemy-list-item {
  display: flex;
  align-items: center;
  transition: 0.1s;
  cursor: pointer;
  height: 30px;
  position: relative;
  justify-content: space-around;
}
.enemy-list-item:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.enemy-list-item.disabled-stage2 {
  opacity: 0.4;
}
@media (min-width: 600px) {
  .enemy-list-item {
    justify-content: unset;
  }
}

.enemy-img {
  position: relative;
}
.radar-icon {
  position: absolute;
  right: 0;
  top: 0;
  background-color: rgba(0, 13, 29, 0.75);
  border-radius: 50%;
}

.item-index-area {
  width: 20px;
  text-align: center;
}
.enemy-index {
  text-align: right;
}
.enemy-name {
  width: 120px;
  font-size: 0.7em;
}
.total-status {
  font-size: 11px;
}
.enemy-air-power {
  font-size: 11px;
  width: 24px;
  text-align: right;
  white-space: nowrap;
}
@media (min-width: 600px) {
  .total-status {
    font-size: 12px;
  }
  .enemy-air-power {
    font-size: 12px;
    width: 30px;
  }
}

.type-divider {
  margin-top: 1rem;
  display: flex;
  width: 100%;
}
.type-divider-border {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.select-container {
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: 4px;
}
.formation-select >>> .v-input--dense .v-select__selection,
.cell-type-select >>> .v-input--dense .v-select__selection {
  font-size: 11px !important;
}
@media (min-width: 600px) {
  .select-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .formation-select,
  .cell-type-select {
    width: 94px;
  }
  .formation-select >>> .v-input--dense .v-select__selection,
  .cell-type-select >>> .v-input--dense .v-select__selection {
    font-size: 0.75em !important;
  }
}
</style>

<style>
.captured .formation-select,
.captured .cell-type-select {
  width: 94px !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyDetail from '@/components/enemy/EnemyDetail.vue';
import EnemyTooltip from '@/components/enemy/EnemyTooltip.vue';
import Const, { CELL_TYPE, Formation } from '@/classes/const';
import EnemyFleet, { EnemyFleetBuilder } from '@/classes/enemy/enemyFleet';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'EnemyFleet',
  components: {
    EnemyDetail,
    EnemyTooltip,
  },
  props: {
    value: {
      type: EnemyFleet,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    handleShowEnemyList: {
      type: Function,
      required: true,
    },
    handleShowItemList: {
      type: Function,
      required: true,
    },
    handleShowWorldList: {
      type: Function,
      required: true,
    },
    capturing: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isMobile: true,
    detailDialog: false,
    destroyDialog: false,
    enabledTooltip: false,
    editEnemyIndex: 0,
    editEnemy: new Enemy(),
    menuDialog: false,
    tooltipTimer: undefined as undefined | number,
    tooltipEnemy: new Enemy(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  computed: {
    fleet(): EnemyFleet {
      return this.value;
    },
    formations(): Formation[] {
      if (this.$i18n.locale !== 'ja') {
        const items = [];
        for (let i = 0; i < Const.FORMATIONS.length; i += 1) {
          const { text, value, correction } = Const.FORMATIONS[i];
          items.push({ text: `${this.$t(`Common.${text}`)}`, value, correction });
        }
        return items;
      }
      return Const.FORMATIONS;
    },
    cellTypes(): { text: string; value: number }[] {
      if (this.$i18n.locale !== 'ja') {
        const items = [];
        for (let i = 0; i < Const.CELL_TYPES.length; i += 1) {
          const { text, value } = Const.CELL_TYPES[i];
          items.push({ text: `${this.$t(`Common.${text}`)}`, value });
        }
        return items;
      }
      return Const.CELL_TYPES;
    },
    existEnemy() {
      return this.value.enemies.find((v) => v.data.id);
    },
  },
  methods: {
    showItemList(enemyIndex: number, slotIndex: number) {
      this.handleShowItemList(this.index, enemyIndex, slotIndex);
    },
    showEnemyList(index: number) {
      this.clearTooltip();
      this.handleShowEnemyList(this.index, index);
      this.menuDialog = false;
    },
    async clickedInfo() {
      this.isMobile = window.innerWidth < 600;
      this.detailDialog = true;
      this.destroyDialog = false;
    },
    setFleet(fleet?: EnemyFleet) {
      if (fleet === undefined) {
        this.$emit('input', new EnemyFleet({ fleet: this.fleet }));
      } else {
        this.$emit('input', fleet);
      }
    },
    resetFleet() {
      this.setFleet(new EnemyFleet());
    },
    changedCombo() {
      const enemyFleet = this.fleet;
      const isUnion = enemyFleet.cellType === CELL_TYPE.GRAND;
      const enemies = enemyFleet.enemies.concat();
      if (isUnion && enemyFleet.enemies.length <= 6) {
        for (let i = 0; i < 6; i += 1) {
          enemies.push(new Enemy(new EnemyMaster(), [], true));
        }
      } else if (!isUnion && enemyFleet.enemies.length > 6) {
        for (let i = 0; i < 6; i += 1) {
          enemies.pop();
        }
      }
      const builder: EnemyFleetBuilder = { fleet: enemyFleet, enemies };
      this.setFleet(new EnemyFleet(builder));
    },
    openMenu(index: number) {
      const enemy = this.fleet.enemies.concat()[index];
      if (enemy.data.id) {
        this.editEnemy = enemy;
        this.editEnemyIndex = index;
        this.menuDialog = true;
      } else {
        this.showEnemyList(index);
      }
    },
    toggleDisabledStage2(index: number) {
      this.menuDialog = false;
      const enemies = this.fleet.enemies.concat();
      enemies[index].disabledMainAerialPhase = !enemies[index].disabledMainAerialPhase;
      const builder: EnemyFleetBuilder = { fleet: this.fleet, enemies };
      this.setFleet(new EnemyFleet(builder));
    },
    toggleMenuDialog() {
      if (!this.menuDialog) {
        setTimeout(() => {
          this.editEnemyIndex = 0;
          this.editEnemy = new Enemy();
        }, 150);
      }
    },
    removeEnemy(index: number) {
      const enemies = this.fleet.enemies.concat();
      enemies[index] = new Enemy();
      const builder: EnemyFleetBuilder = { fleet: this.fleet, enemies };
      this.setFleet(new EnemyFleet(builder));
      this.menuDialog = false;
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        setTimeout(() => {
          this.destroyDialog = true;
        }, 100);
      } else {
        this.destroyDialog = false;
      }
    },
    showWorldList() {
      this.handleShowWorldList(this.index);
    },
    closeDetail() {
      this.detailDialog = false;
      this.toggleDetailDialog();
    },
    bootTooltip(enemy: Enemy, e: MouseEvent) {
      if (!enemy.data.id) {
        return;
      }
      const setting = this.$store.state.siteSetting as SiteSetting;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = (e.target as HTMLDivElement).getBoundingClientRect();
        this.tooltipX = rect.x + rect.width;
        this.tooltipY = rect.y + rect.height;
        this.tooltipEnemy = enemy;
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
