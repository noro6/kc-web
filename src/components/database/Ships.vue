<template>
  <div class="mt-3">
    <v-tabs v-model="tab">
      <v-tab href="#list">{{ $t("Database.一覧") }}</v-tab>
      <v-tab href="#group" v-if="shipStock.length">{{ $t("Database.札管理") }}</v-tab>
      <v-tab href="#analytics">{{ $t("Database.経験値") }}</v-tab>
      <v-tab href="#compare" v-if="readOnly">{{ $t("Database.比較") }}</v-tab>
    </v-tabs>
    <v-divider class="mb-2"></v-divider>
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item value="list">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header class="px-4">
              <div>
                <v-icon>mdi-filter</v-icon>{{ $t("Database.フィルタ") }}
                <span class="caption">({{ viewShips.length }}{{ isNotJapanese ? "" : "隻" }} / {{ allCount }}{{ isNotJapanese ? "" : "隻" }})</span>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <div class="d-flex flex-wrap my-2">
                <v-text-field
                  class="search-input"
                  :label="$t('Database.名称検索')"
                  dense
                  v-model.trim="searchWord"
                  @input="masterFilter"
                  clearable
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                ></v-text-field>
                <v-checkbox class="mx-2" dense v-model="onlyStock" @change="filter" :label="$t('Database.未着任艦非表示')"></v-checkbox>
                <v-checkbox class="mx-2" dense v-model="onlyNoStock" @change="filter" :label="$t('Database.未着任艦のみ')"></v-checkbox>
                <v-checkbox class="mx-2" dense v-model="is4n" @change="filter" :label="$t('Database.耐久値4n')"></v-checkbox>
                <v-checkbox class="mx-2" dense v-model="isDaihatsu" @change="filter" :label="$t('Fleet.大発搭載可')"></v-checkbox>
                <v-checkbox class="mx-2" dense v-model="isKamisha" @change="filter" :label="$t('Fleet.内火艇搭載可')"></v-checkbox>
                <v-checkbox class="mx-2" dense v-model="onlyReleaseExSlot" @change="filter" :label="$t('Database.補強増設開放済')"></v-checkbox>
              </div>
              <div class="my-5 range-inputs">
                <div class="d-flex py-5">
                  <div class="range-input">
                    <v-text-field
                      :label="$t('Database.Lv下限')"
                      type="number"
                      :max="levelRange[1]"
                      min="1"
                      dense
                      v-model.trim="levelRange[0]"
                      hide-details
                      @input="filter"
                    ></v-text-field>
                  </div>
                  <v-range-slider v-model="levelRange" dense thumb-label min="1" max="175" hide-details class="pt-2 align-center mx-2" @change="filter">
                  </v-range-slider>
                  <div class="range-input">
                    <v-text-field
                      :label="$t('Database.Lv上限')"
                      type="number"
                      max="200"
                      :min="levelRange[0]"
                      dense
                      v-model.trim="levelRange[1]"
                      hide-details
                      @input="filter"
                    ></v-text-field>
                  </div>
                </div>
                <div class="d-flex py-5">
                  <div class="range-input">
                    <v-text-field
                      :label="$t('Database.運下限')"
                      type="number"
                      :max="luckRange[1]"
                      min="1"
                      dense
                      v-model.trim="luckRange[0]"
                      hide-details
                      @input="filter"
                    ></v-text-field>
                  </div>
                  <v-range-slider v-model="luckRange" dense thumb-label min="1" max="200" hide-details class="pt-2 align-center mx-2" @change="filter">
                  </v-range-slider>
                  <div class="range-input">
                    <v-text-field
                      :label="$t('Database.運上限')"
                      type="number"
                      max="200"
                      :min="luckRange[0]"
                      dense
                      v-model.trim="luckRange[1]"
                      hide-details
                      @input="filter"
                    ></v-text-field>
                  </div>
                </div>
              </div>
              <div class="my-5 range-inputs">
                <v-select
                  class="mt-2 py-5"
                  v-model="addHP"
                  :items="hpItems"
                  dense
                  attach
                  chips
                  deletable-chips
                  hide-details
                  :label="$t('Database.耐久改修')"
                  multiple
                  @change="filter"
                />
                <div class="d-flex py-5">
                  <div class="range-input align-self-end">
                    <v-text-field
                      :label="$t('Database.対潜改修下限')"
                      type="number"
                      :max="aswRange[1]"
                      min="0"
                      dense
                      v-model.trim="aswRange[0]"
                      hide-details
                      @input="filter"
                    ></v-text-field>
                  </div>
                  <v-range-slider v-model="aswRange" dense thumb-label min="0" max="9" hide-details class="pt-2 align-center mx-2" @change="filter">
                  </v-range-slider>
                  <div class="range-input align-self-end">
                    <v-text-field
                      :label="$t('Database.対潜改修上限')"
                      type="number"
                      max="9"
                      :min="aswRange[0]"
                      dense
                      v-model.trim="aswRange[1]"
                      hide-details
                      @input="filter"
                    ></v-text-field>
                  </div>
                </div>
              </div>
              <v-select
                class="my-10"
                v-model="selectedTypes"
                :items="translatedShipTypes"
                hide-details
                dense
                attach
                chips
                deletable-chips
                :label="$t('Database.艦種')"
                multiple
                @change="masterFilter"
              >
                <template v-slot:prepend-item>
                  <v-list-item ripple @mousedown.prevent @click="toggleAllType">
                    <v-list-item-action>
                      <v-icon :color="selectedTypes.length > 0 ? 'blue' : ''">
                        {{ icon }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t("Database.全選択") }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>
              </v-select>
              <v-select
                class="my-10"
                v-model="selectedNationalities"
                :items="translatedNationalities"
                item-text="text"
                item-value="value"
                hide-details
                dense
                attach
                chips
                deletable-chips
                :label="$t('Database.国籍')"
                multiple
                @change="masterFilter"
              >
                <template v-slot:prepend-item>
                  <v-list-item ripple @mousedown.prevent @click="toggleAllNationality">
                    <v-list-item-action>
                      <v-icon :color="selectedNationalities.length > 0 ? 'blue' : ''">
                        {{ icon2 }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t("Database.全選択") }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>
              </v-select>
              <div class="d-flex">
                <div
                  v-for="i in maxAreas"
                  :key="`area${i}`"
                  class="selected-area-btn align-self-center"
                  :class="{ selected: selectedArea.includes(i) }"
                  @click="clickedArea(i)"
                >
                  <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/areas/area${i}.webp`" height="68" width="47"></v-img>
                </div>
                <div class="selected-area-btn no-area align-self-center" :class="{ selected: visibleNoArea }" @click="clickedArea(-1)">
                  {{ $t("Database.札なし") }}
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-card class="ship-list-body my-3 pa-4">
          <div v-if="!viewShips.length" class="text-center my-10">
            <div>{{ $t("Common.探したけど見つからなかったよ") }}</div>
          </div>
          <div v-else class="d-flex">
            <v-pagination v-if="modeTable && viewShips.length" v-model="page" :length="pageLength"></v-pagination>
            <v-btn-toggle dense v-model="modeTable" borderless mandatory class="ml-auto">
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
          <div class="ship-table" v-if="modeTable">
            <div v-if="viewShips.length" class="ship-tr header" :class="{ asc: !isDesc }">
              <v-spacer></v-spacer>
              <div class="status-td" @click.stop="toggleSortKey('level')" :class="{ sorted: sortKey === 'level' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                Lv
              </div>
              <div class="status-td" @click.stop="toggleSortKey('hp')" :class="{ sorted: sortKey === 'hp' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.耐久") }}
              </div>
              <div class="status-td" @click.stop="toggleSortKey('luck')" :class="{ sorted: sortKey === 'luck' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.運") }}
              </div>
              <div class="status-td" @click.stop="toggleSortKey('asw')" :class="{ sorted: sortKey === 'asw' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.対潜") }}
              </div>
              <div class="status-td" @click.stop="toggleSortKey('scout')" :class="{ sorted: sortKey === 'scout' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.索敵") }}
              </div>
              <div class="status-td" @click.stop="toggleSortKey('accuracy')" :class="{ sorted: sortKey === 'accuracy' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.命中項") }}
              </div>
              <div class="status-td" @click.stop="toggleSortKey('avoid')" :class="{ sorted: sortKey === 'avoid' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.回避項") }}
              </div>
              <div class="status-td" @click.stop="toggleSortKey('ci')" :class="{ sorted: sortKey === 'ci' }">
                <div><v-icon small>mdi-chevron-down</v-icon></div>
                {{ $t("Common.CI項") }}
              </div>
            </div>
            <div
              v-for="(rowData, i) in shipList"
              :key="`row_${i}`"
              class="ship-tr"
              v-ripple
              :class="{
                no_ship: rowData.count === 0,
                lv175: rowData.stockData.level === 175,
                lv100: rowData.stockData.level !== 175 && rowData.stockData.level > 99,
                lv99: rowData.stockData.level === 99,
              }"
              @click.stop="showEditDialog(rowData)"
              @mouseenter="bootTooltip(rowData, $event)"
              @mouseleave="clearTooltip"
            >
              <div class="edit-stock-img">
                <v-img :src="`./img/ship/${rowData.ship.id}.png`" height="50" width="200"></v-img>
                <div class="area-banner mt-1" v-if="rowData.stockData.area > 0 && rowData.stockData.area <= maxAreas">
                  <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/areas/area${rowData.stockData.area}.webp`" height="60" width="42"></v-img>
                </div>
                <div class="slot-ex-img" v-if="rowData.stockData.releaseExpand">
                  <v-img :src="`./img/util/slot_ex.png`" height="36" width="36"></v-img>
                </div>
              </div>
              <div class="ml-1 td-name text-truncate">{{ getShipName(rowData.ship) }}</div>
              <div class="status-td">{{ rowData.stockData.level }}</div>
              <div class="status-td td-relative" :class="{ bold: rowData.impHP }">
                {{ rowData.hp }}
                <div class="status-td-absolute" v-if="rowData.impHP">↑{{ rowData.impHP }}</div>
              </div>
              <div class="status-td td-relative" :class="{ bold: rowData.impLuck }">
                {{ rowData.luck }}
                <div class="status-td-absolute" v-if="rowData.impLuck">↑{{ rowData.impLuck }}</div>
              </div>
              <div class="status-td td-relative" v-if="rowData.count" :class="{ bold: rowData.impAsw }">
                {{ rowData.asw }}
                <div class="status-td-absolute" v-if="rowData.impAsw">↑{{ rowData.impAsw }}</div>
              </div>
              <div class="status-td" v-if="rowData.count">{{ rowData.scout }}</div>
              <div class="status-td" v-if="rowData.count">{{ rowData.accuracy }}</div>
              <div class="status-td" v-if="rowData.count">{{ rowData.avoid }}</div>
              <div class="status-td" v-if="rowData.count">{{ rowData.ci }}</div>
              <div v-else class="status-td no-status d-flex">
                <div class="line"></div>
                <div>{{ $t("Database.未着任") }}</div>
                <div class="line"></div>
              </div>
            </div>
            <div class="d-flex">
              <v-pagination v-if="viewShips.length" v-model="page" :length="pageLength" class="my-4" @input="scrollTop"></v-pagination>
              <v-spacer></v-spacer>
            </div>
          </div>
          <template v-else>
            <div class="d-flex flex-wrap">
              <div v-for="(typeData, x) in altViewShips" :key="`type_row${x}`" class="type-container">
                <div class="ma-2">{{ getShipTypeName(typeData.typeName) }}</div>
                <div class="type-divider"></div>
                <div class="d-flex flex-wrap">
                  <div v-for="(outer, y) in typeData.rows" :key="`outer_row_${y}`" class="ship-card ma-1 px-2 pt-2">
                    <div v-for="(row, i) in outer" :key="`row_${i}`" class="mt-1 mb-2">
                      <div class="d-flex">
                        <div>{{ getShipName(row.master) }}</div>
                        <v-spacer></v-spacer>
                        <div class="caption align-self-end">{{ $t("Database.在籍") }}: {{ row.count }}</div>
                      </div>
                      <div class="status-img" :class="{ no_ship: row.count === 0 }">
                        <img class="status-img" :src="`./img/ship/${row.master.id}.png`" />
                      </div>
                      <div
                        v-for="(data, j) in row.detail"
                        :key="`detail_${j}`"
                        class="detail-row ship-tr"
                        v-ripple
                        :class="{
                          no_ship: data.count === 0,
                          lv175: data.stockData.level === 175,
                          lv100: data.stockData.level !== 175 && data.stockData.level > 99,
                          lv99: data.stockData.level === 99,
                        }"
                        @click.stop="showEditDialog(data)"
                        @mouseenter="bootTooltip(data, $event)"
                        @mouseleave="clearTooltip"
                      >
                        <template v-if="data.count">
                          <div class="status-col sm">
                            <div>{{ data.level }}</div>
                          </div>
                          <div class="status-col">
                            <img class="align-self-center" :src="`./img/util/status_hp.png`" height="16" />
                            <div class="align-self-center" :class="{ bold: data.impHP }">{{ data.hp }}</div>
                          </div>
                          <div class="status-col">
                            <img class="align-self-center" :src="`./img/util/status_asw.png`" height="16" />
                            <div class="align-self-center" :class="{ bold: data.impAsw }">{{ data.asw }}</div>
                          </div>
                          <div class="status-col">
                            <img class="align-self-center" :src="`./img/util/status_luck.png`" height="16" />
                            <div class="align-self-center" :class="{ bold: data.impLuck }">{{ data.luck }}</div>
                          </div>
                          <div class="status-area-img" :class="{ 'exist-img': data.stockData.area > 0 }">
                            <img
                              v-if="data.stockData.area > 0"
                              class="status-area-img"
                              :src="`https://res.cloudinary.com/aircalc/kc-web/areas/area${data.stockData.area}_min.webp`"
                            />
                          </div>
                          <div class="status-ex-img">
                            <img v-if="data.stockData.releaseExpand" class="status-ex-img" :src="`./img/util/slot_ex.png`" height="24" width="24" />
                          </div>
                        </template>
                        <template v-else>
                          <div class="mx-auto text-center no_ship">{{ $t("Database.新規登録") }}</div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </v-card>
      </v-tab-item>
      <v-tab-item value="group">
        <area-manager :readonly="readOnly" />
      </v-tab-item>
      <v-tab-item value="analytics">
        <analytics />
      </v-tab-item>
      <v-tab-item value="compare">
        <compare />
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="600">
      <v-card class="pa-3" v-if="editRow && versionButtons.length">
        <div class="mx-2 mt-2">
          <div class="d-flex">
            <div class="align-self-center edit-stock-img">
              <v-img :src="`./img/ship/${versionButtons[version].id}.png`" height="50" width="200"></v-img>
              <div class="area-banner" v-if="editRow.stockData.area > 0 && editRow.stockData.area <= maxAreas">
                <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/areas/area${editRow.stockData.area}.webp`" height="68" width="47"></v-img>
              </div>
            </div>
            <div class="align-self-center ml-2">
              <v-btn-toggle dense v-model="version" borderless mandatory class="flex-wrap">
                <v-btn v-for="(ship, i) in versionButtons" :key="`ver${i}`" :value="i" @click.stop="changeVersion(i)">
                  <span class="hidden-sm-and-down">{{ getShipName(ship) }}</span>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <v-divider class="mt-3"></v-divider>
          <div class="d-flex mt-3">
            <div class="range-input">
              <v-text-field :label="$t('Database.練度(Lv)')" type="number" max="175" min="1" v-model="editRow.stockData.level" hide-details></v-text-field>
            </div>
            <v-slider class="mx-5 align-self-center" hide-details max="175" min="1" v-model="editRow.stockData.level" thumb-label></v-slider>
            <v-btn color="teal" dark class="mr-1 align-self-center" @click.stop="editRow.stockData.level = 99">LV99</v-btn>
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
              ></v-text-field>
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
              <v-text-field
                :label="$t('Database.耐久改修')"
                type="number"
                max="2"
                min="0"
                v-model="editRow.stockData.improvement.hp"
                hide-details
              ></v-text-field>
            </div>
            <v-slider class="ml-5 align-self-center" hide-details max="2" min="0" v-model="editRow.stockData.improvement.hp" thumb-label></v-slider>
          </div>
          <div class="d-flex mt-8">
            <div class="range-input">
              <v-text-field
                :label="$t('Database.対潜改修')"
                type="number"
                max="9"
                min="0"
                v-model="editRow.stockData.improvement.asw"
                hide-details
              ></v-text-field>
            </div>
            <v-slider class="ml-5 align-self-center" hide-details max="9" min="0" v-model="editRow.stockData.improvement.asw" thumb-label></v-slider>
          </div>
          <div class="mt-8">
            <v-checkbox v-model="editRow.stockData.releaseExpand" :label="$t('Database.補強増設開放済')"></v-checkbox>
          </div>
          <div class="d-flex justify-space-around">
            <div
              v-for="i in maxAreas"
              :key="`area${i}`"
              class="selected-area-btn"
              :class="{ selected: editRow.stockData.area === i }"
              @click.stop="toggleArea(i)"
            >
              <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/areas/area${i}.webp`" height="68" width="47"></v-img>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="d-flex">
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
        <v-divider class="my-2"></v-divider>
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
.v-expansion-panels {
  z-index: 2;
}
.search-input {
  width: 130px;
}
.range-input {
  width: 80px;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 800px) {
  .range-inputs {
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
  }
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

.ship-tr {
  display: flex;
  cursor: pointer;
  transition: 0.2s;
  border-bottom: 1px solid rgba(128, 128, 128, 0.8);
}
.ship-table .ship-tr {
  padding: 0.1rem 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.ship-table .ship-tr > div {
  align-self: center;
}
.ship-table .ship-tr .td-name {
  width: calc(28% - 200px);
  flex-grow: 1;
  font-size: 0.95em;
}

.ship-table .ship-tr .status-td {
  text-align: right;
  width: 9%;
  padding-right: 0.5rem;
  font-size: 0.85em;
}
.ship-table .ship-tr .status-td.no-status {
  text-align: center;
  width: 45%;
}
.ship-table .ship-tr .status-td.no-status .line {
  flex-grow: 1;
  background-color: rgba(128, 128, 128, 0.4);
  height: 2px;
  margin: 0 1rem;
  align-self: center;
}

/** 上昇値 */
.ship-table .ship-tr .status-td.td-relative {
  position: relative;
}
.status-col .bold,
.ship-table .ship-tr .status-td.td-relative.bold {
  font-weight: 600;
}
.ship-table .ship-tr .status-td-absolute {
  position: absolute;
  right: -10px;
  top: -12px;
  color: rgb(31, 190, 167);
  font-weight: 600;
}

.ship-table .ship-tr.header {
  position: -webkit-sticky;
  position: sticky;
  top: 76px;
  padding: 0;
  z-index: 1;
  background-color: rgba(128, 128, 128, 0.2);
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}
.ship-table .ship-tr.header .status-td {
  padding: 0.75rem 0.5rem 0.75rem 0;
  user-select: none;
  display: flex;
  justify-content: flex-end;
}
.ship-table .ship-tr.header .status-td:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.ship-table .ship-tr.header .status-td .v-icon {
  opacity: 0;
}
.ship-table .ship-tr.header .status-td.sorted .v-icon {
  opacity: 1;
}
.ship-table .ship-tr.header.asc .status-td .v-icon {
  transform: rotate(180deg);
}

.ship-card .ship-tr.lv175 {
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

.ship-table .ship-tr.lv175 {
  background-color: rgba(131, 220, 255, 0.3);
}
.ship-table .ship-tr.lv100 {
  background-color: rgba(255, 131, 131, 0.3);
}
.ship-table .ship-tr.lv99 {
  background-color: rgba(131, 255, 131, 0.3);
}
.ship-table .ship-tr:not(.header):hover {
  background-color: rgba(128, 128, 128, 0.05);
}
.ship-table .ship-tr.lv175:hover {
  background-color: rgba(131, 220, 255, 0.5);
}
.ship-table .ship-tr.lv100:hover {
  background-color: rgba(255, 131, 131, 0.5);
}
.ship-table .ship-tr.lv99:hover {
  background-color: rgba(131, 255, 131, 0.5);
}
.theme--dark .ship-table .ship-tr.lv175 {
  background-color: rgba(131, 220, 255, 0.2);
}
.theme--dark .ship-table .ship-tr.lv100 {
  background-color: rgba(255, 131, 131, 0.2);
}
.theme--dark .ship-table .ship-tr.lv99 {
  background-color: rgba(131, 255, 131, 0.2);
}
.theme--dark .ship-table .ship-tr.lv175:hover {
  background-color: rgba(131, 220, 255, 0.25);
}
.theme--dark .ship-table .ship-tr.lv100:hover {
  background-color: rgba(255, 131, 131, 0.25);
}
.theme--dark .ship-table .ship-tr.lv99:hover {
  background-color: rgba(131, 255, 131, 0.25);
}
.ship-table .ship-tr.no_ship {
  opacity: 0.7;
  background-color: rgba(80, 80, 80, 0.2);
}
.ship-table .ship-tr.no_ship:hover {
  opacity: 0.7;
  background-color: rgba(80, 80, 80, 0.25);
}
.theme--dark .ship-table .ship-tr.no_ship {
  background-color: rgba(0, 0, 0, 1);
}
.theme--dark .ship-table .ship-tr.no_ship:hover {
  background-color: rgb(15, 15, 15);
}
.ship-tr.no_ship img,
.status-img.no_ship img {
  filter: grayscale(60%);
}

.edit-stock-img {
  position: relative;
}
.area-banner {
  position: absolute;
  top: -8px;
  left: 38px;
}
.edit-stock-img .slot-ex-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 36px;
  height: 36px;
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
  margin: 0.5rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
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
  width: 35px;
}
.status-area-img.exist-img {
  height: 40px;
}
.status-area-img img {
  width: 35px;
  height: 40px;
}
.status-ex-img {
  width: 24px;
  height: 24px;
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
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStock from '@/classes/fleet/shipStock';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';
import { MasterEquipmentShip } from '@/classes/interfaces/master';
import Convert from '@/classes/convert';

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
  scout: number;
  accuracy: number;
  avoid: number;
  ci: number;
}

interface AltShipRowData {
  master: ShipMaster;
  count: number;
  detail: ShipRowData[];
}

export default Vue.extend({
  name: 'Ships',
  components: {
    Analytics,
    Compare,
    ShipTooltip,
    AreaManager,
  },
  data: () => ({
    all: [] as ShipMaster[],
    filteredShips: [] as ShipMaster[],
    viewShips: [] as ShipRowData[],
    shipStock: [] as ShipStock[],
    page: 1,
    searchWord: '' as string | undefined,
    onlyStock: false,
    onlyNoStock: false,
    onlyReleaseExSlot: false,
    is4n: false,
    isDaihatsu: false,
    isKamisha: false,
    luckRange: [1, 200],
    levelRange: [1, 175],
    aswRange: [0, 9],
    okDaihatsu: [] as number[],
    okKamisha: [] as number[],
    hpItems: [] as { text: string; value: number }[],
    addHP: [] as number[],
    aswItems: [] as { text: string; value: number }[],
    addASW: [] as { text: string; value: number }[],
    types: [] as { text: string; value: number }[],
    selectedTypes: [] as number[],
    nationalities: [
      { text: '日本', value: 0, filter: [] },
      { text: 'アメリカ', value: 1, filter: Const.USA },
      { text: 'イタリア', value: 2, filter: Const.ITA },
      { text: 'イギリス', value: 3, filter: Const.GBR },
      { text: 'ドイツ', value: 4, filter: Const.DEU },
      { text: 'フランス', value: 5, filter: Const.FRA },
      { text: 'ソ連', value: 6, filter: Const.RUS },
      { text: 'その他', value: 7, filter: Const.AUS.concat(Const.SWE).concat(Const.NLD) },
    ],
    selectedNationalities: [0, 1, 2, 3, 4, 5, 6, 7] as number[],
    editDialog: false,
    editRow: {} as ShipRowData,
    versionButtons: [] as ShipMaster[],
    version: 0,
    editLuck: 0,
    sortKey: '',
    isDesc: false,
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
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipShip: new Ship(),
    tooltipX: 0,
    tooltipY: 0,
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
    selectedAllType(): boolean {
      return this.selectedTypes.length === this.types.length;
    },
    selectedSomeType(): boolean {
      return this.selectedTypes.length > 0 && !this.selectedAllType;
    },
    selectedAllNationality(): boolean {
      return this.selectedNationalities.length === this.nationalities.length;
    },
    selectedSomeNationality(): boolean {
      return this.selectedNationalities.length > 0 && !this.selectedAllNationality;
    },
    icon(): string {
      if (this.selectedAllType) return 'mdi-close-box';
      if (this.selectedSomeType) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    icon2(): string {
      if (this.selectedAllNationality) return 'mdi-close-box';
      if (this.selectedSomeNationality) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    shipList(): ShipRowData[] {
      const start = (this.page - 1) * 100;
      return this.viewShips.slice(start, start + 100);
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
    translatedShipTypes(): { text: string }[] {
      const array = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const data = this.types[i];
        array.push({ text: `${this.$t(`SType.${data.text}`)}`, value: data.value });
      }
      return array;
    },
    translatedNationalities(): { text: string; value: number; filter: number[] }[] {
      const array = [];
      for (let i = 0; i < this.nationalities.length; i += 1) {
        const data = this.nationalities[i];
        array.push({ text: `${this.$t(`Database.${data.text}`)}`, value: data.value, filter: data.filter });
      }
      return array;
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

      // 登録データがあるなら未着任艦を非表示にしておく => ネタバレ対策 (制空ツールでネタバレとは…)
      if (this.shipStock.length) {
        this.onlyStock = true;
      }

      for (let i = 0; i < this.all.length; i += 1) {
        const { id, type } = this.all[i];
        const link = this.$store.state.equipShips as MasterEquipmentShip[];
        const itemLink = link.find((v) => v.api_ship_id === id);
        const baseItemLink = Const.SHIP_TYPES_INFO.find((v) => v.id === type);
        // 大発チェック
        if (itemLink && itemLink.api_equip_type.includes(24)) {
          this.okDaihatsu.push(id);
        } else if (baseItemLink && baseItemLink.itemType.includes(24)) {
          this.okDaihatsu.push(id);
        }

        // カミ車チェック
        if (itemLink && itemLink.api_equip_type.includes(46)) {
          this.okKamisha.push(id);
        } else if (baseItemLink && baseItemLink.itemType.includes(46)) {
          this.okKamisha.push(id);
        }
      }

      // 艦種セレクト初期化
      const masters = Const.SHIP_TYPES_ALT;
      this.types = [];
      this.selectedTypes = [];
      for (let i = 0; i < masters.length; i += 1) {
        this.types.push({ text: masters[i].text, value: i });
        this.selectedTypes.push(i);
      }

      // 耐久改修セレクト初期化
      this.addHP = [];
      for (let i = 0; i <= 2; i += 1) {
        this.hpItems.push({ text: `+${i}`, value: i });
        this.addHP.push(i);
      }

      if (this.completed) {
        const setting = this.$store.state.siteSetting as SiteSetting;
        this.changeViewMode(setting.viewTableMode);
      }

      // 海域札セレクト初期化
      this.selectedArea = [];
      for (let i = 0; i <= this.maxAreas; i += 1) {
        this.selectedArea.push(i);
      }
      this.masterFilter();
    },
    filter() {
      const masters = this.filteredShips;
      const stock = this.shipStock;
      let rowData: ShipRowData[] = [];
      const maxLevel = this.levelRange[1];
      const minLevel = this.levelRange[0];
      const maxLuck = this.luckRange[1];
      const minLuck = this.luckRange[0];
      const maxAsw = this.aswRange[1];
      const minAsw = this.aswRange[0];
      const buffHP = this.addHP;
      const keyword = this.searchWord ? this.searchWord.trim().toUpperCase() : '';

      const typeIndexes = this.selectedTypes;

      // 国籍フィルタ ブラックリスト形式で
      let forbiddenNationalities: number[] = [];
      const notSelectedNationalFilters = this.nationalities.filter((v) => !this.selectedNationalities.includes(v.value)).map((v) => v.filter);
      for (let index = 0; index < notSelectedNationalFilters.length; index += 1) {
        forbiddenNationalities = forbiddenNationalities.concat(notSelectedNationalFilters[index]);
      }
      // 日本特別対応
      const withoutJapan = !this.selectedNationalities.includes(0);

      const types = Const.SHIP_TYPES_ALT.filter((v, i) => typeIndexes.includes(i))
        .map((v) => v.types)
        .flat();

      // 描画されるはずだった数
      let sumCount = 0;

      // ベースのループは未改造艦娘のみ
      const baseShips = masters.filter((v) => v.version === 0);

      for (let i = 0; i < baseShips.length; i += 1) {
        const base = baseShips[i];
        // 改造先を含めて全て取得
        const versions = masters.filter((v) => v.originalId === base.id);

        // キーワード検索で全状態で引っかからなかったらさようなら
        if (keyword && !versions.some((v) => v.name.toUpperCase().indexOf(keyword) >= 0)) {
          continue;
        }

        // 国籍で絞る
        if (forbiddenNationalities.includes(base.type2) || (withoutJapan && Const.isJPN(base.type2))) continue;

        // 在籍艦娘のなかから versions に含まれる艦娘を抽出
        const versionsIds = versions.map((v) => v.id);
        const stockList = stock.filter((v) => versionsIds.includes(v.id));

        const pushedData = [];

        // 改造先含めて1隻でもいいからいるかどうか
        if (!stockList.length) {
          sumCount += 1;
          // 艦種で絞る
          if (!types.includes(base.type)) continue;
          // 未着任艦非表示なら処理を飛ばす
          if (this.onlyStock) continue;
          // 耐久4nで絞る
          if (this.is4n && base.hp % 4 > 0) continue;
          // 大発OKで絞る
          if (this.isDaihatsu && !this.okDaihatsu.includes(base.id)) continue;
          // カミ車OKで絞る
          if (this.isKamisha && !this.okKamisha.includes(base.id)) continue;
          // 補強増設開放で絞る
          if (this.onlyReleaseExSlot) continue;
          // 出撃海域で絞る
          if (!this.visibleNoArea) continue;
          // なんらかの下限フィルタがあってはダメ
          if (minAsw || !buffHP.includes(0)) continue;
          // 未着任データ
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
            asw: -1,
            scout: -1,
            accuracy: -1,
            avoid: -1,
            ci: -1,
          });
        } else if (!this.onlyNoStock) {
          // いるだけ回す
          for (let j = 0; j < stockList.length; j += 1) {
            const stockData = stockList[j];
            sumCount += 1;
            // 練度で絞る
            if (stockData.level < minLevel || stockData.level > maxLevel) continue;
            // 対潜改修で絞る
            if (stockData.improvement.asw < minAsw || stockData.improvement.asw > maxAsw) continue;
            // 耐久改修で絞る
            if (!buffHP.includes(stockData.improvement.hp)) continue;

            // 着任済みデータ
            const master = versions.find((v) => v.id === stockData.id) as ShipMaster;
            const hp = stockData.improvement.hp + (stockData.level > 99 ? master.hp2 : master.hp);
            const luck = stockData.improvement.luck + master.luck;

            // 艦種で絞る
            if (!types.includes(master.type)) continue;
            // 運で絞る
            if (luck < minLuck || luck > maxLuck) continue;
            // 耐久4nで絞る
            if (this.is4n && hp % 4 > 0) continue;
            // 大発OKで絞る
            if (this.isDaihatsu && !this.okDaihatsu.includes(master.id)) continue;
            // カミ車OKで絞る
            if (this.isKamisha && !this.okKamisha.includes(master.id)) continue;
            // 補強増設開放で絞る
            if (this.onlyReleaseExSlot && !stockData.releaseExpand) continue;
            // 出撃海域で絞る
            if (!this.visibleNoArea && stockData.area < 1) continue;
            if (this.selectedArea.length && !this.selectedArea.includes(stockData.area)) continue;

            const avoid = Ship.getStatusFromLevel(stockData.level, master.maxAvoid, master.minAvoid);
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
              scout: Ship.getStatusFromLevel(stockData.level, master.maxScout, master.minScout),
              accuracy: Ship.getAccuracyValue(stockData.level, luck),
              avoid: Ship.getAvoidValue(avoid, luck),
              ci: Ship.getCIValue(stockData.level, luck),
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

      this.allCount = sumCount;

      // ソート
      this.sortRowData(rowData);

      // ページ数チェック
      const maxPage = Math.ceil(rowData.length / 100);
      this.page = this.page > maxPage ? maxPage : this.page;
      this.page = this.page < 1 && maxPage > 0 ? 1 : this.page;

      this.viewShips = rowData;
    },
    masterFilter() {
      // マスターの条件でフィルタリング可能なものはここでフィルタリング
      // なくなっちゃった！
      this.filteredShips = this.all.filter((v) => v.id > 0);
      this.filter();
    },
    toggleAllType() {
      this.$nextTick(() => {
        if (this.selectedAllType) {
          this.selectedTypes = [];
        } else {
          this.selectedTypes = this.types.map((v) => v.value).slice();
        }

        this.masterFilter();
      });
    },
    toggleAllNationality() {
      this.$nextTick(() => {
        if (this.selectedAllNationality) {
          this.selectedNationalities = [];
        } else {
          this.selectedNationalities = this.nationalities.map((v) => v.value).slice();
        }

        this.masterFilter();
      });
    },
    clickedArea(i: number) {
      if (i === -1) {
        this.visibleNoArea = !this.visibleNoArea;
      } else if (this.selectedArea.includes(i)) {
        this.selectedArea = this.selectedArea.filter((v) => v !== i);
      } else {
        this.selectedArea.push(i);
      }

      this.filter();
    },
    scrollTop() {
      const page = document.getElementsByClassName('v-pagination')[0] as HTMLUListElement;
      window.scrollTo(0, page.getBoundingClientRect().y + window.pageYOffset - 80);
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

      // 経験値算出
      const exp = Const.LEVEL_BORDERS.find((v) => v.lv === stockData.level);
      stockData.exp = exp ? exp.req : 0;

      return cloneDeep(stockData);
    },
    commitStock() {
      this.btnPushed = true;
      // 最新の艦娘在籍データ取得
      const stockAll = this.$store.state.shipStock as ShipStock[];
      // 新規追加
      let maxId = max(stockAll.map((v) => v.uniqueId));
      if (maxId === undefined) {
        maxId = 1;
      }

      const stockData = this.getNewStock();
      // 一意キー生成
      stockData.uniqueId = maxId + 1;

      stockAll.push(stockData);
      this.$store.dispatch('updateShipStock', stockAll);
      this.shipStock = stockAll;
    },
    updateStock() {
      this.btnPushed = true;
      // 最新の艦娘在籍データ取得
      const stockAll = this.$store.state.shipStock as ShipStock[];
      const stockData = this.getNewStock();

      const index = stockAll.findIndex((v) => v.uniqueId === stockData.uniqueId);
      if (index >= 0) {
        stockAll[index] = stockData;
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
      this.$store.dispatch('updateShipStock', deletedList);
      this.shipStock = deletedList;
    },
    toggleSortKey(key: string) {
      if (this.sortKey !== key) {
        // 初回 降順
        this.isDesc = true;
        this.sortKey = key;
      } else if (this.sortKey === key && this.isDesc) {
        // 2回目 昇順
        this.isDesc = false;
      } else if (this.sortKey === key && !this.isDesc) {
        // 3回目 ソート解除
        this.sortKey = '';
      }
      this.sortRowData(this.viewShips);
    },
    sortRowData(rowData: ShipRowData[]) {
      const { isDesc } = this;
      const key = this.sortKey;
      if (this.sortKey) {
        (rowData as unknown as { [key: string]: number }[]).sort(
          (a: { [key: string]: number }, b: { [key: string]: number }) => (isDesc ? -1 : 1) * (a[key] - b[key]),
        );
      } else {
        rowData.sort((a, b) => {
          if (a.ship.originalId !== b.ship.originalId) {
            return a.ship.sort - b.ship.sort;
          }
          return b.ship.version - a.ship.version;
        });
      }
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
    bootTooltip(ship: ShipRowData, e: MouseEvent) {
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
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
