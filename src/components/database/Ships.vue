<template>
  <div class="mt-3">
    <v-tabs v-model="tab">
      <v-tab href="#list">{{ $t("Database.一覧") }}</v-tab>
      <v-tab href="#analytics">{{ $t("Database.分析") }}</v-tab>
      <v-tab href="#status_up">{{ $t("Database.ステータス上昇") }}</v-tab>
      <v-tab href="#compare" v-if="readOnly">{{ $t("Database.比較") }}</v-tab>
      <v-tab href="#group" v-if="shipStock.length">{{ $t("Database.札管理") }}</v-tab>
    </v-tabs>
    <v-divider class="mb-2" />
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item value="list">
        <div class="d-flex align-center flex-wrap mt-2">
          <v-btn @click="filterDialog = true" color="info">
            <v-icon>mdi-filter-variant</v-icon>
            {{ $t("Common.絞り込み") }}
            <span class="caption">({{ viewShips.length }}{{ isNotJapanese ? "" : "隻" }} / {{ allCount }}{{ isNotJapanese ? "" : "隻" }})</span>
          </v-btn>
          <v-btn v-if="viewShips.length !== allCount" @click="resetFilterCondition()" text class="ml-1">
            {{ $t("Common.リセット") }}
          </v-btn>
          <v-checkbox dense class="mt-0 pt-0 ml-3" v-model="isAvoidSpoiler" @change="changeAvoidSpoiler()" hide-details :label="$t('Database.ネタバレ防止')" />
          <v-btn-toggle class="ml-auto" dense v-model="modeTable" borderless mandatory>
            <v-btn :value="true" :class="{ 'blue darken-2 white--text': modeTable }" @click.stop="changeViewMode(true)">
              <v-icon>mdi-view-headline</v-icon>
              <span>{{ $t("Database.一覧表示") }}</span>
            </v-btn>
            <v-btn :value="false" :class="{ 'blue darken-2 white--text': !modeTable }" @click.stop="changeViewMode(false)">
              <v-icon>mdi-view-comfy</v-icon>
              <span>{{ $t("Database.艦隊分析表示") }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>
        <v-dialog v-model="filterDialog" transition="scroll-x-transition" width="800" @input="toggleFilterDialog">
          <v-card>
            <div class="d-flex pt-2 pb-1 px-2">
              <div class="align-self-center ml-3 body-2">{{ $t("Common.絞り込み") }}</div>
              <v-spacer />
              <v-btn class="mr-3 align-self-center" small text @click.stop="resetFilterCondition()">
                {{ $t("Common.リセット") }}
              </v-btn>
              <v-btn icon @click="closeFilterDialog()">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <v-divider class="mx-2" />
            <div class="filter-dialog-body pr-1">
              <div class="d-flex">
                <div class="caption">{{ $t("Database.基本条件") }}</div>
                <div class="header-divider" />
              </div>
              <div class="px-3 pt-2 d-flex justify-space-between align-center">
                <div class="keyword-input">
                  <v-text-field dense v-model.trim="searchWord" hide-details clearable prepend-inner-icon="mdi-magnify" :label="$t('Database.名称検索')" />
                </div>
                <v-checkbox dense v-model="onlyStock" hide-details :label="$t('Database.未着任艦非表示')" :disabled="onlyNoStock" />
                <v-checkbox dense v-model="onlyNoStock" hide-details :label="$t('Database.未着任艦のみ')" :disabled="onlyStock" />
                <v-checkbox dense v-model="onlyBookmarked" hide-details :label="$t('Fleet.お気に入り')" />
                <manual-checkbox :ok="onlyReleaseExSlot" :ng="withoutReleaseExSlot" :toggle="toggleExSlotFilter">{{ $t("Fleet.補強増設") }}</manual-checkbox>
              </div>
              <div class="d-flex mt-6">
                <div class="caption">{{ $t("Fleet.改造状態") }}</div>
                <div class="header-divider" />
              </div>
              <div class="filter-input-container">
                <v-checkbox
                  v-model="includeInitial"
                  dense
                  hide-details
                  :label="$t('Fleet.未改造')"
                  :error="!includeInitial && !includeIntermediate && !includeFinal"
                />
                <v-checkbox
                  v-model="includeIntermediate"
                  dense
                  hide-details
                  :label="$t('Fleet.中間改造')"
                  :error="!includeInitial && !includeIntermediate && !includeFinal"
                />
                <v-checkbox
                  v-model="includeFinal"
                  dense
                  hide-details
                  :label="$t('Fleet.最終改造')"
                  :error="!includeInitial && !includeIntermediate && !includeFinal"
                />
              </div>
              <div class="d-flex mt-6">
                <div class="caption">{{ $t("Fleet.ステータス") }}</div>
                <div class="header-divider" />
              </div>
              <div>
                <v-range-slider class="mt-4 px-3" v-model="levelRange" dense thumb-label min="1" :max="maxLevel" hide-details>
                  <template v-slot:prepend>
                    <v-text-field
                      :label="$t('Database.Lv下限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      :max="levelRange[1]"
                      min="1"
                      v-model="levelRange[0]"
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
                      :min="levelRange[0]"
                      v-model="levelRange[1]"
                      hide-details
                    />
                  </template>
                </v-range-slider>
                <v-range-slider class="mt-4 px-3" v-model="luckRange" dense thumb-label min="1" max="200" hide-details>
                  <template v-slot:prepend>
                    <v-text-field
                      :label="$t('Database.運下限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      :max="luckRange[1]"
                      min="1"
                      v-model="luckRange[0]"
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
                      :min="luckRange[0]"
                      v-model="luckRange[1]"
                      hide-details
                    />
                  </template>
                </v-range-slider>
                <v-range-slider class="mt-4 px-3" v-model="aswRange" dense thumb-label min="0" max="150" hide-details>
                  <template v-slot:prepend>
                    <v-text-field
                      :label="$t('Database.対潜下限')"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      type="number"
                      :max="aswRange[1]"
                      min="0"
                      v-model="aswRange[0]"
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
                      :min="aswRange[0]"
                      v-model="aswRange[1]"
                      hide-details
                    />
                  </template>
                </v-range-slider>
                <v-range-slider class="mt-4 px-3" v-model="luckImpRange" dense thumb-label min="0" max="100" hide-details>
                  <template v-slot:prepend>
                    <v-text-field
                      :label="$t('Database.運改修下限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      :max="luckImpRange[1]"
                      min="0"
                      v-model="luckImpRange[0]"
                      hide-details
                    />
                  </template>
                  <template v-slot:append>
                    <v-text-field
                      :label="$t('Database.運改修上限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      max="100"
                      :min="luckImpRange[0]"
                      v-model="luckImpRange[1]"
                      hide-details
                    />
                  </template>
                </v-range-slider>
                <v-range-slider class="mt-4 px-3" v-model="aswImpRange" dense thumb-label min="0" max="9" hide-details>
                  <template v-slot:prepend>
                    <v-text-field
                      :label="$t('Database.対潜改修下限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      :max="aswImpRange[1]"
                      min="0"
                      v-model="aswImpRange[0]"
                      hide-details
                    />
                  </template>
                  <template v-slot:append>
                    <v-text-field
                      :label="$t('Database.対潜改修上限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      max="9"
                      :min="aswImpRange[0]"
                      v-model="aswImpRange[1]"
                      hide-details
                    />
                  </template>
                </v-range-slider>
              </div>
              <div class="d-flex mt-6">
                <div class="caption">{{ $t("Common.耐久") }}</div>
                <div class="header-divider" />
              </div>
              <div class="filter-input-container">
                <v-checkbox v-model="HPIs4n1" dense hide-details label="4n - 1" :error="!HPIs4n1 && !HPIs4n2 && !HPIs4n3 && !HPIs4n" />
                <v-checkbox v-model="HPIs4n2" dense hide-details label="4n - 2" :error="!HPIs4n1 && !HPIs4n2 && !HPIs4n3 && !HPIs4n" />
                <v-checkbox v-model="HPIs4n3" dense hide-details label="4n - 3" :error="!HPIs4n1 && !HPIs4n2 && !HPIs4n3 && !HPIs4n" />
                <v-checkbox v-model="HPIs4n" dense hide-details label="4n" :error="!HPIs4n1 && !HPIs4n2 && !HPIs4n3 && !HPIs4n" />
              </div>
              <div class="filter-input-container">
                <v-checkbox dense v-model="addHP0" hide-details :label="`${$t('Database.耐久改修2')} +0`" :error="!addHP0 && !addHP1 && !addHP2" />
                <v-checkbox dense v-model="addHP1" hide-details :label="`${$t('Database.耐久改修2')} +1`" :error="!addHP0 && !addHP1 && !addHP2" />
                <v-checkbox dense v-model="addHP2" hide-details :label="`${$t('Database.耐久改修2')} +2`" :error="!addHP0 && !addHP1 && !addHP2" />
              </div>
              <div class="d-flex mt-4">
                <div class="caption">{{ $t("Common.速力") }}</div>
                <div class="header-divider" />
              </div>
              <div class="filter-input-container">
                <v-checkbox v-model="includeFast" dense hide-details :label="$t('Fleet.高速')" :error="!includeFast && !includeSlow" />
                <v-checkbox v-model="includeSlow" dense hide-details :label="$t('Fleet.低速')" :error="!includeFast && !includeSlow" />
              </div>
              <div class="d-flex mt-4">
                <div class="caption">{{ $t("Fleet.装備搭載可否") }}</div>
                <div class="header-divider" />
              </div>
              <div class="filter-input-container">
                <manual-checkbox mode="img" :ok="isDaihatsu" :ng="isNotDaihatsu" :toggle="toggleDaihatsuFilter" imgPath="./img/type/type24.png" />
                <manual-checkbox mode="img" :ok="isKamisha" :ng="isNotKamisha" :toggle="toggleTankFilter" imgPath="./img/type/type46.png" />
              </div>
              <div class="d-flex mt-4 align-center">
                <div class="caption">{{ $t("Database.艦種") }}</div>
                <div class="header-divider" />
                <div class="pr-1 pl-3">
                  <v-btn small @click="toggleAllType()" outlined color="primary">
                    <v-icon small class="mr-1">mdi-check-all</v-icon> {{ $t("Database.一括チェック") }}
                  </v-btn>
                </div>
              </div>
              <div class="filter-input-container">
                <v-checkbox v-for="(item, i) in types" :key="`item${i}`" dense v-model="item.isChecked" :label="$t(`SType.${item.text}`)" hide-details />
              </div>
              <div class="d-flex mt-4 align-center">
                <div class="caption">{{ $t("Database.国籍") }}</div>
                <div class="header-divider" />
                <div class="pr-1 pl-3">
                  <v-btn small @click="toggleAllNationality()" outlined color="primary">
                    <v-icon small class="mr-1">mdi-check-all</v-icon> {{ $t("Database.一括チェック") }}
                  </v-btn>
                </div>
              </div>
              <div class="filter-input-container">
                <v-checkbox
                  v-for="(item, i) in nationalities"
                  :key="`item${i}`"
                  dense
                  v-model="item.isChecked"
                  :label="$t(`Database.${item.text}`)"
                  hide-details
                />
              </div>
              <div class="d-flex mt-4 align-center">
                <div class="caption">{{ $t("Database.お札") }}</div>
                <div class="header-divider" />
                <div class="pr-1 pl-3">
                  <v-btn small @click="toggleAllArea()" outlined color="primary">
                    <v-icon small class="mr-1">mdi-check-all</v-icon> {{ $t("Database.一括チェック") }}
                  </v-btn>
                </div>
              </div>
              <div class="d-flex flex-wrap align-center pa-3">
                <div
                  v-for="i in maxAreas"
                  :key="`area${i}`"
                  class="selected-area-btn align-self-center"
                  :class="{ selected: selectedArea.includes(i) }"
                  @click="clickedArea(i)"
                  @keypress="clickedArea(i)"
                >
                  <v-img :src="`./img/tags/area${i}.webp`" height="68" width="50" />
                </div>
                <div
                  class="selected-area-btn no-area align-self-center"
                  :class="{ selected: visibleNoArea }"
                  @click="clickedArea(-1)"
                  @keypress="clickedArea(-1)"
                >
                  {{ $t("Database.札なし") }}
                </div>
              </div>
            </div>
          </v-card>
        </v-dialog>
        <div>
          <v-card v-if="!viewShips.length" class="text-center my-10 py-10">
            <div>{{ $t("Common.探したけど見つからなかったよ") }}&#128546;</div>
          </v-card>
          <div class="d-flex align-center mt-3" v-else>
            <v-pagination v-if="modeTable" v-model="page" :length="pageLength" />
            <v-spacer />
            <div v-if="modeTable" class="manual-column-select">
              <v-select
                outlined
                dense
                :label="$t('Database.任意表示列')"
                hide-details
                v-model="manualValue"
                :items="manualValues"
                item-value="value"
                :item-text="(item) => $t('Common.' + item.text)"
                @input="filter()"
                prepend-inner-icon="mdi-eye"
                :background-color="$vuetify.theme.dark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)'"
              />
            </div>
          </div>
          <v-card class="ship-table mt-3 pa-2" v-if="modeTable && viewShips.length">
            <v-divider />
            <v-data-table
              fixed-header
              height="72vh"
              multi-sort
              :page.sync="page"
              :headers="headers"
              :items="viewShips"
              hide-default-footer
              :footer-props="{
                showFirstLastPage: true,
                'items-per-page-options': [100],
              }"
            >
              <template v-slot:[`header.name`]></template>
              <template v-slot:[`header.hp`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:[`header.luck`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:[`header.impLuck`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:[`header.asw`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:[`header.impAsw`]="{ header }">{{ $t(`Database.${header.text}`) }}</template>
              <template v-slot:[`header.manualValue`]>{{ manualColumnText }}</template>
              <template v-slot:[`header.accuracy`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:[`header.avoid`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:[`header.ci`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
              <template v-slot:item="{ item }">
                <tr
                  v-ripple
                  :class="{
                    no_ship: item.count === 0,
                    lvMax: item.stockData.level === maxLevel,
                    lv100: item.stockData.level !== maxLevel && item.stockData.level > 99,
                    lv99: item.stockData.level === 99,
                  }"
                  @click.stop="showEditDialog(item)"
                  @keypress.enter="showEditDialog(item)"
                >
                  <td class="px-0">
                    <div class="d-none d-md-flex align-center">
                      <div class="edit-stock-img" @mouseenter="bootTooltip(item, $event)" @mouseleave="clearTooltip" @focus="clearTooltip" @blur="clearTooltip">
                        <div class="ship-table-img-container" :class="{ no_ship: item.count === 0, 'avoid-spoiler': isAvoidSpoiler }">
                          <img :src="`./img/ship/${item.ship.id}.png`" :alt="`ship-${item.ship.id}`" height="40" width="160" />
                        </div>
                        <div class="area-banner mt-1" v-if="item.stockData.area > 0 && item.stockData.area <= maxAreas">
                          <v-img :src="`./img/tags/area${item.stockData.area}.webp`" height="52" width="38" />
                        </div>
                        <div class="slot-ex-img" v-if="item.stockData.releaseExpand">
                          <v-img :src="`./img/util/slot_ex.png`" height="30" width="30" />
                        </div>
                        <div class="sp-item-img" v-if="item.stockData.spEffectItems && item.stockData.spEffectItems.length">
                          <v-img v-if="item.stockData.spEffectItems.some((v) => v.kind === 1)" :src="`./img/util/miiro.png`" height="40" width="16" />
                          <v-img v-else :src="`./img/util/tasuki.png`" height="40" width="16" />
                        </div>
                      </div>
                      <div class="ship-name text-truncate" :title="item.ship.name">{{ getShipName(item.ship) }}</div>
                    </div>
                    <div class="d-flex d-md-none align-center">
                      <div class="edit-stock-img">
                        <div class="ship-table-img-container dense" :class="{ no_ship: item.count === 0, 'avoid-spoiler': isAvoidSpoiler }">
                          <img :src="`./img/ship/${item.ship.id}.png`" :alt="`ship-${item.ship.id}`" height="30" width="120" />
                        </div>
                        <div class="area-banner min" v-if="item.stockData.area > 0 && item.stockData.area <= maxAreas">
                          <v-img :src="`./img/tags/area${item.stockData.area}.webp`" height="44" width="32" />
                        </div>
                        <div class="slot-ex-img min" v-if="item.stockData.releaseExpand">
                          <v-img :src="`./img/util/slot_ex.png`" height="25" width="25" />
                        </div>
                        <div class="sp-item-img min" v-if="item.stockData.spEffectItems && item.stockData.spEffectItems.length">
                          <v-img v-if="item.stockData.spEffectItems.some((v) => v.kind === 1)" :src="`./img/util/miiro_min.png`" height="30" width="18" />
                          <v-img v-else :src="`./img/util/tasuki_min.png`" height="30" width="18" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-right">{{ item.level ? item.level : "-" }}</td>
                  <td class="text-right">
                    <div class="td-relative">
                      <div>{{ item.hp }}</div>
                      <div v-if="item.impHP" class="improve-value"><v-icon small color="teal lighten-1">mdi-chevron-double-up</v-icon>{{ item.impHP }}</div>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="td-relative">
                      <div>{{ item.luck }}</div>
                      <div v-if="item.impLuck" class="improve-value"><v-icon small color="teal lighten-1">mdi-chevron-double-up</v-icon>{{ item.impLuck }}</div>
                    </div>
                  </td>
                  <td class="text-right">
                    <span v-if="item.count" :class="{ 'text--secondary': !item.impLuck }">{{ item.impLuck }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="text-right">
                    <div class="td-relative">
                      <div>{{ item.asw }}</div>
                      <div v-if="item.impAsw" class="improve-value"><v-icon small color="teal lighten-1">mdi-chevron-double-up</v-icon>{{ item.impAsw }}</div>
                    </div>
                  </td>
                  <td class="text-right">
                    <span>{{ item.manualValue }}</span>
                  </td>
                  <td class="text-right">
                    <span v-if="item.count">{{ item.accuracy }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="text-right">
                    <span v-if="item.count">{{ item.avoid }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="text-right">
                    <span v-if="item.count">{{ item.ci }}</span>
                    <span v-else>-</span>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
          <div v-else-if="viewShips.length" class="mt-3">
            <div class="d-flex flex-wrap">
              <div v-for="(typeData, x) in altViewShips" :key="`type_row${x}`" class="type-container">
                <div class="mx-2 mt-1">{{ getShipTypeName(typeData.typeName) }}</div>
                <div class="type-divider"></div>
                <div class="d-flex flex-wrap">
                  <div v-for="(outer, y) in typeData.rows" :key="`outer_row_${y}`" class="ship-card ma-1 px-2 pt-1">
                    <div v-for="(row, i) in outer" :key="`row_${i}`" class="mt-1 mb-2">
                      <div class="d-flex">
                        <div class="body-2">{{ getShipName(row.master) }}</div>
                        <v-spacer />
                        <div v-if="row.count" class="caption align-self-end">{{ $t("Database.在籍") }} {{ row.count }}</div>
                      </div>
                      <div class="status-img" :class="{ no_ship: row.count === 0, 'avoid-spoiler': isAvoidSpoiler }">
                        <img class="status-img" :src="`./img/ship/${row.master.id}.png`" :alt="`ship-${row.master.id}`" />
                      </div>
                      <div
                        v-for="(data, j) in row.detail"
                        :key="`detail_${j}`"
                        class="detail-row ship-tr"
                        v-ripple
                        :class="{
                          no_ship: data.count === 0,
                          lvMax: data.stockData.level === maxLevel,
                          lv100: data.stockData.level !== maxLevel && data.stockData.level > 99,
                          lv99: data.stockData.level === 99,
                        }"
                        @click.stop="showEditDialog(data)"
                        @keypress.enter="showEditDialog(data)"
                        @mouseenter="bootTooltip(data, $event)"
                        @mouseleave="clearTooltip"
                        @focus="clearTooltip"
                        @blur="clearTooltip"
                      >
                        <template v-if="data.count">
                          <div class="status-col sm">
                            <div>{{ data.level }}</div>
                          </div>
                          <div class="status-col">
                            <img class="align-self-center" :src="`./img/util/status_hp.png`" height="16" alt="hp" />
                            <div class="align-self-center" :class="{ bold: data.impHP }">{{ data.hp }}</div>
                          </div>
                          <div class="status-col">
                            <img class="align-self-center" :src="`./img/util/status_asw.png`" height="16" alt="asw" />
                            <div class="align-self-center" :class="{ bold: data.impAsw }">{{ data.asw }}</div>
                          </div>
                          <div class="status-col">
                            <img class="align-self-center" :src="`./img/util/status_luck.png`" height="16" alt="luck" />
                            <div class="align-self-center" :class="{ bold: data.impLuck }">{{ data.luck }}</div>
                          </div>
                          <div class="status-area-img" :class="{ 'exist-img': data.stockData.area > 0 }">
                            <img
                              v-if="data.stockData.area > 0"
                              class="status-area-img"
                              :src="`./img/tags/area${data.stockData.area}_min.webp`"
                              :alt="`area-${data.stockData.area}`"
                            />
                          </div>
                          <div class="status-ex-img">
                            <img
                              v-if="data.stockData.releaseExpand"
                              class="status-ex-img"
                              :src="`./img/util/slot_ex.png`"
                              height="24"
                              width="24"
                              alt="ex-slot"
                            />
                          </div>
                          <div
                            class="status-item-img"
                            :class="{ min: data.stockData.area <= 0 }"
                            v-if="data.stockData.spEffectItems && data.stockData.spEffectItems.length"
                          >
                            <template v-if="data.stockData.area > 0">
                              <v-img v-if="data.stockData.spEffectItems.some((v) => v.kind === 1)" :src="`./img/util/miiro.png`" height="40" width="16" />
                              <v-img v-else :src="`./img/util/tasuki.png`" height="40" width="16" />
                            </template>
                            <template v-else>
                              <v-img v-if="data.stockData.spEffectItems.some((v) => v.kind === 1)" :src="`./img/util/miiro_min.png`" height="24" width="14" />
                              <v-img v-else :src="`./img/util/tasuki_min.png`" height="24" width="14" />
                            </template>
                          </div>
                        </template>
                        <template v-else>
                          <div class="mx-auto text-center no_ship caption py-1">{{ $t("Database.新規登録") }}</div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2" v-if="modeTable && viewShips.length">
            <v-pagination v-model="page" :length="pageLength" />
          </div>
        </div>
      </v-tab-item>
      <v-tab-item value="analytics">
        <analytics />
      </v-tab-item>
      <v-tab-item value="status_up">
        <status-up-line-list />
      </v-tab-item>
      <v-tab-item value="compare">
        <compare />
      </v-tab-item>
      <v-tab-item value="group">
        <area-manager :readonly="readOnly" />
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="600">
      <v-card class="pa-3" v-if="editRow && versionButtons.length">
        <div class="mx-2 mt-2">
          <div class="d-flex">
            <div class="align-self-center edit-stock-img">
              <v-img :src="`./img/ship/${versionButtons[version].id}.png`" height="40" width="160" />
              <div class="area-banner" v-if="editRow.stockData.area > 0 && editRow.stockData.area <= maxAreas">
                <v-img :src="`./img/tags/area${editRow.stockData.area}.webp`" height="58" width="42" />
              </div>
            </div>
            <div class="align-self-center ml-2">
              <v-btn-toggle dense v-model="version" mandatory class="flex-wrap">
                <v-btn v-for="(ship, i) in versionButtons" :key="`ver${i}`" :value="i" @click.stop="changeVersion(i)">
                  <span>{{ getShipName(ship) }}</span>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <v-divider class="mt-3" />
          <div class="d-flex mt-3">
            <div class="range-input">
              <v-text-field :label="$t('Database.練度(Lv)')" type="number" :max="maxLevel" min="1" v-model="editRow.stockData.level" hide-details />
            </div>
            <v-slider class="ml-5 mr-3 align-self-center" hide-details :max="maxLevel" min="1" v-model="editRow.stockData.level" thumb-label></v-slider>
            <v-btn color="teal" dark class="mr-1 align-self-center" @click.stop="editRow.stockData.level = 99">Lv99</v-btn>
            <v-btn color="red lighten-2" dark class="mr-1 align-self-center" @click.stop="editRow.stockData.level = maxLevel">Lv{{ maxLevel }}</v-btn>
          </div>
          <div class="d-flex mt-8">
            <div class="range-input">
              <v-text-field
                :label="$t('Common.運')"
                type="number"
                :max="versionButtons[version].maxLuck"
                :min="versionButtons[version].luck"
                v-model="editLuck"
                hide-details
              />
            </div>
            <v-slider
              class="ml-5 align-self-center"
              hide-details
              :max="versionButtons[version].maxLuck"
              :min="versionButtons[version].luck"
              v-model="editLuck"
              thumb-label
            ></v-slider>
          </div>
          <div class="d-flex mt-8">
            <div class="range-input">
              <v-text-field :label="$t('Database.耐久改修')" type="number" max="2" min="0" v-model="editRow.stockData.improvement.hp" hide-details />
            </div>
            <v-slider class="ml-5 align-self-center" hide-details max="2" min="0" v-model="editRow.stockData.improvement.hp" thumb-label></v-slider>
          </div>
          <div class="d-flex mt-8">
            <div class="range-input">
              <v-text-field :label="$t('Database.対潜改修')" type="number" max="9" min="0" v-model="editRow.stockData.improvement.asw" hide-details />
            </div>
            <v-slider class="ml-5 align-self-center" hide-details max="9" min="0" v-model="editRow.stockData.improvement.asw" thumb-label></v-slider>
          </div>
          <div class="mt-8">
            <v-checkbox v-model="editRow.stockData.releaseExpand" :label="$t('Database.補強増設開放済')" hide-details />
            <v-radio-group v-model="editRow.spEffectItemId" row>
              <v-radio label="なし" :value="0" />
              <v-radio label="海色リボン" :value="1" />
              <v-radio label="白たすき" :value="2" />
            </v-radio-group>
          </div>
          <div class="d-flex justify-space-around">
            <div
              v-for="i in maxAreas"
              :key="`area${i}`"
              class="selected-area-btn"
              :class="{ selected: editRow.stockData.area === i }"
              @click.stop="toggleArea(i)"
              @keypress="toggleArea(i)"
            >
              <v-img :src="`./img/tags/area${i}.webp`" height="68" width="50" />
            </div>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex">
            <v-btn v-if="isFav" color="pink lighten-2" icon @click="toggleFav(editRow.ship.id)">
              <v-icon>mdi-heart</v-icon>
            </v-btn>
            <v-btn v-else color="grey" icon @click="toggleFav(editRow.ship.id)">
              <v-icon>mdi-heart</v-icon>
            </v-btn>
            <div class="align-self-center ml-3" v-if="versionButtons[version]">
              <a :href="`https://wikiwiki.jp/kancolle/${encodeURI(versionButtons[version].name)}`">wiki</a>
            </div>
            <v-btn class="ml-auto" :disabled="btnPushed || readOnly" color="primary" @click.stop="commitStock">
              {{ $t("Database.着任") }}
            </v-btn>
            <v-btn class="ml-4" :disabled="btnPushed || !editRow.stockData.uniqueId || readOnly" color="success" @click.stop="updateStock">
              {{ $t("Common.更新") }}
            </v-btn>
            <v-btn class="ml-4" :disabled="!editRow.stockData.uniqueId || readOnly" color="error" @click.stop="confirmDialog = true">
              {{ $t("Database.除籍") }}
            </v-btn>
            <v-btn class="ml-4" color="secondary" @click.stop="editDialog = false">{{ $t("Common.戻る") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDialog" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>{{ $t("Database.本当に除籍しますか？") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="error" :disabled="btnPushed" dark @click.stop="deleteStock">{{ $t("Database.除籍") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Database.やっぱやめとく") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <ship-tooltip :value="tooltipShip" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.filter-dialog-body {
  padding-top: 20px;
  padding-left: 20px;
  overflow-y: auto;
  height: 70vh;
  overscroll-behavior: contain;
}
.keyword-input {
  width: 180px;
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

.no-area {
  font-size: 0.8em;
  border: 3px solid rgba(128, 128, 128, 0.6);
  -ms-writing-mode: tb-rl;
  writing-mode: vertical-rl;
  padding: 0.5rem 0.15rem;
  border-radius: 0.25rem;
  margin-left: 1rem;
  transform: rotate(15deg);
  text-align: center;
}

.ship-card .ship-tr {
  display: flex;
  cursor: pointer;
  transition: 0.2s;
  border-bottom: 1px solid rgba(128, 128, 128, 0.8);
}
.ship-card .ship-tr.lvMax {
  color: #000;
  background-color: rgba(131, 220, 255, 0.753);
}
.ship-card .ship-tr.lv100 {
  color: #000;
  background-color: rgba(255, 163, 163, 0.753);
}
.ship-card .ship-tr.lv99 {
  color: #000;
  background-color: rgba(131, 255, 131, 0.753);
}
.ship-card .ship-tr:hover {
  color: #000;
  background-color: rgba(255, 242, 128, 0.753);
}

.ship-table tr {
  cursor: pointer;
}
.ship-table tr.lvMax {
  background-color: rgba(131, 220, 255, 0.3) !important;
}
.ship-table tr.lv100 {
  background-color: rgba(255, 131, 131, 0.3) !important;
}
.ship-table tr.lv99 {
  background-color: rgba(131, 255, 131, 0.3) !important;
}
.ship-table tr.lvMax:hover {
  background-color: rgba(131, 220, 255, 0.5) !important;
}
.ship-table tr.lv100:hover {
  background-color: rgba(255, 131, 131, 0.5) !important;
}
.ship-table tr.lv99:hover {
  background-color: rgba(131, 255, 131, 0.5) !important;
}
.theme--dark .ship-table tr.lvMax {
  background-color: rgba(131, 220, 255, 0.2) !important;
}
.theme--dark .ship-table tr.lv100 {
  background-color: rgba(255, 131, 131, 0.2) !important;
}
.theme--dark .ship-table tr.lv99 {
  background-color: rgba(131, 255, 131, 0.2) !important;
}
.theme--dark .ship-table tr.lvMax:hover {
  background-color: rgba(131, 220, 255, 0.25) !important;
}
.theme--dark .ship-table tr.lv100:hover {
  background-color: rgba(255, 131, 131, 0.25) !important;
}
.theme--dark .ship-table tr.lv99:hover {
  background-color: rgba(131, 255, 131, 0.25) !important;
}
.ship-table tr.no_ship {
  opacity: 0.7;
  background-color: rgba(80, 80, 80, 0.2) !important;
}
.ship-table tr.no_ship:hover {
  opacity: 0.7;
  background-color: rgba(80, 80, 80, 0.25) !important;
}
.theme--dark .ship-table tr.no_ship {
  background-color: rgba(0, 0, 0, 1) !important;
}
.theme--dark .ship-table tr.no_ship:hover {
  background-color: rgb(15, 15, 15) !important;
}
.ship-table tr .ship-name {
  font-size: 0.9em;
  margin-left: 0.25rem;
  max-width: 8vw;
}
.ship-table tr .td-relative {
  position: relative;
}
.ship-table tr .improve-value {
  position: absolute;
  font-size: 0.95em;
  left: calc(100% - 8px);
  top: -14px;
  color: rgb(31, 190, 167);
  font-weight: bold;
  text-align: left;
  white-space: nowrap;
}

.status-col .bold {
  font-weight: 600;
}
.status-img.no_ship img {
  filter: grayscale(60%);
}
.status-img.no_ship.avoid-spoiler {
  border-bottom: 1px solid rgba(128, 128, 128, 0.8);
}

.ship-table-img-container {
  height: 40px;
  width: 160px;
}
.ship-table-img-container.dense {
  height: 30px;
  width: 120px;
}
.ship-table-img-container.no_ship.avoid-spoiler img,
.status-img.no_ship.avoid-spoiler img {
  transform: scaleY(0.75);
  filter: blur(9px) grayscale(80%);
}

.edit-stock-img {
  position: relative;
}
.area-banner {
  position: absolute;
  top: -8px;
  left: 28px;
}
.area-banner.min {
  top: -6px;
  left: 20px;
}
.edit-stock-img .slot-ex-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 30px;
  height: 30px;
}
.edit-stock-img .slot-ex-img.min {
  width: 25px;
  height: 25px;
}

.edit-stock-img .sp-item-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  height: 40px;
  width: 16px;
}
.edit-stock-img .sp-item-img.min {
  width: 18px;
  height: 30px;
}

.selected-area-btn {
  opacity: 0.4;
  cursor: pointer;
  transition: 0.3s;
}
.selected-area-btn:hover {
  opacity: 0.6;
}
.selected-area-btn.selected {
  opacity: 1;
}

.type-container {
  margin-bottom: 1rem;
  margin-right: 1rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  background-color: #fff;
}
.theme--dark .type-container {
  background-color: rgba(128, 128, 128, 0.1);
}
.type-divider {
  width: 100%;
  height: 1px;
  background-color: #64b4ff;
  margin-bottom: 0.25rem;
}
.ship-card {
  border-radius: 0.25rem;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
}
.theme--dark .ship-card {
  background-color: rgba(128, 128, 128, 0.2);
}

.detail-row {
  justify-content: space-between;
  position: relative;
}
.detail-row > div {
  align-self: center;
}
.status-img {
  height: 60px;
  width: 240px;
}
.status-col {
  display: flex;
  width: 48px;
  overflow: hidden;
  font-size: 14px;
}
.status-col.sm {
  text-align: right;
  width: 28px;
  margin-right: 4px;
}
.status-col.sm > div {
  width: 100%;
}
.status-area-img {
  align-self: flex-end;
  width: 37px;
}
.status-area-img.exist-img {
  height: 40px;
}
.status-area-img img {
  position: absolute;
  right: 22px;
  width: 37px;
  height: 40px;
}
.status-ex-img {
  width: 24px;
  height: 24px;
}
.status-item-img {
  position: absolute;
  right: 54px;
  top: 0px;
  height: 40px;
  width: 16px;
}
.status-item-img.min {
  right: 38px;
  height: 24px;
  width: 14px;
}

.manual-column-select {
  width: 180px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import min from 'lodash/min';
import groupBy from 'lodash/groupBy';
import cloneDeep from 'lodash/cloneDeep';
import Analytics from '@/components/database/Analytics.vue';
import Compare from '@/components/database/Compare.vue';
import AreaManager from '@/components/database/AreaManager.vue';
import StatusUpLineList from '@/components/database/StatusUpLineList.vue';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStock from '@/classes/fleet/shipStock';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';
import Convert from '@/classes/convert';
import ItemMaster from '@/classes/item/itemMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import ManualCheckbox from '@/components/common/ManualCheckbox.vue';

interface ShipRowData {
  count: number;
  ship: ShipMaster;
  stockData: ShipStock;
  level: number;
  /** 表示値HP */
  hp: number;
  impHP: number;
  /** 表示値運 */
  luck: number;
  impLuck: number;
  /** 表示値対潜 */
  asw: number;
  impAsw: number;
  accuracy: number;
  avoid: number;
  ci: number;
  manualValue: number;
  spEffectItemId: number;
}

interface AltShipRowData {
  master: ShipMaster;
  count: number;
  detail: ShipRowData[];
}

export default Vue.extend({
  name: 'ShipsComponent',
  components: {
    Analytics,
    Compare,
    ShipTooltip,
    AreaManager,
    StatusUpLineList,
    ManualCheckbox,
  },
  data: () => ({
    all: [] as ShipMaster[],
    filteredShips: [] as ShipMaster[],
    viewShips: [] as ShipRowData[],
    shipStock: [] as ShipStock[],
    page: 1,
    isAvoidSpoiler: true,
    filterDialog: false,
    searchWord: '' as string | undefined,
    onlyStock: false,
    onlyNoStock: false,
    onlyReleaseExSlot: false,
    withoutReleaseExSlot: false,
    includeInitial: true,
    includeIntermediate: true,
    includeFinal: true,
    isDaihatsu: false,
    isNotDaihatsu: false,
    isKamisha: false,
    isNotKamisha: false,
    onlyBookmarked: false,
    levelRange: [1, Const.MAX_LEVEL],
    luckRange: [1, 200],
    luckImpRange: [0, 100],
    aswRange: [0, 150],
    aswImpRange: [0, 9],
    okDaihatsu: [] as number[],
    okKamisha: [] as number[],
    addHP0: true,
    addHP1: true,
    addHP2: true,
    HPIs4n1: true,
    HPIs4n2: true,
    HPIs4n3: true,
    HPIs4n: true,
    includeFast: true,
    includeSlow: true,
    types: [] as { text: string; value: number; isChecked: boolean }[],
    nationalities: [
      {
        text: '日本',
        value: 0,
        filter: [],
        isChecked: true,
      },
      {
        text: 'アメリカ',
        value: 1,
        filter: Const.USA,
        isChecked: true,
      },
      {
        text: 'イタリア',
        value: 2,
        filter: Const.ITA,
        isChecked: true,
      },
      {
        text: 'イギリス',
        value: 3,
        filter: Const.GBR,
        isChecked: true,
      },
      {
        text: 'ドイツ',
        value: 4,
        filter: Const.DEU,
        isChecked: true,
      },
      {
        text: 'フランス',
        value: 5,
        filter: Const.FRA,
        isChecked: true,
      },
      {
        text: 'ソ連',
        value: 6,
        filter: Const.RUS,
        isChecked: true,
      },
      {
        text: 'その他',
        value: 7,
        filter: Const.AUS.concat(Const.SWE).concat(Const.NLD),
        isChecked: true,
      },
    ],
    editDialog: false,
    editRow: {} as ShipRowData,
    versionButtons: [] as ShipMaster[],
    version: 0,
    editLuck: 0,
    maxAreas: 0,
    confirmDialog: false,
    unsubscribe: undefined as unknown,
    btnPushed: false,
    allCount: 0,
    modeTable: true,
    selectedArea: [] as number[],
    visibleNoArea: true,
    readOnly: false,
    tab: 'list',
    headers: [
      {
        text: '艦娘名',
        value: 'name',
        sortable: false,
      },
      {
        text: 'Lv',
        align: 'end',
        value: 'level',
      },
      {
        text: '耐久',
        align: 'end',
        value: 'hp',
      },
      {
        text: '運',
        align: 'end',
        value: 'luck',
      },
      {
        text: '運改修',
        align: 'end',
        value: 'impLuck',
      },
      {
        text: '対潜',
        align: 'end',
        value: 'asw',
      },
      {
        text: '任意',
        align: 'end',
        value: 'manualValue',
      },
      {
        text: '命中項',
        align: 'end',
        value: 'accuracy',
      },
      {
        text: '回避項',
        align: 'end',
        value: 'avoid',
      },
      {
        text: 'CI項',
        align: 'end',
        value: 'ci',
      },
    ],
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipShip: new Ship(),
    tooltipX: 0,
    tooltipY: 0,
    maxLevel: Const.MAX_LEVEL,
    manualValue: 'fire',
    manualValues: [
      { text: '火力', value: 'fire' },
      { text: '雷装', value: 'torpedo' },
      { text: '夜戦火力', value: 'nightBattleFirePower' },
      { text: '対空', value: 'antiAir' },
      { text: '装甲', value: 'armor' },
      { text: '索敵', value: 'scout' },
      { text: '回避', value: 'avoid' },
      { text: '燃料', value: 'fuel' },
      { text: '弾薬', value: 'ammo' },
      { text: '射程', value: 'range' },
    ],
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }
    this.initialize();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setShipStock') {
        // データ更新されたら読み込みなおし ダイアログも消す
        this.shipStock = state.shipStock as ShipStock[];
        this.masterFilter();
        this.editDialog = false;
      }
    });
  },
  watch: {
    completed(value) {
      if (value) {
        this.all = this.$store.state.ships as ShipMaster[];
        this.initialize();
      }
    },
    isTempStockMode(value) {
      this.readOnly = !!value;
      this.initialize();
    },
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
    pageLength(): number {
      return Math.ceil(this.viewShips.length / 100);
    },
    minLevel(): number {
      const selectedVersion = this.versionButtons[this.version];

      if (!selectedVersion || selectedVersion.beforeId <= 0 || selectedVersion.name === '山城改二') {
        return 1;
      }
      const before = this.all.find((v) => v.id === selectedVersion.beforeId);

      return before ? before.nextLv : 1;
    },
    altViewShips(): { typeName: string; rows: AltShipRowData[][] }[] {
      const rows = this.viewShips;

      if (!rows.length) {
        return [];
      }

      const viewShips: AltShipRowData[] = [];
      // 改装段階毎にグループ化
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];

        const viewShip = viewShips.find((v) => v.master.id === row.ship.id);
        if (viewShip) {
          viewShip.count += 1;
          viewShip.detail.push(row);
        } else {
          viewShips.push({ master: row.ship, count: row.count, detail: [row] });
        }
      }

      // 艦型に応じて分けたい => 金剛型, 扶桑型...のアレ
      const altTypes = Const.SHIP_TYPES_ALT_INFO;
      const resultShips = [];
      for (let i = 0; i < altTypes.length; i += 1) {
        const type = altTypes[i];
        // この○○型に該当する艦娘を取得
        const typeShips = viewShips.filter((v) => v.master.type2 === type.id);
        if (typeShips.length) {
          // 同じ未改造艦毎にグルーピング
          const array = groupBy(typeShips, (v) => v.master.originalId);
          const resultRows: AltShipRowData[][] = [];
          Object.keys(array).forEach((v) => {
            const sameOriginalShips = array[v];
            sameOriginalShips.sort((a, b) => b.master.version - a.master.version);
            resultRows.push(sameOriginalShips);
          });

          resultRows.sort((a, b) => {
            const aMin = min(a.map((v) => v.master.sort));
            const bMin = min(b.map((v) => v.master.sort));
            return (aMin || 0) - (bMin || 0);
          });
          // 存在する艦型を生成
          resultShips.push({ typeName: type.name, rows: resultRows });
        }
      }

      return resultShips;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    translatedShipTypes(): { text: string; value: number }[] {
      const array = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const data = this.types[i];
        array.push({ text: `${this.$t(`SType.${data.text}`)}`, value: data.value });
      }
      return array;
    },
    manualColumnText(): string {
      if (this.manualValue) {
        const key = this.manualValues.find((v) => v.value === this.manualValue);
        return key ? `${this.$t(`Common.${key.text}`)}` : '';
      }

      return '';
    },
    isFav(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.editRow && this.editRow.ship && setting.bookmarkedShipIds.includes(this.editRow.ship.id);
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    initialize() {
      // 全データ取得
      this.all = this.$store.state.ships as ShipMaster[];
      this.shipStock = this.$store.state.shipStock as ShipStock[];
      this.maxAreas = this.$store.state.areaCount as number;

      if (this.readOnly) {
        // 閲覧モード
        this.shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68) as ItemMaster;
      const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167) as ItemMaster;

      for (let i = 0; i < this.all.length; i += 1) {
        const ship = this.all[i];
        // 大発チェック
        if (ShipValidation.isValidItem(ship, daihatsu)) {
          this.okDaihatsu.push(ship.id);
        }
        // カミ車チェック
        if (ShipValidation.isValidItem(ship, tank)) {
          this.okKamisha.push(ship.id);
        }
      }

      // 艦種セレクト初期化
      const masters = Const.SHIP_TYPES_ALT;
      this.types = [];
      for (let i = 0; i < masters.length; i += 1) {
        this.types.push({ text: masters[i].text, value: i, isChecked: true });
      }

      if (this.completed) {
        const setting = this.$store.state.siteSetting as SiteSetting;
        this.isAvoidSpoiler = setting.isAvoidSpoiler;
        this.changeViewMode(setting.viewTableMode);
      }

      // 海域札セレクト初期化
      this.selectedArea = [];
      for (let i = 1; i <= this.maxAreas; i += 1) {
        this.selectedArea.push(i);
      }
      this.masterFilter();
    },
    toggleDaihatsuFilter() {
      if (this.isDaihatsu) {
        this.isDaihatsu = false;
        this.isNotDaihatsu = true;
      } else if (this.isNotDaihatsu) {
        this.isNotDaihatsu = false;
      } else {
        this.isDaihatsu = true;
      }
    },
    toggleTankFilter() {
      if (this.isKamisha) {
        this.isKamisha = false;
        this.isNotKamisha = true;
      } else if (this.isNotKamisha) {
        this.isNotKamisha = false;
      } else {
        this.isKamisha = true;
      }
    },
    toggleExSlotFilter() {
      if (this.onlyReleaseExSlot) {
        this.onlyReleaseExSlot = false;
        this.withoutReleaseExSlot = true;
      } else if (this.withoutReleaseExSlot) {
        this.withoutReleaseExSlot = false;
      } else {
        this.onlyReleaseExSlot = true;
      }
    },
    closeFilterDialog() {
      this.filterDialog = false;
      this.filter();
    },
    toggleFilterDialog() {
      if (!this.filterDialog) {
        // 検索かける
        this.filter();
      }
    },
    resetFilterCondition() {
      // 検索条件リセット
      this.searchWord = '';
      this.onlyStock = false;
      this.onlyNoStock = false;
      this.onlyBookmarked = false;
      this.onlyReleaseExSlot = false;
      this.withoutReleaseExSlot = false;
      this.isDaihatsu = false;
      this.isNotDaihatsu = false;
      this.isKamisha = false;
      this.isNotKamisha = false;
      this.includeInitial = true;
      this.includeIntermediate = true;
      this.includeFinal = true;
      this.luckRange = [1, 200];
      this.levelRange = [1, Const.MAX_LEVEL];
      this.luckImpRange = [0, 100];
      this.aswRange = [0, 150];
      this.aswImpRange = [0, 9];
      this.addHP0 = true;
      this.addHP1 = true;
      this.addHP2 = true;
      this.HPIs4n1 = true;
      this.HPIs4n2 = true;
      this.HPIs4n3 = true;
      this.HPIs4n = true;
      this.includeFast = true;
      this.includeSlow = true;

      for (let i = 0; i < this.types.length; i += 1) {
        this.types[i].isChecked = true;
      }
      for (let i = 0; i < this.nationalities.length; i += 1) {
        this.nationalities[i].isChecked = true;
      }

      this.selectedArea = [];
      for (let area = 1; area <= this.maxAreas; area += 1) {
        this.selectedArea.push(area);
      }
      this.visibleNoArea = true;

      this.filter();
    },
    filter() {
      const masters = this.filteredShips;
      const stock = this.shipStock;
      let rowData: ShipRowData[] = [];
      const keyword = this.searchWord ? this.searchWord.trim().toUpperCase() : '';
      // ひらがなをカタカナに変換
      const kana = keyword.replace(/[\u3041-\u3096]/g, (match) => {
        const chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
      });

      // 描画されるはずだった数
      let sumCount = 0;

      // ベースのループは未改造艦娘のみ
      const baseShips = masters.filter((v) => v.version === 0);

      const setting = this.$store.state.siteSetting as SiteSetting;
      const favorites = setting.bookmarkedShipIds;

      for (let i = 0; i < baseShips.length; i += 1) {
        const base = baseShips[i];
        // 改造先を含めて全て取得
        const versions = masters.filter((v) => v.originalId === base.id);

        // 在籍艦娘のなかから versions に含まれる艦娘を抽出
        const versionsIds = versions.map((v) => v.id);
        const stockList = stock.filter((v) => versionsIds.includes(v.id));

        const pushedData: ShipRowData[] = [];

        // 改造先含めて1隻でもいいからいるかどうか
        if (!stockList.length) {
          sumCount += 1;
          // キーワード検索で全状態で引っかからなかったらさようなら
          if (keyword && !versions.some((v) => v.name.toUpperCase().indexOf(keyword) >= 0 || v.yomi.indexOf(keyword) >= 0 || v.yomi.indexOf(kana) >= 0)) {
            continue;
          }
          // 未着任データを省く
          if (this.onlyStock) continue;
          // 未着任データをstockListに放り込む
          pushedData.push({
            count: 0,
            ship: base,
            stockData: new ShipStock(),
            hp: base.hp,
            luck: base.luck,
            impHP: 0,
            impLuck: 0,
            impAsw: 0,
            level: 0,
            asw: base.minAsw,
            accuracy: -1,
            avoid: -1,
            ci: -1,
            manualValue: 0,
            spEffectItemId: 0,
          });
        } else {
          // いるだけ回す
          for (let j = 0; j < stockList.length; j += 1) {
            const stockData = stockList[j];
            sumCount += 1;
            if (this.onlyNoStock) continue;
            // キーワード検索で全状態で引っかからなかったらさようなら
            if (keyword && !versions.some((v) => v.name.toUpperCase().indexOf(keyword) >= 0 || v.yomi.indexOf(keyword) >= 0 || v.yomi.indexOf(kana) >= 0)) {
              continue;
            }

            // 着任済みデータ
            const master = versions.find((v) => v.id === stockData.id) as ShipMaster;
            const hp = stockData.improvement.hp + (stockData.level > 99 ? master.hp2 : master.hp);
            const luck = stockData.improvement.luck + master.luck;
            const avoid = Ship.getStatusFromLevel(stockData.level, master.maxAvoid, master.minAvoid);

            let spEffectItemId = 0;
            if (stockData.spEffectItems && stockData.spEffectItems.length) {
              spEffectItemId = stockData.spEffectItems.some((v) => v.kind === 1) ? 1 : 2;
            }
            pushedData.push({
              count: 1,
              ship: master,
              stockData,
              level: stockData.level,
              hp,
              luck,
              impHP: stockData.improvement.hp,
              impLuck: stockData.improvement.luck,
              impAsw: stockData.improvement.asw,
              asw: Ship.getStatusFromLevel(stockData.level, master.maxAsw, master.minAsw) + stockData.improvement.asw,
              accuracy: Ship.getAccuracyValue(stockData.level, luck),
              avoid: Ship.getAvoidValue(avoid, luck),
              ci: Ship.getCIValue(stockData.level, luck),
              manualValue: 0,
              spEffectItemId,
            });
          }

          // ソート
          pushedData.sort((a, b) => {
            if (a.ship.version === b.ship.version) {
              return b.stockData.level - a.stockData.level;
            }
            return b.ship.version - a.ship.version;
          });
        }

        rowData = rowData.concat(pushedData);
      }

      const maxLevel = this.levelRange[1];
      const minLevel = this.levelRange[0];
      const maxLuck = this.luckRange[1];
      const minLuck = this.luckRange[0];
      const maxLuckImp = this.luckImpRange[1];
      const minLuckImp = this.luckImpRange[0];
      const maxAsw = this.aswRange[1];
      const minAsw = this.aswRange[0];
      const maxAswImp = this.aswImpRange[1];
      const minAswImp = this.aswImpRange[0];
      const buffHP: number[] = [];
      if (this.addHP0) buffHP.push(0);
      if (this.addHP1) buffHP.push(1);
      if (this.addHP2) buffHP.push(2);
      const selectedTypes = this.types.filter((v) => v.isChecked).map((v) => v.value);
      // 国籍フィルタ ブラックリスト形式で
      let forbiddenNationalities: number[] = [];
      // 選択されて『いない』国
      const notSelectedNationalFilters = this.nationalities.filter((v) => !v.isChecked).map((v) => v.filter);
      for (let index = 0; index < notSelectedNationalFilters.length; index += 1) {
        // 選択されて『いない』国のフィルタ(type2の配列)を連結していく
        forbiddenNationalities = forbiddenNationalities.concat(notSelectedNationalFilters[index]);
      }
      // 日本特別対応
      const withoutJapan = this.nationalities
        .filter((v) => !v.isChecked)
        .map((v) => v.value)
        .includes(0);

      const types = Const.SHIP_TYPES_ALT.filter((v, i) => selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();

      rowData = rowData.filter((row) => {
        const {
          stockData, ship, luck, hp, asw,
        } = row;
        // 初期改造状態で絞る
        if (!this.includeInitial && ship.version === 0) return false;
        // 中間改造状態で絞る
        if (!this.includeIntermediate && !(ship.version === 0 || ship.isFinal)) return false;
        // 最終改造状態で絞る
        if (!this.includeFinal && ship.isFinal) return false;
        // 練度で絞る
        if (stockData.level < minLevel || stockData.level > maxLevel) return false;
        // 対潜改修で絞る
        if (stockData.improvement.asw < minAswImp || stockData.improvement.asw > maxAswImp) return false;
        // 運改修で絞る
        if (stockData.improvement.luck < minLuckImp || stockData.improvement.luck > maxLuckImp) return false;
        // 耐久改修で絞る
        if (!buffHP.includes(stockData.improvement.hp)) return false;
        // 艦種で絞る
        if (!types.includes(ship.type)) return false;
        // 国籍で絞る
        if (forbiddenNationalities.includes(ship.type2) || (withoutJapan && Const.JPN.includes(ship.type2))) return false;
        // 運で絞る
        if (luck < minLuck || luck > maxLuck) return false;
        // 対潜で絞る
        if (asw < minAsw || asw > maxAsw) return false;
        // 耐久4nシリーズで絞る
        if (!this.HPIs4n && hp % 4 === 0) return false;
        if (!this.HPIs4n1 && hp % 4 === 3) return false;
        if (!this.HPIs4n2 && hp % 4 === 2) return false;
        if (!this.HPIs4n3 && hp % 4 === 1) return false;
        // 速力で絞る
        if (!this.includeFast && ship.speed >= 10) return false;
        if (!this.includeSlow && ship.speed < 10) return false;
        // 大発OKで絞る
        if (this.isDaihatsu && !this.okDaihatsu.includes(ship.id)) return false;
        if (this.isNotDaihatsu && this.okDaihatsu.includes(ship.id)) return false;
        // カミ車OKで絞る
        if (this.isKamisha && !this.okKamisha.includes(ship.id)) return false;
        if (this.isNotKamisha && this.okKamisha.includes(ship.id)) return false;
        // 補強増設開放で絞る
        if (this.onlyReleaseExSlot && !stockData.releaseExpand) return false;
        if (this.withoutReleaseExSlot && stockData.releaseExpand) return false;
        // 出撃海域で絞る
        if (!this.visibleNoArea && stockData.area < 1) return false;
        if (stockData.area && !this.selectedArea.includes(stockData.area)) return false;
        // お気に入りフィルタ
        if (this.onlyBookmarked && !favorites.includes(stockData.id)) return false;

        return true;
      });

      this.allCount = sumCount;

      if (this.manualValue) {
        const key = this.manualValue;
        for (let i = 0; i < rowData.length; i += 1) {
          const v = rowData[i];
          // ソート用のステータスに値を設定
          if (key === 'avoid') {
            v.manualValue = Ship.getStatusFromLevel(v.level, v.ship.maxAvoid, v.ship.minAvoid);
          } else if (key === 'scout') {
            v.manualValue = Ship.getStatusFromLevel(v.level, v.ship.maxScout, v.ship.minScout);
          } else if (key === 'nightBattleFirePower') {
            v.manualValue = v.ship.fire + v.ship.torpedo;
          } else if (key === 'fuel') {
            v.manualValue = v.level >= 100 ? Math.max(Math.floor(v.ship.fuel * 0.85), 1) : v.ship.fuel;
          } else if (key === 'ammo') {
            v.manualValue = v.level >= 100 ? Math.max(Math.floor(v.ship.ammo * 0.85), 1) : v.ship.ammo;
          } else {
            v.manualValue = (v.ship as unknown as { [key: string]: number })[key];
          }
        }
      }

      // ソート
      rowData.sort((a, b) => a.ship.sort - b.ship.sort);

      // ページ数チェック
      const maxPage = Math.ceil(rowData.length / 100);
      this.page = this.page > maxPage ? maxPage : this.page;
      this.page = this.page < 1 && maxPage > 0 ? 1 : this.page;

      this.viewShips = rowData;
    },
    masterFilter() {
      // マスターの条件でフィルタリング可能なものはここでフィルタリング
      this.filteredShips = this.all.filter((v) => v.id > 0);
      this.filter();
    },
    toggleAllType() {
      // いずれか1つでも未チェックがあれば全チェック => 全チェック状態だった場合のみチェックを解除ということ。
      const checked = this.types.some((v) => !v.isChecked);
      for (let i = 0; i < this.types.length; i += 1) {
        this.types[i].isChecked = checked;
      }
    },
    toggleAllNationality() {
      // いずれか1つでも未チェックがあれば全チェック => 全チェック状態だった場合のみチェックを解除ということ。
      const checked = this.nationalities.some((v) => !v.isChecked);
      for (let i = 0; i < this.nationalities.length; i += 1) {
        this.nationalities[i].isChecked = checked;
      }
    },
    clickedArea(i: number) {
      if (i === -1) {
        this.visibleNoArea = !this.visibleNoArea;
      } else if (this.selectedArea.includes(i)) {
        this.selectedArea = this.selectedArea.filter((v) => v !== i);
      } else {
        this.selectedArea.push(i);
      }
    },
    toggleAllArea() {
      // 選択札の全切り替え
      if (this.selectedArea.length === this.maxAreas && this.visibleNoArea) {
        // 全部ついてたら消す
        this.selectedArea = [];
        this.visibleNoArea = false;
      } else {
        // 全部ついてなかったらいったん全部付ける
        this.selectedArea = [];
        for (let area = 1; area <= this.maxAreas; area += 1) {
          this.selectedArea.push(area);
        }
        this.visibleNoArea = true;
      }
    },
    changeVersion(index: number) {
      this.version = index;
    },
    showEditDialog(rowData: ShipRowData) {
      this.editRow = cloneDeep(rowData);
      const versions = this.all.filter((v) => v.originalId === rowData.ship.originalId).sort((a, b) => a.version - b.version);
      this.version = versions.findIndex((v) => v.id === rowData.ship.id);
      this.versionButtons = versions;
      this.editLuck = rowData.luck;
      this.editDialog = true;
      this.btnPushed = false;
    },
    toggleArea(area: number) {
      this.editRow.stockData.area = this.editRow.stockData.area !== area ? area : 0;
    },
    getNewStock(): ShipStock {
      const { stockData } = this.editRow;

      // 運上昇値算出
      const master = this.versionButtons[this.version];
      stockData.id = master.id;
      stockData.improvement.luck = this.editLuck - master.luck;

      stockData.spEffectItems = [];
      if (this.editRow.spEffectItemId === 1) {
        // 海色リボン
        stockData.spEffectItems.push({ kind: 1, torpedo: 1, armor: 1 });
      } else if (this.editRow.spEffectItemId === 2) {
        // 白たすき
        stockData.spEffectItems.push({ kind: 2, fire: 2, avoid: 2 });
      }

      // 経験値算出
      const exp = Const.LEVEL_BORDERS.find((v) => v.lv === stockData.level);
      stockData.exp = exp ? exp.req : 0;

      return cloneDeep(stockData);
    },
    commitStock() {
      this.btnPushed = true;
      // 最新の艦娘在籍データ取得
      const stockAll = this.$store.state.shipStock.concat() as ShipStock[];
      // 新規追加
      let maxId = max(stockAll.map((v) => v.uniqueId));
      if (maxId === undefined) {
        maxId = 1;
      }

      const stockData = this.getNewStock();
      // 一意キー生成
      stockData.uniqueId = maxId + 1;

      stockAll.push(stockData);
      this.$store.dispatch('setNeedShipStockDiff', false);
      this.$store.dispatch('updateShipStock', stockAll);
      this.shipStock = stockAll;
    },
    updateStock() {
      this.btnPushed = true;
      // 最新の艦娘在籍データ取得
      const stockAll = this.$store.state.shipStock.concat() as ShipStock[];
      const stockData = this.getNewStock();

      const index = stockAll.findIndex((v) => v.uniqueId === stockData.uniqueId);
      if (index >= 0) {
        stockAll[index] = stockData;
        this.$store.dispatch('setNeedShipStockDiff', false);
        this.$store.dispatch('updateShipStock', stockAll);
        this.shipStock = stockAll;
      }
    },
    deleteStock() {
      // 削除をコミット
      this.btnPushed = true;
      this.confirmDialog = false;
      const id = this.editRow.stockData.uniqueId;
      const stockAll = this.$store.state.shipStock as ShipStock[];
      const deletedList = stockAll.filter((v) => v.uniqueId !== id);
      this.$store.dispatch('setNeedShipStockDiff', false);
      this.$store.dispatch('updateShipStock', deletedList);
      this.shipStock = deletedList;
    },
    changeAvoidSpoiler() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isAvoidSpoiler = this.isAvoidSpoiler;
      this.$store.dispatch('updateSetting', setting);
    },
    changeViewMode(modeTable: boolean) {
      this.modeTable = modeTable;
      // 設定書き換え
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.viewTableMode = modeTable;
      this.$store.dispatch('updateSetting', setting);
    },
    translate(v: string): string {
      return v ? `${this.$t(v)}` : '';
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const array = ShipMaster.getSuffix(ship);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }
      return ship.name ? ship.name : '';
    },
    getShipTypeName(name: string) {
      if (this.isNotJapanese) {
        const array = Convert.getShipTypeNameArray(name);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }

      return name;
    },
    toggleFav(id: number) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.bookmarkedShipIds.includes(id)) {
        setting.bookmarkedShipIds = setting.bookmarkedShipIds.filter((v) => v !== id);
      } else {
        setting.bookmarkedShipIds.push(id);
      }
      this.$store.dispatch('updateSetting', setting);
    },
    bootTooltip(ship: ShipRowData, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip || (!ship.count && this.isAvoidSpoiler)) {
        return;
      }
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;
        const toolTipShip = new Ship({
          master: ship.ship,
          level: ship.level,
          hp: ship.hp,
          luck: ship.luck,
          asw: ship.asw,
        });
        this.tooltipShip = toolTipShip;
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
