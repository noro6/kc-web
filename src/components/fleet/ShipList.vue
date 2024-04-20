<template>
  <v-card class="list-card">
    <div class="d-flex py-2 pr-2 align-center">
      <div class="ship-search-text ml-3">
        <v-text-field
          dense
          hide-details
          :placeholder="$t('ItemList.図鑑id 名称検索')"
          v-model.trim="keyword"
          @input="filter()"
          clearable
          :disabled="!!uniqueIdSearch"
          prepend-inner-icon="mdi-magnify"
          ref="inputBox"
        />
      </div>
      <template v-if="!isMobile">
        <div class="api-search-text" v-if="enabledApiIdSearch">
          <v-text-field
            dense
            hide-details
            type="number"
            placeholder="api_id"
            v-model.trim="uniqueIdSearch"
            @input="filter()"
            clearable
            :disabled="!!keyword"
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
      </template>
      <template v-else>
        <v-spacer></v-spacer>
        <v-btn icon @click="filterDialog = true">
          <v-icon>mdi-filter</v-icon>
        </v-btn>
        <v-menu bottom @input="filter()">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-sort</v-icon>
            </v-btn>
          </template>
          <v-card class="sort-menu-card">
            <v-list dense>
              <v-list-item @click="sortKey = ''">
                <v-list-item-title>{{ $t("Common.リセット") }}</v-list-item-title>
              </v-list-item>
              <v-list-item v-for="(key, index) in sortKeys" :key="index" @click="sortKey = key.value" :input-value="sortKey === key.value">
                <v-list-item-title>{{ $t("Common." + key.text) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
      <v-btn icon @click="handleClose()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="d-none d-sm-flex py-2 align-center" :class="{ 'ml-3': multiLine, 'ml-1': !multiLine }">
      <v-btn @click="filterDialog = true" :disabled="disabledDetailFilter" outlined> <v-icon>mdi-filter</v-icon>{{ $t("Common.絞り込み") }} </v-btn>
      <v-btn class="ml-1" text @click.stop="resetFilter()" small :disabled="disabledDetailFilter">
        {{ $t("Common.リセット") }}
      </v-btn>
      <div v-if="!isNotJapanese" class="ml-3 caption d-none d-md-block text--secondary">Ctrlキー + 艦娘をクリックでwikiを展開します。</div>
      <div class="ml-auto mr-4" v-if="shipStock.length">
        <v-switch
          class="mt-0"
          v-model="isStockOnly"
          :label="$t('Fleet.在籍艦娘反映')"
          @click="clickedStockOnly()"
          :disabled="disabledStockOnlyChange || !!batchList.length"
          dense
          hide-details
        />
      </div>
    </div>
    <div class="d-flex flex-wrap" :class="{ 'ml-3': multiLine && !isMobile, 'ml-1': !multiLine }">
      <div
        v-ripple="{ class: 'info--text' }"
        class="type-selector d-flex"
        :class="{ active: type === -1 && !disabledDetailFilter, disabled: keyword || uniqueIdSearch }"
        @click="changeType(-1)"
        @keypress="changeType(-1)"
      >
        <div class="type-all-text">ALL</div>
      </div>
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type && !disabledDetailFilter, disabled: keyword || uniqueIdSearch }"
        @click="changeType(index)"
        @keypress="changeType(index)"
      >
        {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
      </div>
      <div
        v-if="batchList.length"
        v-ripple="{ class: 'info--text' }"
        class="type-selector d-flex"
        :class="{ active: isCheckedOnly, disabled: keyword || uniqueIdSearch }"
        @click="toggleCheckedOnly"
        @keypress="toggleCheckedOnly"
      >
        {{ $t("Fleet.選択済") }}
      </div>
      <div class="ml-auto mr-3 d-flex" v-if="isStockOnly && !isMobile">
        <div v-if="shipFilter.hasAreaOnly" class="area-tags">
          <div
            v-for="area in maxAreas"
            :key="`area${area}`"
            class="area-area-img"
            :class="{ selected: shipFilter.selectedArea === area || !shipFilter.selectedArea }"
            @click="selectAreaTag(area)"
            @keypress.enter="selectAreaTag(area)"
          >
            <img :src="`./img/tags/area${area}_min.webp`" :alt="`area-${area}`" />
          </div>
        </div>
        <div class="filter-img">
          <!-- 作戦参加中 -->
          <img v-show="shipFilter.hasAreaOnly" @click="toggleAreaFilter" @keypress="toggleAreaFilter" :src="`./img/util/filtered1.png`" alt="area-img-1" />
          <!-- 待機中 -->
          <img v-show="shipFilter.hasNotAreaOnly" @click="toggleAreaFilter" @keypress="toggleAreaFilter" :src="`./img/util/filtered2.png`" alt="area-img-2" />
          <!-- 全艦艇 -->
          <img
            v-show="!shipFilter.hasAreaOnly && !shipFilter.hasNotAreaOnly"
            @click="toggleAreaFilter"
            @keypress="toggleAreaFilter"
            :src="`./img/util/filtered0.png`"
            alt="area-img-0"
          />
        </div>
      </div>
    </div>
    <v-divider :class="{ 'ml-3': multiLine && !isMobile }" />
    <div class="ship-table-body pb-2" :class="{ 'ml-3': multiLine && !isMobile, 'px-2': isMobile }">
      <div v-if="!multiLine && ships.length" class="ship-status-header pr-3">
        <div class="ship-status" v-for="i in 5" :key="`slot${i}`">{{ $t("Fleet.搭載") }}{{ i }}</div>
      </div>
      <div v-for="(typeData, i) in ships" :key="i" class="pl-sm-3">
        <div class="type-divider">
          <div class="caption text--secondary" v-if="sortKey">
            {{ selectedSortText }} {{ typeData.typeName }}
            <span class="caption2" v-if="typeData.needOrOver">{{ $t("ItemList.以上") }}</span>
          </div>
          <div class="caption text--secondary" v-else>{{ getShipTypeName(typeData.typeName) }}</div>
          <div class="type-divider-border" />
        </div>
        <div :class="{ multi: multiLine, 'batch-mode': isBatchMode }">
          <div
            v-for="(data, i) in typeData.ships"
            :key="i"
            class="ship-list"
            :class="{
              'pr-3': !multiLine,
              'no-stock': !data.count,
              selected: data.batchListIndex >= 0,
              'blue-ribbon': data.spEffectItemId === 1,
              'white-ribbon': data.spEffectItemId === 2,
            }"
            v-ripple="{ class: data.count ? 'info--text' : 'red--text' }"
            @click="clickedShip(data, $event)"
            @keypress.enter="clickedShip(data, $event)"
          >
            <div class="ship-img" @mouseenter="bootTooltip(data, $event)" @mouseleave="clearTooltip" @focus="bootTooltip(data, $event)" @blur="clearTooltip">
              <div>
                <v-img :src="`./img/ship/${data.ship.id}.png`" height="30" width="120" />
              </div>
              <div class="area-banner" v-if="data.area > 0 && data.area <= maxAreas">
                <v-img :src="`./img/tags/area${data.area}.webp`" height="40" width="29" />
              </div>
              <div class="slot-ex-img" v-if="data.expanded" :class="{ 'exist-item': data.spEffectItemId }">
                <v-img :src="`./img/util/slot_ex.png`" :height="data.spEffectItemId ? 20 : 25" :width="data.spEffectItemId ? 20 : 25" />
              </div>
              <div class="sp-item-img" v-if="data.spEffectItemId">
                <v-img v-if="data.spEffectItemId === 1" :src="`./img/util/miiro_min.png`" height="30" width="18" />
                <v-img v-else :src="`./img/util/tasuki_min.png`" height="30" width="18" />
              </div>
              <div class="bookmarked-icon" v-if="data.isBookmarked"><v-icon small color="pink lighten-2">mdi-heart</v-icon></div>
            </div>
            <div class="flex-grow-1 ml-1">
              <div class="d-flex ship-caption">
                <div class="primary--text ship-level">
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
            <div v-if="data.batchListIndex >= 0" class="batch-index">{{ data.batchListIndex + 1 }}</div>
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
        <div class="d-flex align-center justify-center">
          <div class="mt-1">
            {{ $t("Common.もしかして") }}
          </div>
          <div>
            <v-btn class="pt-0" text color="primary" @click="filterDialog = true">{{ $t("Common.検索条件") }}</v-btn>
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
    <v-dialog v-model="filterDialog" transition="scroll-x-transition" width="760" @input="toggleFilterDialog" :fullscreen="isMobile">
      <v-card class="filter-dialog-card">
        <div class="d-flex pt-2 pb-1 px-2">
          <div class="align-self-center ml-3 body-2">{{ $t("Common.絞り込み") }}</div>
          <v-spacer />
          <div v-if="shipStock.length" class="align-self-center">
            <v-switch
              class="mr-3 mt-0 pt-0"
              v-model="isStockOnly"
              :label="$t('Fleet.在籍艦娘反映')"
              @click="clickedStockOnly()"
              :disabled="disabledStockOnlyChange || !!batchList.length"
              dense
              hide-details
            />
          </div>
          <v-btn class="align-self-center" v-if="isMobile" icon @click.stop="resetFilter()">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
          <v-btn class="mr-3 align-self-center" v-else small text @click.stop="resetFilter()">
            {{ $t("Common.リセット") }}
          </v-btn>
          <v-btn icon @click="closeFilterDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider class="mx-2" />
        <div class="filter-dialog-body pr-1 pb-2">
          <div class="d-flex" v-if="isStockOnly && isMobile">
            <div class="caption">{{ $t("Database.お札") }}</div>
            <div class="header-divider" />
          </div>
          <div v-if="isStockOnly && isMobile">
            <div class="filter-img">
              <!-- 作戦参加中 -->
              <img v-show="shipFilter.hasAreaOnly" @click="toggleAreaFilter" @keypress="toggleAreaFilter" :src="`./img/util/filtered1.png`" alt="area-img-1" />
              <!-- 待機中 -->
              <img
                v-show="shipFilter.hasNotAreaOnly"
                @click="toggleAreaFilter"
                @keypress="toggleAreaFilter"
                :src="`./img/util/filtered2.png`"
                alt="area-img-2"
              />
              <!-- 全艦艇 -->
              <img
                v-show="!shipFilter.hasAreaOnly && !shipFilter.hasNotAreaOnly"
                @click="toggleAreaFilter"
                @keypress="toggleAreaFilter"
                :src="`./img/util/filtered0.png`"
                alt="area-img-0"
              />
            </div>
            <div v-if="shipFilter.hasAreaOnly" class="area-tags">
              <div
                v-for="area in maxAreas"
                :key="`area${area}`"
                class="area-area-img mobile"
                :class="{ selected: shipFilter.selectedArea === area || !shipFilter.selectedArea }"
                @click="selectAreaTag(area)"
                @keypress.enter="selectAreaTag(area)"
              >
                <img :src="`./img/tags/area${area}.webp`" :alt="`area-${area}`" />
              </div>
            </div>
          </div>
          <div class="d-flex mt-4 mt-sm-0">
            <div class="caption">{{ $t("Fleet.改造状態") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.includeInitial" dense hide-details :label="$t('Fleet.未改造')" :error="isAllUncheckedRemodeling" />
            <v-checkbox v-model="shipFilter.includeIntermediate" dense hide-details :label="$t('Fleet.中間改造')" :error="isAllUncheckedRemodeling" />
            <v-checkbox v-model="shipFilter.includeFinal" dense hide-details :label="$t('Fleet.最終改造')" :error="isAllUncheckedRemodeling" />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Fleet.装備搭載可否") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.midgetSubmarineOK" :disabled="!visibleMidgetSubmarineFilter" dense hide-details :label="$t('Fleet.甲標的')" />
            <v-checkbox v-model="shipFilter.largeSearchlightOK" dense hide-details :label="$t('Fleet.大型探照灯')" />
          </div>
          <div class="filter-input-container mt-1">
            <manual-checkbox
              mode="img"
              :ok="shipFilter.landingCraftOK"
              :ng="shipFilter.landingCraftNG"
              :toggle="toggleDaihatsuFilter"
              imgPath="./img/type/type24.png"
            />
            <manual-checkbox mode="img" :ok="shipFilter.tankOK" :ng="shipFilter.tankNG" :toggle="toggleTankFilter" imgPath="./img/type/type46.png" />
            <manual-checkbox
              mode="img"
              :ok="shipFilter.spBomberOK"
              :ng="shipFilter.spBomberNG"
              :toggle="toggleSpBomberFilter"
              imgPath="./img/type/type1100.png"
              :disabled="!visibleSpBomberFilter"
            />
            <manual-checkbox
              mode="img"
              :ok="shipFilter.fighterOK"
              :ng="shipFilter.fighterNG"
              :toggle="toggleFighterFilter"
              imgPath="./img/type/type4500.png"
              :disabled="!visibleFighterFilter"
            />
            <manual-checkbox
              mode="img"
              :ok="shipFilter.commanderOK"
              :ng="shipFilter.commanderNG"
              :toggle="toggleCommanderFilter"
              imgPath="./img/type/type34.png"
              :disabled="!visibleCommanderFilter"
            />
            <manual-checkbox
              mode="img"
              :ok="shipFilter.armorOK"
              :ng="shipFilter.armorNG"
              :toggle="toggleArmorFilter"
              imgPath="./img/type/type27.png"
              :disabled="!visibleArmorFilter"
            />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("ItemList.補強増設") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <manual-checkbox
              :ok="shipFilter.isReleaseExSlotOnly"
              :ng="shipFilter.isNotReleaseExSlotOnly"
              :toggle="toggleExSlotFilter"
              :disabled="!isStockOnly"
              >{{ $t("Fleet.開放") }}</manual-checkbox
            >
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.canEquip13RadarOnly" dense hide-details :label="$t('Fleet.13号電探系')" />
            <v-checkbox v-model="shipFilter.canEquip22RadarOnly" dense hide-details :label="$t('Fleet.22号電探系')" />
            <v-checkbox v-model="shipFilter.canEquipMastRadarOnly" dense hide-details :label="$t('Fleet.電探マスト')" />
            <v-checkbox v-model="shipFilter.canEquipRadarOnly" dense hide-details :label="$t('Fleet.その他電探')" />
            <v-checkbox v-model="shipFilter.canEquipExSubGunOnly" dense hide-details :label="$t('EType.副砲')" />
            <v-checkbox v-model="shipFilter.canEquipExCommanderOnly" dense hide-details :label="$t('EType.司令部施設')" />
            <v-checkbox v-model="shipFilter.canEquipExDepthChargeOnly" dense hide-details :label="$t('EType.爆雷')" />
            <v-checkbox v-model="shipFilter.canEquipExArmorOnly" dense hide-details :label="$t('EType.追加装甲')" />
            <v-checkbox v-model="shipFilter.canEquipExTankOnly" dense hide-details :label="$t('EType.特型内火艇')" />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Common.耐久") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.HPIs4n1" dense hide-details label="4n - 1" :error="isAllUncheckedHP" />
            <v-checkbox v-model="shipFilter.HPIs4n2" dense hide-details label="4n - 2" :error="isAllUncheckedHP" />
            <v-checkbox v-model="shipFilter.HPIs4n3" dense hide-details label="4n - 3" :error="isAllUncheckedHP" />
            <v-checkbox v-model="shipFilter.HPIs4n" dense hide-details label="4n" :error="isAllUncheckedHP" />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Common.速力") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.includeFast" dense hide-details :label="$t('Fleet.高速')" :error="isAllUncheckedSpeed" />
            <v-checkbox v-model="shipFilter.includeSlow" dense hide-details :label="$t('Fleet.低速')" :error="isAllUncheckedSpeed" />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Common.射程") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.includeRange1" dense hide-details :label="$t('Common.短')" :error="isAllUncheckedRange" />
            <v-checkbox v-model="shipFilter.includeRange2" dense hide-details :label="$t('Common.中')" :error="isAllUncheckedRange" />
            <v-checkbox v-model="shipFilter.includeRange3" dense hide-details :label="$t('Common.長')" :error="isAllUncheckedRange" />
            <v-checkbox v-model="shipFilter.includeRange4" dense hide-details :label="$t('Common.超長')" :error="isAllUncheckedRange" />
          </div>
          <div class="d-flex mt-4 align-center">
            <div class="caption">{{ $t("Database.国籍") }}</div>
            <div class="header-divider" />
            <div class="pl-3">
              <v-btn small @click="toggleAllNationality()" outlined color="primary">
                <v-icon small class="mr-1">mdi-check-all</v-icon> {{ $t("Database.一括チェック") }}
              </v-btn>
            </div>
          </div>
          <div class="filter-input-container">
            <v-checkbox
              v-for="(item, i) in shipFilter.nationalities"
              :key="`item${i}`"
              dense
              v-model="item.isChecked"
              :label="$t(`Database.${item.text}`)"
              hide-details
              :error="shipFilter.nationalities.every((v) => !v.isChecked)"
            />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Fleet.装備スロット数") }}</div>
            <div class="header-divider" />
          </div>
          <div class="filter-input-container">
            <v-checkbox
              v-model="shipFilter.slotCount3"
              dense
              hide-details
              :label="$t('Fleet.3スロ以上')"
              :disabled="shipFilter.slotCount4 || shipFilter.slotCount5"
            />
            <v-checkbox v-model="shipFilter.slotCount4" dense hide-details :label="$t('Fleet.4スロ以上')" :disabled="shipFilter.slotCount5" />
            <v-checkbox v-model="shipFilter.slotCount5" dense hide-details :label="$t('Fleet.5スロ以上')" />
          </div>
          <div class="d-flex mt-4">
            <div class="caption align-self-center">{{ $t("Common.その他") }}</div>
            <div class="header-divider" />
            <div class="pl-3">
              <v-btn small @click="showBookmarkDialog()" color="pink lighten-2" outlined>
                <v-icon small>mdi-heart-cog</v-icon> {{ $t("Fleet.お気に入り編集") }}
              </v-btn>
            </div>
          </div>
          <div class="filter-input-container">
            <v-checkbox v-model="shipFilter.escortCarrierOnly" dense hide-details :label="$t('Fleet.護衛空母')" :disabled="!visibleEscortCarrierFilter" />
            <v-checkbox v-model="shipFilter.onlyAutoOASW" dense hide-details :label="$t('Fleet.自動先制対潜')" />
            <v-checkbox v-model="shipFilter.onlyBookmarked" dense hide-details :label="$t('Fleet.お気に入り')" />
            <v-checkbox v-if="isStockOnly" v-model="shipFilter.onlyMarriage" dense hide-details :label="$t('Fleet.ケッコン艦')" />
          </div>
          <div class="d-flex mt-4">
            <div class="caption">{{ $t("Fleet.ステータス") }}</div>
            <div class="header-divider" />
          </div>
          <v-range-slider
            class="mt-6 mt-sm-4 px-1 px-sm-3"
            v-model="shipFilter.levelRange"
            dense
            thumb-label
            min="1"
            :max="maxLevel"
            hide-details
            :disabled="!isStockOnly"
          >
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
          <v-range-slider class="mt-6 mt-sm-4 px-1 px-sm-3" v-model="shipFilter.luckRange" dense thumb-label min="1" max="200" hide-details>
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
          <v-range-slider class="mt-6 mt-sm-4 px-1 px-sm-3" v-model="shipFilter.aswRange" dense thumb-label min="0" max="150" hide-details>
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
          <v-range-slider class="mt-6 mt-sm-4 px-1 px-sm-3" v-model="shipFilter.HPRange" dense thumb-label min="1" max="120" hide-details>
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
          <v-range-slider class="mt-6 mt-sm-4 px-1 px-sm-3" v-model="shipFilter.fireRange" dense thumb-label min="1" max="200" hide-details>
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
          <v-range-slider class="mt-6 mt-sm-4 px-1 px-sm-3" v-model="shipFilter.torpedoRange" dense thumb-label min="0" max="150" hide-details>
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
          <v-range-slider class="mt-6 mt-sm-4 px-1 px-sm-3" v-model="shipFilter.nightRange" dense thumb-label min="1" max="300" hide-details>
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
      </v-card>
    </v-dialog>
    <v-dialog v-model="bookmarksDialog" width="1200" @input="toggleBookmarkDialog" :fullscreen="isMobile">
      <ship-bookmark-edit :handle-close="closeBookmarkDialog" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.list-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.ship-table-body {
  overflow-y: auto;
  overscroll-behavior: contain;
}
@media (min-width: 600px) {
  .list-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }
  .ship-table-body {
    height: 64vh;
  }
}

.ship-search-text {
  width: 150px;
}
.api-search-text {
  width: 128px;
}
.ship-sort-select {
  width: 150px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem;
  font-size: 14px;
  cursor: pointer;
  min-width: 50px;
  text-align: center;
}
@media (min-width: 600px) {
  .type-selector {
    min-width: unset;
  }
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
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
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
    column-gap: 1px;
    row-gap: 1px;
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
  user-select: none;
}
.ship-list:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-list.no-stock:hover {
  background-color: rgba(255, 128, 128, 0.1);
}
.ship-list.blue-ribbon {
  border: 2px solid rgb(74, 112, 214);
  padding: 0.4px 2.8px;
}
.ship-list.white-ribbon {
  border: 2px solid rgb(128, 128, 128);
  padding: 0.4px 2.8px;
}

.ship-list > div {
  align-self: center;
}
.batch-mode .ship-list {
  position: relative !important;
  opacity: 0.7;
  border: 1px solid transparent;
}
.batch-mode .ship-list.selected {
  border: 1px solid #2196f3;
  opacity: 1;
}
.batch-mode .batch-index {
  position: absolute;
  top: 1px;
  right: 45%;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2196f3;
}
.multi.batch-mode .batch-index {
  right: 1px;
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
.slot-ex-img.exist-item {
  right: 10px;
  width: 20px;
  height: 20px;
}
.sp-item-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 18px;
  height: 30px;
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
.filter-img {
  align-self: center;
  cursor: pointer;
  height: 32px;
  width: 56px;
}
.filter-img img {
  height: 32px;
  width: 56px;
}
/** 海域札 */
.area-tags {
  display: flex;
  flex-wrap: wrap;
}
@media (min-width: 600px) {
  .area-tags {
    height: 40px;
    margin-right: 4px;
  }
}
.area-area-img {
  cursor: pointer;
  opacity: 0.4;
  transition: 0.1s ease-out;
  margin-left: -4px;
}
.area-area-img img {
  width: 37px;
  height: 40px;
}
.area-area-img:hover {
  opacity: 0.5;
}
.area-area-img.selected {
  opacity: 1;
}
.area-area-img.mobile img {
  width: 50px;
  height: 68px;
}

.filter-dialog-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.filter-dialog-body {
  padding: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
@media (min-width: 600px) {
  .filter-dialog-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }
  .filter-dialog-body {
    padding-top: 20px;
    padding-left: 20px;
    height: 70vh;
  }
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}
@media (min-width: 600px) {
  .filter-input-container {
    margin-left: 12px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.sort-menu-card {
  min-width: 120px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import ManualCheckbox from '@/components/common/ManualCheckbox.vue';
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
  /** 補強増設空いてるかどうか */
  expanded: boolean;
  /** ソート用ステータス */
  sortValue: number;
  /** 所持情報ユニークid */
  uniqueId: number;
  /** お気に入りかどうか */
  isBookmarked: boolean;
  /** 海色リボン 白たすき */
  spEffectItemId: number;
  /** 一括編成リストのインデックス */
  batchListIndex: number;
}

export default Vue.extend({
  name: 'ShipList',
  components: { ShipTooltip, ShipBookmarkEdit, ManualCheckbox },
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
      { text: '燃料+弾薬', value: 'resource' },
      { text: '射程', value: 'range' },
      { text: '運改修', value: 'luckRemodel' },
      { text: '搭載数', value: 'slotSize' },
      { text: '読み', value: 'yomi' },
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
    isBatchMode: false,
    batchMax: 0,
    batchList: [] as ViewShip[],
    isCheckedOnly: false,
    uniqueIdSearch: '',
    isMobile: true,
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

    this.updateIsMobile();
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
      return !this.sortKey || this.sortKey === 'level' || this.sortKey === 'luck' || this.sortKey === 'range' || this.sortKey === 'luckRemodel' || this.sortKey === 'yomi';
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
      return this.type === -1;
    },
    visibleSpBomberFilter(): boolean {
      // 水爆系フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CA, SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBB].includes(type)) {
          return true;
        }
      }
      return this.type === -1;
    },
    visibleFighterFilter(): boolean {
      // 戦闘機搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CA, SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBB].includes(type)) {
          return true;
        }
      }
      return this.type === -1;
    },
    visibleArmorFilter(): boolean {
      // バルジ搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.DD, SHIP_TYPE.CL, SHIP_TYPE.AO_2].includes(type)) {
          return true;
        }
      }
      return this.type === -1;
    },
    visibleCommanderFilter(): boolean {
      // 司令部搭載可フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.DD, SHIP_TYPE.AO_2].includes(type)) {
          return true;
        }
      }
      return this.type === -1;
    },
    visibleEscortCarrierFilter(): boolean {
      // 護衛空母フィルタ表示制御
      for (let i = 0; i < this.selectedShipTypes.length; i += 1) {
        const type = this.selectedShipTypes[i];
        if ([+SHIP_TYPE.CVL, SHIP_TYPE.CV].includes(type)) {
          return true;
        }
      }
      return this.type === -1;
    },
    isAllUncheckedHP() {
      return !this.shipFilter.HPIs4n && !this.shipFilter.HPIs4n1 && !this.shipFilter.HPIs4n2 && !this.shipFilter.HPIs4n3;
    },
    isAllUncheckedRemodeling() {
      return !this.shipFilter.includeInitial && !this.shipFilter.includeIntermediate && !this.shipFilter.includeFinal;
    },
    isAllUncheckedSpeed() {
      return !this.shipFilter.includeFast && !this.shipFilter.includeSlow;
    },
    isAllUncheckedRange() {
      return !this.shipFilter.includeRange1 && !this.shipFilter.includeRange2 && !this.shipFilter.includeRange3 && !this.shipFilter.includeRange4;
    },
    disabledDetailFilter(): boolean {
      return !!this.keyword || this.isCheckedOnly || !!this.uniqueIdSearch;
    },
    enabledApiIdSearch() {
      // 在籍モード かつ ケツのuniqueId が意味のある数字
      return this.isStockOnly && this.shipStock.length && this.shipStock[this.shipStock.length - 1].uniqueId !== this.shipStock.length;
    },
  },
  methods: {
    updateIsMobile() {
      this.isMobile = window.innerWidth < 600;
      if (this.isMobile) {
        this.changeMultiLine(true);
      }
    },
    changeType(index = 0) {
      this.type = index;
      this.isCheckedOnly = false;
      this.filter();
    },
    toggleCheckedOnly() {
      this.isCheckedOnly = true;
      this.filter();
    },
    clickedStockOnly() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isStockOnlyForShipList = this.isStockOnly;
      this.$store.dispatch('updateSetting', setting);
      this.filter();
    },
    selectAreaTag(area: number) {
      this.shipFilter.selectedArea = area;
      this.filter();
    },
    toggleAreaFilter() {
      if (this.shipFilter.hasAreaOnly) {
        // 作戦参加 => 全艦艇
        this.shipFilter.hasAreaOnly = false;
        this.shipFilter.hasNotAreaOnly = true;
      } else if (this.shipFilter.hasNotAreaOnly) {
        // 待機中 => 全艦艇
        this.shipFilter.hasNotAreaOnly = false;
      } else {
        // 全艦艇 => 作戦参加
        this.shipFilter.hasAreaOnly = true;
        // 特定海域札フィルタを勝手に消す
        this.shipFilter.selectedArea = 0;
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
    },
    toggleAllNationality() {
      // いずれか1つでも未チェックがあれば全チェック => 全チェック状態だった場合のみチェックを解除ということ。
      const checked = this.shipFilter.nationalities.some((v) => !v.isChecked);
      for (let i = 0; i < this.shipFilter.nationalities.length; i += 1) {
        this.shipFilter.nationalities[i].isChecked = checked;
      }
    },
    initialize(enabledUserShip = true, batchMax = 0) {
      // 一括編成モード
      this.isBatchMode = batchMax > 0;
      this.isCheckedOnly = false;
      this.batchMax = batchMax;
      this.batchList = [];

      this.updateIsMobile();

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

      this.$nextTick(() => {
        if (!this.isMobile) {
          (this.$refs.inputBox as HTMLInputElement).focus();
        }
      });
    },
    filter() {
      this.updateIsMobile();

      if (!this.batchList.length && this.isCheckedOnly) {
        // 一括配備モードのゴミ掃除 => 一件も選択装備がないのに選択のみフィルタがあった場合
        this.isCheckedOnly = false;
      }

      const word = this.keyword ? this.keyword.toUpperCase() : '';
      const uniqueIdWord = this.uniqueIdSearch ? +this.uniqueIdSearch : 0;
      let result = this.all.concat();
      const t = this.types[this.type];

      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.savedShipListFilter = this.shipFilter;
      setting.savedShipListSortKey = this.sortKey;
      this.$store.dispatch('updateSetting', setting);

      // 検索語句あればこれ以外の検索はしない
      if (word) {
        // ひらがなをカタカナに変換
        const kana = word.replace(/[\u3041-\u3096]/g, (match) => {
          const chr = match.charCodeAt(0) + 0x60;
          return String.fromCharCode(chr);
        });
        result = result.filter(
          (v) => v.id === +word || v.albumId === +word || v.name.toUpperCase().indexOf(word) >= 0 || v.yomi.indexOf(word) >= 0 || v.yomi.indexOf(kana) >= 0,
        );
      } else if (!this.disabledDetailFilter) {
        // 一括配備モードの選択済みフィルタがないとき
        // 以下、この段階でフィルタ可能なものをフィルタする

        // カテゴリ検索
        if (t) {
          result = result.filter((v) => t.types.includes(v.type));
        }
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
        if (!this.shipFilter.includeRange1) {
          // 射程
          result = result.filter((v) => v.range !== 1);
        }
        if (!this.shipFilter.includeRange2) {
          result = result.filter((v) => v.range !== 2);
        }
        if (!this.shipFilter.includeRange3) {
          result = result.filter((v) => v.range !== 3);
        }
        if (!this.shipFilter.includeRange4) {
          result = result.filter((v) => v.range !== 4);
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
            const armor1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 72);
            const armor2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 73);
            if (armor1 && armor2) {
              result = result.filter((v) => isValid(v, armor1) || isValid(v, armor2));
            }
          } else if (this.shipFilter.armorNG) {
            // バルジ搭載不可
            const armor1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 72);
            const armor2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 73);
            if (armor1 && armor2) {
              result = result.filter((v) => !isValid(v, armor1) && !isValid(v, armor2));
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
        if (this.shipFilter.canEquip13RadarOnly) {
          // 増設13号電探
          const radar0 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 27);
          const radar1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 506);
          if (radar0 && radar1) {
            const ex = Const.EXPAND_SLOT_INDEX;
            result = result.filter((v) => isValid(v, radar0, ex, 10) || isValid(v, radar1, ex, 10));
          }
        }
        if (this.shipFilter.canEquip22RadarOnly) {
          // 増設22号電探
          const radar0 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 28);
          const radar1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 517);
          if (radar0 && radar1) {
            const ex = Const.EXPAND_SLOT_INDEX;
            result = result.filter((v) => isValid(v, radar0, ex, 10) || isValid(v, radar1, ex, 10));
          }
        }
        if (this.shipFilter.canEquipMastRadarOnly) {
          // 増設13号電探マスト
          const radar0 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 506);
          if (radar0) {
            const ex = Const.EXPAND_SLOT_INDEX;
            result = result.filter((v) => isValid(v, radar0, ex, 10));
          }
        }
        if (this.shipFilter.canEquipRadarOnly) {
          // 増設その他の電探限定
          const radar0 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 527);
          const radar1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 528);
          if (radar0 && radar1) {
            const ex = Const.EXPAND_SLOT_INDEX;
            result = result.filter((v) => isValid(v, radar0, ex, 10) || isValid(v, radar1, ex, 10));
          }
        }
        if (this.shipFilter.canEquipExSubGunOnly) {
          // 増設副砲
          const subGun1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 220);
          const subGun2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 275);
          if (subGun1 && subGun2) {
            result = result.filter((v) => isValid(v, subGun1, Const.EXPAND_SLOT_INDEX, 10) || isValid(v, subGun2, Const.EXPAND_SLOT_INDEX, 10));
          }
        }
        if (this.shipFilter.canEquipExCommanderOnly) {
          // 増設司令部
          const commander = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 107);
          if (commander) {
            result = result.filter((v) => isValid(v, commander, Const.EXPAND_SLOT_INDEX, 10));
          }
        }
        if (this.shipFilter.canEquipExTankOnly) {
          // 増設カミ車
          const tank0 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 525);
          const tank1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 526);
          if (tank0 && tank1) {
            result = result.filter((v) => isValid(v, tank0, Const.EXPAND_SLOT_INDEX, 10) || isValid(v, tank1, Const.EXPAND_SLOT_INDEX, 10));
          }
        }
        if (this.shipFilter.canEquipExArmorOnly) {
          // 増設バルジ搭載可能
          const armor1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 72);
          const armor2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 73);
          if (armor1 && armor2) {
            result = result.filter((v) => isValid(v, armor1, Const.EXPAND_SLOT_INDEX, 10) || isValid(v, armor2, Const.EXPAND_SLOT_INDEX, 10));
          }
        }
        if (this.shipFilter.canEquipExDepthChargeOnly) {
          // 増設爆雷搭載可能
          const item0 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 226);
          const item1 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 227);
          if (item0 && item1) {
            result = result.filter((v) => isValid(v, item0, Const.EXPAND_SLOT_INDEX, 10) || isValid(v, item1, Const.EXPAND_SLOT_INDEX, 10));
          }
        }
        if (this.shipFilter.escortCarrierOnly && this.visibleEscortCarrierFilter) {
          // 護衛空母のみ
          result = result.filter((v) => v.isCV && v.minAsw);
        }
        if (this.shipFilter.onlyAutoOASW) {
          // 自動先制対潜のみ
          result = result.filter((v) => [141, 478, 624, 394, 893, 681, 906, 920].includes(v.id) || (v.type2 === 91 && v.id !== 941));
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
          return minFire <= v.fire && v.fire <= maxFire && minTorpedo <= v.torpedo && v.torpedo <= maxTorpedo && minNight <= night && night <= maxNight;
        });
      }

      // 検索用一時変数
      const minLevel = this.shipFilter.levelRange[0];
      const maxLevel = this.shipFilter.levelRange[1];
      const minLuck = this.shipFilter.luckRange[0];
      const maxLuck = this.shipFilter.luckRange[1];
      const minAsw = this.shipFilter.aswRange[0];
      const maxAsw = this.shipFilter.aswRange[1];
      const minHP = this.shipFilter.HPRange[0];
      const maxHP = this.shipFilter.HPRange[1];

      const bookmarks = setting.bookmarkedShipIds;

      // 国籍フィルタ ブラックリスト形式で
      let forbiddenNationalities: number[] = [];
      // 選択されて『いない』国
      const notSelectedNationalFilters = this.shipFilter.nationalities.filter((v) => !v.isChecked).map((v) => v.filter);
      for (let index = 0; index < notSelectedNationalFilters.length; index += 1) {
        // 選択されて『いない』国のフィルタ(type2の配列)を連結していく
        forbiddenNationalities = forbiddenNationalities.concat(notSelectedNationalFilters[index]);
      }
      // 日本特別対応
      const withoutJapan = this.shipFilter.nationalities
        .filter((v) => !v.isChecked)
        .map((v) => v.value)
        .includes(0);

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
              spEffectItemId: shipData.spEffectItems && shipData.spEffectItems.length ? shipData.spEffectItems[0].kind : 0,
              batchListIndex: this.isBatchMode ? this.batchList.findIndex((v) => v.uniqueId === shipData.uniqueId) : -1,
            };

            // api_id検索が有効
            if (uniqueIdWord && shipData.uniqueId !== uniqueIdWord && this.enabledApiIdSearch) {
              continue;
            }

            if (this.isCheckedOnly && viewShip.batchListIndex < 0) {
              // 一括反映モード 選択艦のみ
              continue;
            }

            if (!this.disabledDetailFilter) {
              if ((this.shipFilter.isReleaseExSlotOnly && !viewShip.expanded) || (this.shipFilter.isNotReleaseExSlotOnly && viewShip.expanded)) {
                // 補強増設開放済み検索
                continue;
              }
              if (
                viewShip.level < minLevel
                || viewShip.level > maxLevel
                || viewShip.luck < minLuck
                || viewShip.luck > maxLuck
                || viewShip.hp < minHP
                || viewShip.hp > maxHP
              ) {
                // Lv 運 耐久検索
                continue;
              }
              if (
                (!this.shipFilter.HPIs4n && viewShip.hp % 4 === 0)
                || (!this.shipFilter.HPIs4n1 && viewShip.hp % 4 === 3)
                || (!this.shipFilter.HPIs4n2 && viewShip.hp % 4 === 2)
                || (!this.shipFilter.HPIs4n3 && viewShip.hp % 4 === 1)
              ) {
                // 耐久4n系フィルタ
                continue;
              }
              if (this.shipFilter.onlyMarriage && viewShip.level < 100) {
                // ケッコン艦のみ
                continue;
              }
              // 国籍で絞る
              if (forbiddenNationalities.includes(master.type2) || (withoutJapan && Const.JPN.includes(master.type2))) {
                continue;
              }

              // 対潜値検索 => 初期値じゃない場合のみ、フィルタのための計算をする
              if (minAsw > 0 || maxAsw < 150) {
                if (!master.maxAsw && minAsw > 0) {
                  continue;
                }
                const asw = Ship.getStatusFromLevel(viewShip.level, master.maxAsw, master.minAsw) + viewShip.asw;
                if (asw < minAsw || maxAsw < asw) {
                  continue;
                }
              }
            }

            // 札付き検索
            if (this.shipFilter.hasAreaOnly) {
              if (!this.shipFilter.selectedArea && viewShip.area <= 0) {
                // 海域札個別指定なし
                continue;
              } else if (this.shipFilter.selectedArea && this.shipFilter.selectedArea !== viewShip.area) {
                // 海域札個別指定あり
                continue;
              }
            } else if (this.shipFilter.hasNotAreaOnly && viewShip.area > 0) {
              continue;
            }

            // id 練度 運 対潜 耐久 海域を見て配備済みかどうか判定
            const usedIndex = usedShips.findIndex(
              (v) => (v.data.id === master.id
                  && v.level === viewShip.level
                  && v.hp === viewShip.hp
                  && v.luck === viewShip.luck
                  && v.area === viewShip.area
                  && v.improveAsw === viewShip.asw
                  && v.spEffectItemId === viewShip.spEffectItemId
                  && v.releaseExpand === viewShip.expanded)
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
                && v.expanded === viewShip.expanded
                && v.spEffectItemId === viewShip.spEffectItemId,
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
          const batchListIndex = this.isBatchMode ? this.batchList.findIndex((v) => v.ship.id === master.id) : -1;
          if (this.isCheckedOnly && batchListIndex < 0) {
            // 一括反映モード 選択艦のみ
            continue;
          }

          if (!this.disabledDetailFilter) {
            // 耐久検索
            if (master.hp < minHP || master.hp > maxHP) {
              continue;
            }
            if (
              (!this.shipFilter.HPIs4n && master.hp % 4 === 0)
              || (!this.shipFilter.HPIs4n1 && master.hp % 4 === 3)
              || (!this.shipFilter.HPIs4n2 && master.hp % 4 === 2)
              || (!this.shipFilter.HPIs4n3 && master.hp % 4 === 1)
            ) {
              // 耐久4n系フィルタ
              continue;
            }
            // 対潜値検索 => 初期値じゃない場合のみ、フィルタのための計算をする
            if (minAsw > 0 || maxAsw < 150) {
              if (master.maxAsw < minAsw || maxAsw < master.maxAsw) {
                continue;
              }
            }

            // 国籍で絞る
            if (forbiddenNationalities.includes(master.type2) || (withoutJapan && Const.JPN.includes(master.type2))) {
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
            spEffectItemId: 0,
            batchListIndex,
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
      } else if (this.sortKey === 'yomi') {
        viewShips.sort((a, b) => a.ship.yomi.localeCompare(b.ship.yomi));
        resultShips.push({ typeName: '', ships: viewShips, needOrOver: false });
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
          } else if (key === 'resource') {
            const fuel = v.level >= 100 ? Math.max(Math.floor(v.ship.fuel * 0.85), 1) : v.ship.fuel;
            const ammo = v.level >= 100 ? Math.max(Math.floor(v.ship.ammo * 0.85), 1) : v.ship.ammo;
            v.sortValue = fuel + ammo;
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
        } else if (key === 'level') {
          // 練度毎にタイプ分け
          // 最大値を10の倍数に均す
          maxValue = Math.floor(maxValue / 10) * 10;
          for (let i = maxValue; i >= 0; i -= 10) {
            if (i === 90) {
              // 練度99で一つ特別に作る
              const lv99 = viewShips.filter((v) => v.sortValue === 99);
              if (lv99.length) {
                resultShips.push({ typeName: '99', ships: lv99, needOrOver: false });
              }
              const ships = viewShips.filter((v) => v.sortValue >= 90 && v.sortValue < 99);
              if (ships.length) {
                resultShips.push({ typeName: `${i}`, ships, needOrOver: true });
              }
            } else {
              const ships = viewShips.filter((v) => v.sortValue >= i && v.sortValue < i + 10);
              if (ships.length) {
                resultShips.push({ typeName: `${Math.max(i, 1)}`, ships, needOrOver: true });
              }
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

      // 一括選択モードの処理
      if (this.isBatchMode) {
        this.clearTooltip();
        const selectedId = ship.uniqueId;
        if (ship.batchListIndex >= 0) {
          // 選択状態から解除する
          if (selectedId) {
            // 在籍艦娘情報反映状態のデータ
            this.batchList = this.batchList.filter((v) => v.uniqueId !== selectedId);
          } else {
            // 在籍艦娘情報を未反映のデータ
            this.batchList = this.batchList.filter((v) => v.ship.id !== ship.ship.id);
          }
        } else if (this.batchList.length < this.batchMax) {
          // 追加
          this.batchList.push(ship);
        }
        this.filter();
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
      this.handleChangeWidth(isMulti ? 1200 : 696);
      this.multiLine = isMulti;

      // 設置値復元
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isMultiLineForShipList = isMulti;
      this.$store.dispatch('updateSetting', setting);
    },
    bootTooltip(viewShip: ViewShip, e: MouseEvent | FocusEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip || this.isMobile) {
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
      this.keyword = '';
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
