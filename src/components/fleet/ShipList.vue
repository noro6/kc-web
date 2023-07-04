<template>
  <v-card>
    <div class="d-flex py-2 pr-2 align-center">
      <div class="ship-search-text ml-5">
        <v-text-field
          dense
          hide-details
          :placeholder="$t('ItemList.図鑑id 名称検索')"
          v-model.trim="keyword"
          @input="filter()"
          clearable
          prepend-inner-icon="mdi-magnify"
        />
      </div>
      <v-spacer />
      <div class="mr-3 ship-sort-select">
        <v-select
          dense
          :placeholder="$t('Common.ソート')"
          hide-details
          v-model="sortKey"
          :items="sortKeys"
          item-value="value"
          :item-text="(item) => $t('Common.' + item.text)"
          @input="filter()"
          clearable
          prepend-inner-icon="mdi-sort-descending"
        />
      </div>
      <div class="d-none d-sm-block mr-5">
        <v-btn-toggle dense v-model="multiLine" borderless mandatory>
          <v-btn :value="false" :class="{ blue: !multiLine, secondary: multiLine }" @click.stop="changeMultiLine(false)">
            <v-icon color="white">mdi-view-headline</v-icon>
            <span class="white--text">{{ $t("ItemList.一列") }}</span>
          </v-btn>
          <v-btn :value="true" :class="{ blue: multiLine, secondary: !multiLine }" @click.stop="changeMultiLine(true)">
            <v-icon color="white">mdi-view-comfy</v-icon>
            <span class="white--text">{{ $t("ItemList.複数列") }}</span>
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-btn icon @click="handleClose()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="d-flex py-2 align-center" :class="{ 'ml-3': multiLine, 'ml-1': !multiLine }">
      <v-btn @click="filterDialog = true" :disabled="!!keyword" outlined> <v-icon>mdi-filter-variant</v-icon>{{ $t("Common.絞り込み") }} </v-btn>
      <div v-if="!isNotJapanese" class="ml-3 caption d-none d-md-block text--secondary">Ctrlキー + 艦娘をクリックでwikiを展開します。</div>
    </div>
    <div class="d-flex flex-wrap" :class="{ 'ml-3': multiLine, 'ml-1': !multiLine }">
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type, disabled: keyword }"
        @click="changeType(index)"
        @keypress="changeType(index)"
      >
        {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
      </div>
      <div class="ml-auto mr-3" v-if="isStockOnly">
        <img
          v-show="shipFilter.hasAreaOnly"
          class="filter_img"
          @click="toggleAreaFilter"
          @keypress="toggleAreaFilter"
          :src="`./img/util/filtered1.png`"
          alt="area-img-1"
        />
        <img
          v-show="shipFilter.hasNotAreaOnly"
          class="filter_img"
          @click="toggleAreaFilter"
          @keypress="toggleAreaFilter"
          :src="`./img/util/filtered2.png`"
          alt="area-img-2"
        />
        <img
          v-show="!shipFilter.hasAreaOnly && !shipFilter.hasNotAreaOnly"
          class="filter_img"
          @click="toggleAreaFilter"
          @keypress="toggleAreaFilter"
          :src="`./img/util/filtered0.png`"
          alt="area-img-0"
        />
      </div>
    </div>
    <v-divider :class="{ 'ml-3': multiLine }" />
    <div class="ship-table-body pb-2" :class="{ 'ml-3': multiLine }">
      <div v-if="!multiLine && ships.length" class="ship-status-header pr-3">
        <div class="ship-status" v-for="i in 5" :key="`slot${i}`">{{ $t("Fleet.搭載") }}{{ i }}</div>
      </div>
      <div v-for="(typeData, i) in ships" :key="i" class="pl-3">
        <div class="type-divider">
          <div class="caption text--secondary" v-if="sortKey">
            {{ selectedSortText }} {{ typeData.typeName }}
            <span class="caption2" v-if="typeData.needOrOver">{{ $t("ItemList.以上") }}</span>
          </div>
          <div class="caption text--secondary" v-else>{{ getShipTypeName(typeData.typeName) }}</div>
          <div class="type-divider-border" />
        </div>
        <div :class="{ multi: multiLine }">
          <div
            v-for="(data, i) in typeData.ships"
            :key="i"
            class="ship-list"
            :class="{ 'pr-3': !multiLine, 'no-stock': !data.count }"
            v-ripple="{ class: data.count ? 'info--text' : 'red--text' }"
            @click="clickedShip(data, $event)"
            @keypress.enter="clickedShip(data, $event)"
            @mouseenter="bootTooltip(data, $event)"
            @mouseleave="clearTooltip"
            @focus="bootTooltip(data, $event)"
            @blur="clearTooltip"
          >
            <div class="ship-img">
              <div>
                <v-img :src="`./img/ship/${data.ship.id}.png`" height="30" width="120" />
              </div>
              <div class="area-banner" v-if="data.area > 0 && data.area <= maxAreas">
                <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/areas/area${data.area}.webp`" height="40" width="29" />
              </div>
              <div class="slot-ex-img" v-if="data.expanded">
                <v-img :src="`./img/util/slot_ex.png`" height="25" width="25" />
              </div>
              <div class="bookmarked-icon" v-if="data.isBookmarked"><v-icon small color="pink lighten-2">mdi-heart</v-icon></div>
            </div>
            <div class="flex-grow-1 ml-1">
              <div class="d-flex ship-caption">
                <div class="primary--text ship-level mr-1">
                  <template v-if="isStockOnly">Lv {{ data.level }}</template>
                  <template v-else>id {{ data.ship.id }}</template>
                </div>
                <div v-if="displayLuck">{{ $t("Common.運") }} {{ data.luck }}</div>
                <div v-else class="sort-status">
                  <div>{{ selectedSortText }} {{ data.sortValue }}</div>
                </div>
              </div>
              <div class="d-flex">
                <div class="ship-name text-truncate">{{ getShipName(data.ship) }}</div>
              </div>
            </div>
            <div class="ship-count caption" v-if="isStockOnly">
              <span>&times;</span>
              <span>{{ data.count }}</span>
            </div>
            <template v-if="!multiLine">
              <div class="ship-status" v-for="i in 5" :key="`ship_slot${i - 1}`">
                {{ data.ship.slots[i - 1] ? data.ship.slots[i - 1] : "" }}
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-show="ships.length === 0" class="body-2 text-center mt-10">
        <div>{{ $t("Common.探したけど見つからなかったよ") }}&#128546;</div>
        <div class="d-flex align-center justify-center mt-2">
          <div class="mt-0_5">
            {{ $t("Common.もしかして") }}
          </div>
          <div>
            <v-btn text color="primary" @click="filterDialog = true">{{ $t("Common.検索条件") }}</v-btn>
          </div>
        </div>
      </div>
    </div>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <ship-tooltip v-model="tooltipShip" />
    </v-tooltip>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3" v-if="confirmShip.ship">
        <div class="ma-4">
          <div>{{ $t("Common.既に配備されています。") }}</div>
          <div class="caption mt-2">※ {{ $t("Common.配備を押せば無視して配備できます。") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark @click.stop="clickedShip(confirmShip)">{{ $t("Common.配備") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="filterDialog" transition="scroll-x-transition" width="760" @input="toggleFilterDialog">
      <v-card>
        <div class="filter-dialog-body">
          <div class="d-flex">
            <div class="caption">{{ $t("Fleet.改造状態") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <div>
              <v-checkbox v-model="shipFilter.includeInitial" @change="filter()" dense hide-details :label="$t('Fleet.未改造')" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.includeIntermediate" @change="filter()" dense hide-details :label="$t('Fleet.中間改造')" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.includeFinal" @change="filter()" dense hide-details :label="$t('Fleet.最終改造')" />
            </div>
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Fleet.装備搭載可否") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <div>
              <v-checkbox
                v-model="shipFilter.midgetSubmarineOK"
                :disabled="!visibleMidgetSubmarineFilter"
                @click="filter()"
                dense
                hide-details
                :label="$t('Fleet.甲標的')"
              />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.largeSearchlightOK" @click="filter()" dense hide-details :label="$t('Fleet.大型探照灯')" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.canEquipExSubGunOnly" @click="filter()" dense hide-details :label="$t('Fleet.増設副砲')" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.canEquipExRadarOnly" @click="filter()" dense hide-details :label="$t('Fleet.増設電探')" />
            </div>
          </div>
          <div class="filter-input-container mt-1">
            <div class="d-flex manual-checkbox">
              <v-btn icon @click="toggleDaihatsuFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.landingCraftOK">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.landingCraftNG">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <img @click="toggleDaihatsuFilter()" @keypress="toggleDaihatsuFilter()" :src="`./img/type/type24.png`" alt="type-24" />
            </div>
            <div class="d-flex manual-checkbox">
              <v-btn icon @click="toggleTankFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.tankOK">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.tankNG">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <img @click="toggleTankFilter()" @keypress="toggleTankFilter()" :src="`./img/type/type46.png`" alt="type-46" />
            </div>
            <div class="d-flex manual-checkbox" :class="{ disabled: !visibleSpBomberFilter }">
              <v-btn icon @click="toggleSpBomberFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.spBomberOK">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.spBomberNG">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <img @click="toggleSpBomberFilter()" @keypress="toggleSpBomberFilter()" :src="`./img/type/type1100.png`" alt="type-11" width="35" height="35" />
            </div>
            <div class="d-flex manual-checkbox" :class="{ disabled: !visibleFighterFilter }">
              <v-btn icon @click="toggleFighterFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.fighterOK">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.fighterNG">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <img @click="toggleFighterFilter()" @keypress="toggleFighterFilter()" :src="`./img/type/type4500.png`" alt="type-45" width="35" height="35" />
            </div>
            <div class="d-flex manual-checkbox" :class="{ disabled: !visibleCommanderFilter }">
              <v-btn icon @click="toggleCommanderFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.commanderOK">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.commanderNG">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <img @click="toggleCommanderFilter()" @keypress="toggleCommanderFilter()" :src="`./img/type/type34.png`" alt="type-34" width="35" height="35" />
            </div>
            <div class="d-flex manual-checkbox" :class="{ disabled: !visibleArmorFilter }">
              <v-btn icon @click="toggleArmorFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.armorOK">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.armorNG">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <img @click="toggleArmorFilter()" @keypress="toggleArmorFilter()" :src="`./img/type/type27.png`" alt="type-27" width="35" height="35" />
            </div>
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Common.耐久") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <div>
              <v-checkbox v-model="shipFilter.HPIs4n1" @click="filter()" dense hide-details label="4n - 1" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.HPIs4n2" @click="filter()" dense hide-details label="4n - 2" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.HPIs4n3" @click="filter()" dense hide-details label="4n - 3" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.HPIs4n" @click="filter()" dense hide-details label="4n" />
            </div>
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Common.速力") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <div>
              <v-checkbox v-model="shipFilter.includeFast" @click="filter()" dense hide-details :label="$t('Fleet.高速')" />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.includeSlow" @click="filter()" dense hide-details :label="$t('Fleet.低速')" />
            </div>
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Fleet.装備スロット数") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <div>
              <v-checkbox
                v-model="shipFilter.slotCount3"
                @click="filter()"
                dense
                hide-details
                :label="$t('Fleet.3スロ以上')"
                :disabled="shipFilter.slotCount4 || shipFilter.slotCount5"
              />
            </div>
            <div>
              <v-checkbox
                v-model="shipFilter.slotCount4"
                @click="filter()"
                dense
                hide-details
                :label="$t('Fleet.4スロ以上')"
                :disabled="shipFilter.slotCount5"
              />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.slotCount5" @click="filter()" dense hide-details :label="$t('Fleet.5スロ以上')" />
            </div>
          </div>
          <div class="d-flex mt-4">
            <div class="caption align-self-center">{{ $t("Common.その他") }}</div>
            <div class="header-divider" />
            <div class="pr-1 pl-3">
              <v-btn small @click="showBookmarkDialog()" color="pink lighten-2" outlined>
                <v-icon small>mdi-heart-cog</v-icon> {{ $t("Fleet.お気に入り編集") }}
              </v-btn>
            </div>
          </div>
          <div class="filter-input-container">
            <div>
              <v-checkbox
                v-model="shipFilter.escortCarrierOnly"
                @click="filter()"
                dense
                hide-details
                :label="$t('Fleet.護衛空母')"
                :disabled="!visibleEscortCarrierFilter"
              />
            </div>
            <div>
              <v-checkbox v-model="shipFilter.onlyAutoOASW" @click="filter()" dense hide-details :label="$t('Fleet.自動先制対潜')" />
            </div>
            <div class="d-flex manual-checkbox text" :class="{ disabled: !isStockOnly }">
              <v-btn icon @click="toggleExSlotFilter()" class="manual-checkbox-button">
                <v-icon class="manual-icon" color="primary" v-if="shipFilter.isReleaseExSlotOnly">mdi-checkbox-marked</v-icon>
                <v-icon class="manual-icon" color="error" v-else-if="shipFilter.isNotReleaseExSlotOnly">mdi-close-box</v-icon>
                <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
              </v-btn>
              <div class="label" @click="toggleExSlotFilter()" @keypress="toggleExSlotFilter()">{{ $t("Fleet.補強増設") }}</div>
            </div>
            <div>
              <v-checkbox v-model="shipFilter.onlyBookmarked" @click="filter()" dense hide-details :label="$t('Fleet.お気に入り')" />
            </div>
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Fleet.ステータス") }}</div>
            <div class="header-divider" />
          </div>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.levelRange" dense thumb-label min="1" :max="maxLevel" hide-details :disabled="!isStockOnly">
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.Lv下限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="shipFilter.levelRange[1]"
                min="1"
                v-model="shipFilter.levelRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.Lv上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="maxLevel"
                :min="shipFilter.levelRange[0]"
                v-model="shipFilter.levelRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.luckRange" dense thumb-label min="1" max="200" hide-details>
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.運下限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="shipFilter.luckRange[1]"
                min="1"
                v-model="shipFilter.luckRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.運上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                max="200"
                :min="shipFilter.luckRange[0]"
                v-model="shipFilter.luckRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.aswRange" dense thumb-label min="0" max="150" hide-details>
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.対潜下限')"
                class="range-input"
                :class="{ english: isNotJapanese }"
                type="number"
                :max="shipFilter.aswRange[1]"
                min="0"
                v-model="shipFilter.aswRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.対潜上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                max="150"
                :min="shipFilter.aswRange[0]"
                v-model="shipFilter.aswRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.HPRange" dense thumb-label min="1" max="120" hide-details>
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.耐久下限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="shipFilter.HPRange[1]"
                min="1"
                v-model="shipFilter.HPRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.耐久上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                max="120"
                :min="shipFilter.HPRange[0]"
                v-model="shipFilter.HPRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.fireRange" dense thumb-label min="1" max="200" hide-details>
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.火力下限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="shipFilter.fireRange[1]"
                min="1"
                v-model="shipFilter.fireRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.火力上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                max="200"
                :min="shipFilter.fireRange[0]"
                v-model="shipFilter.fireRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.torpedoRange" dense thumb-label min="0" max="150" hide-details>
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.雷装下限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="shipFilter.torpedoRange[1]"
                min="0"
                v-model="shipFilter.torpedoRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.雷装上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                max="150"
                :min="shipFilter.torpedoRange[0]"
                v-model="shipFilter.torpedoRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
          <v-range-slider class="mt-4 px-3" v-model="shipFilter.nightRange" dense thumb-label min="1" max="300" hide-details>
            <template v-slot:prepend>
              <v-text-field
                :label="$t('Database.夜戦火力下限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                :max="shipFilter.nightRange[1]"
                min="1"
                v-model="shipFilter.nightRange[0]"
                hide-details
              />
            </template>
            <template v-slot:append>
              <v-text-field
                :label="$t('Database.夜戦火力上限')"
                type="number"
                class="range-input"
                :class="{ english: isNotJapanese }"
                max="300"
                :min="shipFilter.nightRange[0]"
                v-model="shipFilter.nightRange[1]"
                hide-details
              />
            </template>
          </v-range-slider>
        </div>
        <v-divider />
        <div class="d-flex pa-3">
          <div v-if="shipStock.length">
            <v-switch
              class="mt-1"
              v-model="isStockOnly"
              :label="$t('Fleet.在籍艦娘反映')"
              @click="clickedStockOnly()"
              :disabled="disabledStockOnlyChange"
              dense
              hide-details
            />
          </div>
          <v-btn class="ml-auto" color="error" dark @click.stop="resetFilter()">{{ $t("Common.リセット") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="closeFilterDialog()">{{ $t("Common.閉じる") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="bookmarksDialog" width="1200" @input="toggleBookmarkDialog">
      <ship-bookmark-edit :handle-close="closeBookmarkDialog" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.ship-table-body {
  overflow-y: auto;
  height: 64vh;
  overscroll-behavior: contain;
}
.ship-search-text {
  width: 200px;
}
.ship-sort-select {
  width: 150px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem 0.6rem;
  font-size: 0.9em;
  cursor: pointer;
}
.type-selector:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
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

.multi {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) {
  .multi {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 880px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.ship-list {
  display: flex;
  cursor: pointer;
  padding: 0.15rem 0.3rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.ship-list:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-list.no-stock:hover {
  background-color: rgba(255, 128, 128, 0.1);
}
.ship-list > div {
  align-self: center;
}

.ship-img {
  position: relative;
}
.bookmarked-icon {
  position: absolute;
  left: -10px;
  top: -14px;
}
.area-banner {
  position: absolute;
  top: -6px;
  left: 22px;
}
.slot-ex-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 25px;
  height: 25px;
}

.ship-caption {
  font-size: 11px;
  margin-left: 0.1rem;
}
.ship-level {
  min-width: 36px;
}
.sort-status {
  position: relative;
}
.sort-status > div {
  position: absolute;
  white-space: nowrap;
}
.caption2 {
  font-size: 11px;
}

.ship-name {
  flex-grow: 1;
  font-size: 0.8em;
  width: 10px;
  margin-left: 0.1rem;
  overflow: hidden;
  white-space: nowrap;
}
.no-stock .ship-name {
  color: rgb(255, 100, 100);
}
.ship-count {
  align-self: flex-end !important;
  margin-left: 1px;
  width: 22px;
  font-weight: bold;
  color: rgb(255, 64, 64);
}

.ship-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  /** 追従するためrgba使用できない */
  background-color: #f8f8f8;
  position: sticky;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 1;
  top: 0;
}
.theme--dark .ship-status-header {
  /** 追従するためrgba使用できない */
  background-color: rgb(62, 62, 66);
}
.deep-sea .theme--dark .ship-status-header {
  /** 追従するためrgba使用できない */
  background-color: rgb(52, 56, 72);
}
.ship-status {
  align-self: center;
  text-align: right;
  width: 9%;
  font-size: 0.8em;
}
.ship-status-header .ship-status {
  font-size: 11px;
}
.filter_img {
  cursor: pointer;
}

.filter-dialog-body {
  padding-top: 20px;
  padding-left: 20px;
  overflow-y: auto;
  height: 70vh;
  overscroll-behavior: contain;
}

.manual-checkbox {
  position: relative;
  height: 36px;
  width: 64px;
  cursor: pointer;
  user-select: none;
}
.manual-checkbox.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.manual-checkbox-button {
  position: absolute;
  left: -6px;
  bottom: -4px;
}
.manual-icon {
  font-size: 20px !important;
}
.manual-checkbox img {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-45%);
}
.manual-checkbox.text {
  width: 100px;
  cursor: pointer;
}
.manual-checkbox .label {
  user-select: none;
  position: absolute;
  font-size: 0.85em;
  opacity: 0.7;
  left: 28px;
  bottom: 3px;
  margin-left: 4px;
}
.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
.range-input {
  margin-top: 0px;
  padding-top: 0px;
  width: 80px !important;
}
.range-input.english {
  width: 100px !important;
}
.filter-input-container {
  margin-left: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  align-items: center;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import ShipBookmarkEdit from '@/components/fleet/ShipBookmarkEdit.vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import Const, { SHIP_TYPE } from '@/classes/const';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';
import ShipStock from '@/classes/fleet/shipStock';
import SaveData from '@/classes/saveData/saveData';
import ShipFilter from '@/classes/fleet/shipFilter';
import ItemMaster from '@/classes/item/itemMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import Convert from '@/classes/convert';
import { sum } from 'lodash';

export interface ViewShip {
  ship: ShipMaster;
  count: number;
  area: number;
  level: number;
  /** 耐久 表示値 */
  hp: number;
  /** 運 表示値 */
  luck: number;
  /** 対潜 改修値!! */
  asw: number;
  expanded: boolean;
  /** ソート用ステータス */
  sortValue: number;
  /** 所持情報ユニークid */
  uniqueId: number;
  /** お気に入りかどうか */
  isBookmarked: boolean;
}

export default Vue.extend({
  name: 'ShipList',
  components: { ShipTooltip, ShipBookmarkEdit },
  props: {
    handleDecideShip: {
      type: Function,
      required: true,
    },
    handleChangeWidth: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as ShipMaster[],
    ships: [] as { typeName: string; ships: ViewShip[]; needOrOver: boolean }[],
    types: [] as { text: string; types: number[] }[],
    type: 0,
    keyword: '' as string | undefined,
    sortKey: '',
    sortKeys: [
      { text: 'Lv', value: 'level' },
      { text: '運', value: 'luck' },
      { text: '火力', value: 'fire' },
      { text: '雷装', value: 'torpedo' },
      { text: '夜戦火力', value: 'nightBattleFirePower' },
      { text: '対空', value: 'antiAir' },
      { text: '対潜', value: 'asw' },
      { text: '索敵', value: 'scout' },
      { text: '装甲', value: 'armor' },
      { text: '回避', value: 'avoid' },
      { text: '燃料', value: 'fuel' },
      { text: '弾薬', value: 'ammo' },
      { text: '射程', value: 'range' },
      { text: '運改修', value: 'luckRemodel' },
      { text: '搭載数', value: 'slotSize' },
    ],
    rangeText: ['', '短', '中', '長', '超長', '超長+', '極', '極+', '極長', '極長+'],
    multiLine: true,
    shipFilter: new ShipFilter(),
    isStockOnly: false,
    shipStock: [] as ShipStock[],
    usedShips: [] as Ship[],
    confirmDialog: false,
    confirmShip: {} as ViewShip,
    maxAreas: 0,
    disabledStockOnlyChange: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipShip: new Ship(),
    tooltipX: 0,
    tooltipY: 0,
    decidedShip: false,
    filterDialog: false,
    maxLevel: Const.MAX_LEVEL,
    bookmarksDialog: false,
  }),
  mounted() {
    this.maxAreas = this.$store.state.areaCount as number;
    const existTypes: number[] = [];
    const ships = this.$store.state.ships as ShipMaster[];
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      this.all.push(ship);
      if (!existTypes.includes(ship.type)) {
        existTypes.push(ship.type);
      }
    }
    for (let i = 0; i < Const.SHIP_TYPES_ALT.length; i += 1) {
      const data = Const.SHIP_TYPES_ALT[i];
      if (data.types.some((v) => existTypes.includes(v))) {
        this.types.push({ text: data.text, types: data.types });
      }
    }
  },
  computed: {
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    displayLuck(): boolean {
      return !this.sortKey || this.sortKey === 'level' || this.sortKey === 'luck' || this.sortKey === 'range' || this.sortKey === 'luckRemodel';
    },
    selectedSortText(): string {
      if (this.sortKey) {
        const key = this.sortKeys.find((v) => v.value === this.sortKey);
        return key ? `${this.$t(`Common.${key.text}`)}` : '';
      }

      return '';
    },
    selectedShipTypes(): number[] {
      const t = this.types[this.type];
      if (t) {
        return t.types;
      }
      return [];
    },
    visibleMidgetSubmarineFilter(): boolean {
      // 甲標的搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CAV, SHIP_TYPE.AV].includes(type)) {
          return true;
        }
      }
      return false;
    },
    visibleSpBomberFilter(): boolean {
      // 水爆系フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CA, SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBB].includes(type)) {
          return true;
        }
      }
      return false;
    },
    visibleFighterFilter(): boolean {
      // 戦闘機搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CA, SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBB].includes(type)) {
          return true;
        }
      }
      return false;
    },
    visibleArmorFilter(): boolean {
      // バルジ搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.DD, SHIP_TYPE.CL, SHIP_TYPE.AO_2].includes(type)) {
          return true;
        }
      }
      return false;
    },
    visibleCommanderFilter(): boolean {
      // 司令部搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.DD, SHIP_TYPE.AO_2].includes(type)) {
          return true;
        }
      }
      return false;
    },
    visibleEscortCarrierFilter(): boolean {
      // 護衛空母フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CVL, SHIP_TYPE.CV].includes(type)) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.filter();
    },
    clickedStockOnly() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isStockOnlyForShipList = this.isStockOnly;
      this.$store.dispatch('updateSetting', setting);
      this.filter();
    },
    toggleAreaFilter() {
      if (this.shipFilter.hasAreaOnly) {
        this.shipFilter.hasAreaOnly = false;
        this.shipFilter.hasNotAreaOnly = true;
      } else if (this.shipFilter.hasNotAreaOnly) {
        this.shipFilter.hasNotAreaOnly = false;
      } else {
        this.shipFilter.hasAreaOnly = true;
      }
      this.filter();
    },
    toggleDaihatsuFilter() {
      if (this.shipFilter.landingCraftOK) {
        this.shipFilter.landingCraftOK = false;
        this.shipFilter.landingCraftNG = true;
      } else if (this.shipFilter.landingCraftNG) {
        this.shipFilter.landingCraftNG = false;
      } else {
        this.shipFilter.landingCraftOK = true;
      }
      this.filter();
    },
    toggleTankFilter() {
      if (this.shipFilter.tankOK) {
        this.shipFilter.tankOK = false;
        this.shipFilter.tankNG = true;
      } else if (this.shipFilter.tankNG) {
        this.shipFilter.tankNG = false;
      } else {
        this.shipFilter.tankOK = true;
      }
      this.filter();
    },
    toggleSpBomberFilter() {
      if (this.shipFilter.spBomberOK) {
        this.shipFilter.spBomberOK = false;
        this.shipFilter.spBomberNG = true;
      } else if (this.shipFilter.spBomberNG) {
        this.shipFilter.spBomberNG = false;
      } else {
        this.shipFilter.spBomberOK = true;
      }
      this.filter();
    },
    toggleFighterFilter() {
      if (this.shipFilter.fighterOK) {
        this.shipFilter.fighterOK = false;
        this.shipFilter.fighterNG = true;
      } else if (this.shipFilter.fighterNG) {
        this.shipFilter.fighterNG = false;
      } else {
        this.shipFilter.fighterOK = true;
      }
      this.filter();
    },
    toggleCommanderFilter() {
      if (this.shipFilter.commanderOK) {
        this.shipFilter.commanderOK = false;
        this.shipFilter.commanderNG = true;
      } else if (this.shipFilter.commanderNG) {
        this.shipFilter.commanderNG = false;
      } else {
        this.shipFilter.commanderOK = true;
      }
      this.filter();
    },
    toggleArmorFilter() {
      if (this.shipFilter.armorOK) {
        this.shipFilter.armorOK = false;
        this.shipFilter.armorNG = true;
      } else if (this.shipFilter.armorNG) {
        this.shipFilter.armorNG = false;
      } else {
        this.shipFilter.armorOK = true;
      }
      this.filter();
    },
    toggleExSlotFilter() {
      if (this.shipFilter.isReleaseExSlotOnly) {
        this.shipFilter.isReleaseExSlotOnly = false;
        this.shipFilter.isNotReleaseExSlotOnly = true;
      } else if (this.shipFilter.isNotReleaseExSlotOnly) {
        this.shipFilter.isNotReleaseExSlotOnly = false;
      } else {
        this.shipFilter.isReleaseExSlotOnly = true;
      }
      this.filter();
    },
    initialize(enabledUserShip = true) {
      this.decidedShip = false;
      // 現行の在籍艦娘情報を更新
      this.shipStock = this.$store.state.shipStock as ShipStock[];
      const setting = this.$store.state.siteSetting as SiteSetting;
      this.isStockOnly = setting.isStockOnlyForShipList || this.disabledStockOnlyChange;

      // 設置値復元
      this.shipFilter = setting.savedShipListFilter;
      this.sortKey = setting.savedShipListSortKey ?? '';

      // 一時所持情報データがあるなら
      if (this.$store.getters.getExistsTempStock) {
        this.shipStock = this.$store.state.tempShipStock as ShipStock[];
        this.isStockOnly = !!this.shipStock.length;
      }

      // 現在の計算画面内で配備されている艦娘を列挙する
      this.usedShips = [];
      const mainData = this.$store.state.mainSaveData as SaveData;
      if (mainData) {
        const manager = mainData.tempData[mainData.tempIndex];
        if (enabledUserShip && manager) {
          let allShips: Ship[] = [];
          for (let i = 0; i < manager.fleetInfo.fleets.length; i += 1) {
            const fleet = manager.fleetInfo.fleets[i];
            allShips = allShips.concat(fleet.ships.filter((v) => v.data.id > 0));
          }

          this.usedShips = allShips;
        }
      }

      this.changeMultiLine(setting.isMultiLineForShipList);
      this.filter();
    },
    filter() {
      const word = this.keyword ? this.keyword.toUpperCase() : '';
      let result = this.all.concat();
      const t = this.types[this.type];

      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.savedShipListFilter = this.shipFilter;
      setting.savedShipListSortKey = this.sortKey;
      this.$store.dispatch('updateSetting', setting);

      // 検索語句あればこれ以外の検索はしない
      if (word) {
        result = result.filter((v) => v.id === +word || v.name.toUpperCase().indexOf(word) >= 0);
      } else {
        // カテゴリ検索
        result = result.filter((v) => t.types.includes(v.type));
        const isValid = ShipValidation.isValidItem;
        if (!this.shipFilter.includeInitial) {
          // 初期改造状態を含めず
          result = result.filter((v) => v.version > 0);
        }
        if (!this.shipFilter.includeIntermediate) {
          // 中間改造状態を含めず
          result = result.filter((v) => v.version === 0 || v.isFinal);
        }
        if (!this.shipFilter.includeFinal) {
          // 最終改造状態を含めず
          result = result.filter((v) => !v.isFinal);
        }
        if (!this.shipFilter.includeFast) {
          // 速力高速
          result = result.filter((v) => v.speed !== 10);
        }
        if (!this.shipFilter.includeSlow) {
          // 速力低速
          result = result.filter((v) => v.speed !== 5);
        }
        if (this.shipFilter.landingCraftOK) {
          // 大発搭載可能
          const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
          if (daihatsu) {
            result = result.filter((v) => v.slotCount && isValid(v, daihatsu));
          }
        } else if (this.shipFilter.landingCraftNG) {
          // 大発搭載不可
          const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
          if (daihatsu) {
            result = result.filter((v) => !isValid(v, daihatsu));
          }
        }
        if (this.shipFilter.tankOK) {
          // 内火艇搭載可能
          const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
          if (tank) {
            result = result.filter((v) => v.slotCount && isValid(v, tank));
          }
        } else if (this.shipFilter.tankNG) {
          // 内火艇搭載不可
          const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
          if (tank) {
            result = result.filter((v) => !isValid(v, tank));
          }
        }
        if (this.visibleCommanderFilter) {
          if (this.shipFilter.commanderOK) {
            // 司令部搭載可能
            const commander = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 107);
            if (commander) {
              result = result.filter((v) => isValid(v, commander));
            }
          } else if (this.shipFilter.commanderNG) {
            // 司令部搭載不可
            const commander = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 107);
            if (commander) {
              result = result.filter((v) => !isValid(v, commander));
            }
          }
        }
        if (this.visibleArmorFilter) {
          if (this.shipFilter.armorOK) {
            // バルジ搭載可能
            const armor = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 72);
            if (armor) {
              result = result.filter((v) => isValid(v, armor));
            }
          } else if (this.shipFilter.armorNG) {
            // バルジ搭載不可
            const armor = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 72);
            if (armor) {
              result = result.filter((v) => !isValid(v, armor));
            }
          }
        }
        if (this.visibleSpBomberFilter) {
          if (this.shipFilter.spBomberOK) {
            // 水爆搭載可(Lateでテスト)
            const bomber = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 194);
            if (bomber) {
              result = result.filter((v) => isValid(v, bomber));
            }
          } else if (this.shipFilter.spBomberNG) {
            // 水爆搭載不可(Lateでテスト)
            const bomber = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 194);
            if (bomber) {
              result = result.filter((v) => !isValid(v, bomber));
            }
          }
        }
        if (this.visibleFighterFilter) {
          if (this.shipFilter.fighterOK) {
            // 戦闘機搭載可
            const fighter = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 19);
            const fighter2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 165);
            if (fighter && fighter2) {
              result = result.filter((v) => isValid(v, fighter) || isValid(v, fighter2));
            }
          } else if (this.shipFilter.fighterNG) {
            // 戦闘機搭載不可
            const fighter = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 19);
            const fighter2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 165);
            if (fighter && fighter2) {
              result = result.filter((v) => !isValid(v, fighter) && !isValid(v, fighter2));
            }
          }
        }
        if (this.shipFilter.midgetSubmarineOK && this.visibleMidgetSubmarineFilter) {
          // 甲標的搭載可
          const midgetSubmarine = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 41);
          if (midgetSubmarine) {
            result = result.filter((v) => isValid(v, midgetSubmarine));
          }
        }
        if (this.shipFilter.largeSearchlightOK) {
          // 大型探照灯搭載可
          const light = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 140);
          if (light) {
            result = result.filter((v) => isValid(v, light));
          }
        }
        if (this.shipFilter.canEquipExRadarOnly) {
          // 増設電探
          const radar1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 28);
          const radar2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 142);
          const radar3 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 506);
          if (radar1 && radar2 && radar3) {
            const ex = Const.EXPAND_SLOT_INDEX;
            result = result.filter((v) => isValid(v, radar1, ex) || isValid(v, radar2, ex) || isValid(v, radar3, ex));
          }
        }
        if (this.shipFilter.canEquipExSubGunOnly) {
          // 増設副砲
          const subGun1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 220);
          const subGun2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 275);
          if (subGun1 && subGun2) {
            result = result.filter((v) => isValid(v, subGun1, Const.EXPAND_SLOT_INDEX) || isValid(v, subGun2, Const.EXPAND_SLOT_INDEX));
          }
        }
        if (this.shipFilter.escortCarrierOnly && this.visibleEscortCarrierFilter) {
          // 護衛空母のみ
          result = result.filter((v) => v.minAsw);
        }
        if (this.shipFilter.onlyAutoOASW) {
          // 自動先制対潜のみ
          result = result.filter((v) => [141, 478, 624, 394, 893, 681, 920].includes(v.id) || (v.type2 === 91 && v.id !== 941));
        }
        if (this.shipFilter.onlyBookmarked) {
          // お気に入りのみ
          const bookmarks = setting.bookmarkedShipIds;
          result = result.filter((v) => bookmarks.includes(v.id));
        }
        if (this.shipFilter.slotCount5) {
          // 5スロ
          result = result.filter((v) => v.slotCount >= 5);
        } else if (this.shipFilter.slotCount4) {
          // 4スロ
          result = result.filter((v) => v.slotCount >= 4);
        } else if (this.shipFilter.slotCount3) {
          // 3スロ
          result = result.filter((v) => v.slotCount >= 3);
        }

        // 運フィルタ
        const minLuck = this.shipFilter.luckRange[0];
        const maxLuck = this.shipFilter.luckRange[1];
        // 火力フィルタ
        const minFire = this.shipFilter.fireRange[0];
        const maxFire = this.shipFilter.fireRange[1];
        // 雷装フィルタ
        const minTorpedo = this.shipFilter.torpedoRange[0];
        const maxTorpedo = this.shipFilter.torpedoRange[1];
        // 夜戦火力フィルタ
        const minNight = this.shipFilter.nightRange[0];
        const maxNight = this.shipFilter.nightRange[1];
        result = result.filter((v) => {
          const night = v.fire + v.torpedo;
          return (
            minLuck <= v.luck
            && v.luck <= maxLuck
            && minFire <= v.fire
            && v.fire <= maxFire
            && minTorpedo <= v.torpedo
            && v.torpedo <= maxTorpedo
            && minNight <= night
            && night <= maxNight
          );
        });
      }

      // 検索用一時変数
      const minAsw = this.shipFilter.aswRange[0];
      const maxAsw = this.shipFilter.aswRange[1];
      const minHP = this.shipFilter.HPRange[0];
      const maxHP = this.shipFilter.HPRange[1];

      const bookmarks = setting.bookmarkedShipIds;

      let usedShips = this.usedShips.concat();
      let viewShips: ViewShip[] = [];
      if (this.isStockOnly && this.shipStock.length) {
        // 在籍艦娘考慮
        const stock = this.shipStock;
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          const stockData = stock.filter((v) => v.id === master.id);
          if (!stockData.length) {
            // 未所持 出さない
            continue;
          }

          const ships: ViewShip[] = [];
          for (let j = 0; j < stockData.length; j += 1) {
            const shipData = stockData[j];
            const viewShip: ViewShip = {
              ship: master,
              count: 1,
              level: shipData.level,
              hp: shipData.improvement.hp + (shipData.level > 99 ? master.hp2 : master.hp),
              luck: shipData.improvement.luck + master.luck,
              asw: shipData.improvement.asw,
              area: shipData.area <= this.maxAreas ? Math.max(shipData.area, 0) : 0,
              expanded: shipData.releaseExpand,
              sortValue: 0,
              uniqueId: shipData.uniqueId,
              isBookmarked: bookmarks.includes(master.id),
            };

            // 補強増設開放済み検索
            if (this.shipFilter.isReleaseExSlotOnly && !viewShip.expanded) {
              continue;
            } else if (this.shipFilter.isNotReleaseExSlotOnly && viewShip.expanded) {
              continue;
            }
            // 札付き検索
            if (this.shipFilter.hasAreaOnly && viewShip.area <= 0) {
              continue;
            } else if (this.shipFilter.hasNotAreaOnly && viewShip.area > 0) {
              continue;
            }
            // Lv検索
            if (viewShip.level < this.shipFilter.levelRange[0] || viewShip.level > this.shipFilter.levelRange[1]) {
              continue;
            }
            // 運検索 => 素ステの方のフィルタリングは終わっているため、上限のみチェック
            if (viewShip.luck > this.shipFilter.luckRange[1]) {
              continue;
            }
            // 耐久検索
            if (viewShip.hp < minHP || viewShip.hp > maxHP) {
              continue;
            }
            if (!this.shipFilter.HPIs4n && viewShip.hp % 4 === 0) {
              // 耐久4nフィルタ
              continue;
            }
            if (!this.shipFilter.HPIs4n1 && viewShip.hp % 4 === 3) {
              // 耐久4n-1フィルタ
              continue;
            }
            if (!this.shipFilter.HPIs4n2 && viewShip.hp % 4 === 2) {
              // 耐久4n-2フィルタ
              continue;
            }
            if (!this.shipFilter.HPIs4n3 && viewShip.hp % 4 === 1) {
              // 耐久4n-3フィルタ
              continue;
            }

            // 対潜値検索 => 初期値じゃない場合のみ、フィルタのための計算をする
            if (minAsw > 0 || maxAsw < 150) {
              if (!master.maxAsw) {
                continue;
              }
              const asw = Ship.getStatusFromLevel(viewShip.level, master.maxAsw, master.minAsw) + viewShip.asw;
              if (asw < minAsw || maxAsw < asw) {
                continue;
              }
            }

            // id 練度 運 対潜 耐久 海域を見て配備済みかどうか判定
            const usedIndex = usedShips.findIndex(
              (v) => (v.data.id === master.id
                  && v.level === viewShip.level
                  && v.hp === viewShip.hp
                  && v.luck === viewShip.luck
                  && v.area === viewShip.area
                  && v.improveAsw === viewShip.asw)
                || (v.uniqueId === viewShip.uniqueId && v.data.id === master.id),
            );
            if (usedIndex >= 0) {
              // 配備済みなら減らす
              viewShip.count = 0;
              usedShips = usedShips.filter((v, index) => index !== usedIndex);
            }

            // まとめられそうな艦娘がいないか？(id 練度 運 対潜 耐久 海域 増設 が一致)
            const search = ships.find(
              (v) => v.ship.id === viewShip.ship.id
                && v.level === viewShip.level
                && v.luck === viewShip.luck
                && v.area === viewShip.area
                && v.hp === viewShip.hp
                && v.asw === viewShip.asw
                && v.expanded === viewShip.expanded,
            );
            if (search) {
              // いたらcountだけインクリメント
              search.count += viewShip.count;
            } else {
              // いなければ追加
              ships.push(viewShip);
            }
          }

          if (ships.length) {
            viewShips = viewShips.concat(ships);
          }
        }
      } else {
        // 所持装備考慮なしの場合
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];

          // 耐久検索
          if (master.hp < minHP || master.hp > maxHP) {
            continue;
          }
          if (!this.shipFilter.HPIs4n && master.hp % 4 === 0) {
            // 耐久4nフィルタ
            continue;
          }
          if (!this.shipFilter.HPIs4n1 && master.hp % 4 === 3) {
            // 耐久4n-1フィルタ
            continue;
          }
          if (!this.shipFilter.HPIs4n2 && master.hp % 4 === 2) {
            // 耐久4n-2フィルタ
            continue;
          }
          if (!this.shipFilter.HPIs4n3 && master.hp % 4 === 1) {
            // 耐久4n-3フィルタ
            continue;
          }
          // 対潜値検索 => 初期値じゃない場合のみ、フィルタのための計算をする
          if (minAsw > 0 || maxAsw < 150) {
            if (master.minAsw === 0 && master.maxAsw === 0) {
              continue;
            }
            const asw = Ship.getStatusFromLevel(99, master.maxAsw, master.minAsw);
            if (asw < minAsw || maxAsw < asw) {
              continue;
            }
          }

          viewShips.push({
            ship: master,
            count: 1,
            level: 99,
            hp: master.hp,
            luck: master.luck,
            area: -1,
            asw: 0,
            expanded: false,
            sortValue: 0,
            uniqueId: 0,
            isBookmarked: bookmarks.includes(master.id),
          });
        }
      }

      // 艦型に応じて分けたい
      const altTypes = Const.SHIP_TYPES_ALT_INFO;
      const resultShips = [];
      if (!this.sortKey) {
        for (let i = 0; i < altTypes.length; i += 1) {
          const type = altTypes[i];
          const ships = viewShips.filter((v) => v.ship.type2 === type.id);
          if (ships.length) {
            // 母港ソート
            ships.sort((a, b) => a.ship.sort - b.ship.sort);
            // 存在する艦型を生成
            resultShips.push({ typeName: type.name, ships, needOrOver: false });
          }
        }
      } else {
        // 何らかのソート値がある場合
        const key = this.sortKey;

        let maxValue = 0;
        for (let i = 0; i < viewShips.length; i += 1) {
          const v = viewShips[i];
          // ソート用のステータスに値を設定
          if (key === 'level') {
            v.sortValue = v.level;
          } else if (key === 'luck') {
            v.sortValue = v.luck;
          } else if (key === 'luckRemodel') {
            v.sortValue = v.luck - v.ship.luck;
          } else if (key === 'slotSize') {
            v.sortValue = sum(v.ship.slots);
          } else if (key === 'scout') {
            v.sortValue = Ship.getStatusFromLevel(v.level, v.ship.maxScout, v.ship.minScout);
          } else if (key === 'avoid') {
            v.sortValue = Ship.getStatusFromLevel(v.level, v.ship.maxAvoid, v.ship.minAvoid);
          } else if (key === 'asw') {
            v.sortValue = v.asw + Ship.getStatusFromLevel(v.level, v.ship.maxAsw, v.ship.minAsw);
          } else if (key === 'nightBattleFirePower') {
            v.sortValue = v.ship.fire + v.ship.torpedo;
          } else if (key === 'fuel') {
            v.sortValue = v.level >= 100 ? Math.max(Math.floor(v.ship.fuel * 0.85), 1) : v.ship.fuel;
          } else if (key === 'ammo') {
            v.sortValue = v.level >= 100 ? Math.max(Math.floor(v.ship.ammo * 0.85), 1) : v.ship.ammo;
          } else {
            v.sortValue = (v.ship as unknown as { [key: string]: number })[key];
          }

          if (maxValue < v.sortValue) {
            maxValue = v.sortValue;
          }
        }

        // 並び替えてしまう
        (viewShips as []).sort((a: ViewShip, b: ViewShip) => {
          if (a.sortValue !== b.sortValue) {
            return b.sortValue - a.sortValue;
          }
          return a.ship.sort - b.ship.sort;
        });

        if (key === 'luckRemodel') {
          // 値毎にタイプ分け
          for (let i = maxValue; i >= 0; i -= 1) {
            const ships = viewShips.filter((v) => v.sortValue === i);
            if (ships.length) {
              const typeName = i ? `+${i}` : '0';
              resultShips.push({ typeName, ships, needOrOver: false });
            }
          }
        } else if (key === 'range') {
          // 値毎にタイプ分け
          for (let i = maxValue; i >= 0; i -= 1) {
            const ships = viewShips.filter((v) => v.sortValue >= i && v.sortValue < i + 1);
            if (ships.length) {
              const rangeText = this.rangeText[i];
              resultShips.push({ typeName: `${this.$t(`Common.${rangeText}`)}`, ships, needOrOver: false });
            }
          }
        } else {
          // 最大値を10の倍数に均す
          maxValue = Math.floor(maxValue / 10) * 10;
          // 値毎にタイプ分け
          for (let i = maxValue; i >= 0; i -= 10) {
            const ships = viewShips.filter((v) => v.sortValue >= i && v.sortValue < i + 10);
            if (ships.length) {
              resultShips.push({ typeName: `${i}`, ships, needOrOver: true });
            }
          }
        }
      }

      this.ships = resultShips;
    },
    clickedShip(ship: ViewShip, event?: MouseEvent) {
      if (event && event.ctrlKey && ship && ship.ship) {
        const wikiURL = `https://wikiwiki.jp/kancolle/${encodeURI(ship.ship.name.replaceAll('/', '／').replaceAll('+', '＋'))}`;
        window.open(wikiURL);
        return;
      }

      if (this.decidedShip) {
        return;
      }

      if (ship.count || this.confirmDialog) {
        this.decidedShip = true;
        this.confirmDialog = false;
        this.handleDecideShip(ship);
      } else {
        this.confirmShip = ship;
        this.confirmDialog = true;
      }
    },
    changeMultiLine(isMulti: boolean) {
      this.handleChangeWidth(isMulti ? 1200 : 660);
      this.multiLine = isMulti;

      // 設置値復元
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isMultiLineForShipList = isMulti;
      this.$store.dispatch('updateSetting', setting);
    },
    bootTooltip(viewShip: ViewShip, e: MouseEvent | FocusEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip) {
        return;
      }
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        if (e instanceof MouseEvent) {
          this.tooltipX = e.clientX;
          this.tooltipY = e.clientY;
        } else if (e.target) {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          this.tooltipX = rect.left + rect.width / 2;
          this.tooltipY = rect.top + rect.height;
        }

        const baseAsw = Ship.getStatusFromLevel(viewShip.level, viewShip.ship.maxAsw, viewShip.ship.minAsw);
        const ship = new Ship({
          master: viewShip.ship,
          hp: viewShip.hp,
          level: viewShip.level,
          luck: viewShip.luck,
          asw: baseAsw + viewShip.asw,
        });
        this.tooltipShip = ship;
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    translate(v: string): string {
      return v ? `${this.$t(v)}` : '';
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        return `${shipName.map((v) => this.translate(v)).join('')}`;
      }
      return ship.name || '';
    },
    getShipTypeName(name: string): string {
      if (this.isNotJapanese) {
        const array = Convert.getShipTypeNameArray(name);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }

      return name;
    },
    resetFilter() {
      this.shipFilter = new ShipFilter();
      this.filter();
    },
    toggleFilterDialog() {
      if (!this.filterDialog) {
        // 検索かける
        this.filter();
      }
    },
    closeFilterDialog() {
      this.filterDialog = false;
      this.filter();
    },
    showBookmarkDialog() {
      this.bookmarksDialog = true;
    },
    closeBookmarkDialog() {
      this.bookmarksDialog = false;
      this.toggleBookmarkDialog();
    },
    toggleBookmarkDialog() {
      if (!this.bookmarksDialog) {
        this.filter();
      }
    },
  },
});
</script>
