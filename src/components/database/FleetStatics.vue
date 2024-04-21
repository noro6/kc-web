<template>
  <div class="mt-3 result-all-container">
    <div v-if="!analyzeResult.ships || !analyzeResult.ships.length" class="mb-2">
      <v-btn @click="fetchAnalyticsResult()" :loading="loading" color="primary">{{ $t("Database.集計の結果を閲覧する") }}</v-btn>
    </div>
    <v-dialog v-model="errorDialog" width="400">
      <v-card class="pa-3">
        <div class="mx-2 my-4 text-body-2">
          <div>{{ $t("Database.集計データが取得できませんでした。") }}</div>
          <div class="mt-2">{{ $t("Database.一度、サイトの再読み込みをしてみてください。それでも取得できない場合は集計中かも。") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="secondary" @click.stop="errorDialog = false">{{ $t("Common.閉じる") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <div class="mb-2" v-if="!isTempStockMode && shipStock && shipStock.length && !isSubmitted">
      <v-btn @click="confirmDialog = true" color="success">{{ $t("Database.自分のデータを送信する") }}</v-btn>
    </div>
    <v-alert v-if="isSubmitted" type="success" outlined dense>
      {{ $t("Database.送信しました") }}
    </v-alert>
    <v-dialog v-model="confirmDialog" width="660">
      <v-card class="pa-3">
        <div class="ma-4 text-body-2">
          <div class="my-2">{{ $t("Database.あなたの艦隊、装備データを統計データの集計対象として送信します。") }}</div>
          <div class="my-2">{{ $t("Database.集計は一日一回実行されます。データを送信した後すぐに反映はされませんのでご注意ください。") }}</div>
        </div>
        <v-alert v-if="hasManualData" type="error" outlined dense class="text-body-2">
          <div>手動でのデータ更新を行った艦隊データは集計対象外となりました。</div>
          <div>データ送信を行う場合は、この画面を閉じ、「反映」タブの手順で艦隊、装備データを更新してください。</div>
        </v-alert>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="success" :loading="loading" dark :disabled="hasManualData" @click="sendStockData">{{
            $t("Database.データ送信")
          }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Database.やっぱやめとく") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <template v-if="analyzeResult.ships && analyzeResult.ships.length">
      <v-btn-toggle class="mb-2" dense v-model="isShipMode" borderless mandatory>
        <v-btn :value="true" :class="{ 'blue darken-2 white--text': isShipMode }" @click.stop="setShipTables()" block>
          <span>{{ $t("Fleet.艦娘") }}</span>
        </v-btn>
        <v-btn :value="false" :class="{ 'green darken-2 white--text': !isShipMode }" @click.stop="setItemTables()" block>
          <span>{{ $t("Fleet.装備") }}</span>
        </v-btn>
      </v-btn-toggle>
      <!-- 結果表示欄 -->
      <v-expansion-panels focusable>
        <v-expansion-panel>
          <v-expansion-panel-header min-height="10" class="py-0">
            <div class="d-flex align-center">
              <v-icon>mdi-format-list-numbered</v-icon>
              <div class="ml-2">{{ $t("Database.全体統計データ") }}</div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div v-if="isShipMode" class="mt-3">
              <!-- 艦娘分析モード -->
              <div class="d-flex flex-wrap">
                <!-- カテゴリ選択欄 -->
                <button v-ripple="{ class: 'info--text' }" class="type-selector d-flex" :class="{ active: shipType === -1 }" @click="changeShipType(-1)">
                  <div class="type-all-text">ALL</div>
                </button>
                <button
                  v-for="(i, index) in shipTypes"
                  :key="index"
                  v-ripple="{ class: 'info--text' }"
                  class="type-selector"
                  :class="{ active: index === shipType }"
                  @click="changeShipType(index)"
                >
                  {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
                </button>
              </div>
              <div class="d-flex flex-wrap mb-1">
                <v-checkbox v-model="includeInitial" dense :label="$t('Fleet.未改造')" :error="errorRemodel" class="mr-3" @click="setShipTables()" />
                <v-checkbox v-model="includeIntermediate" dense :label="$t('Fleet.中間改造')" :error="errorRemodel" class="mr-3" @click="setShipTables()" />
                <v-checkbox v-model="includeFinal" dense :label="$t('Fleet.最終改造')" :error="errorRemodel" @click="setShipTables()" />
              </div>
            </div>
            <!-- 装備分析モード -->
            <div v-else class="mt-3">
              <div class="d-flex flex-wrap">
                <!-- カテゴリ選択欄 -->
                <button v-ripple="{ class: 'info--text' }" class="type-selector d-flex" :class="{ active: itemType === -1 }" @click="changeItemType(-1)">
                  <div class="type-all-text item">ALL</div>
                </button>
                <button
                  v-for="i in itemTypes"
                  :key="i.id"
                  v-ripple="{ class: 'info--text' }"
                  class="type-selector"
                  :class="{ active: itemType === i.id }"
                  @click="changeItemType(i.id)"
                >
                  <div>
                    <v-img :src="`./img/type/type${i.id}.png`" height="25" width="25" />
                  </div>
                </button>
              </div>
              <v-divider></v-divider>
              <!-- 改修値選択欄 -->
              <div class="d-flex flex-wrap mb-1">
                <button v-ripple="{ class: 'info--text' }" class="type-selector" :class="{ active: selectedRemodel === -1 }" @click="changeRemodel(-1)">
                  <div class="type-all-text">ALL</div>
                </button>
                <button
                  v-for="i in 11"
                  :key="i"
                  v-ripple="{ class: 'info--text' }"
                  class="type-selector"
                  :class="{ active: selectedRemodel === i - 1 }"
                  @click="changeRemodel(i - 1)"
                >
                  <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4">{{ i - 1 }}</span>
                </button>
              </div>
            </div>
            <div v-if="!isNotJapanese && !isShipMode" class="mb-1 caption d-none d-md-block text--secondary">Ctrlキー + 装備をクリックでwikiを展開します。</div>
            <div class="ranking-cards">
              <v-card v-for="(table, i) in viewTables" :key="`table${i}`" outlined>
                <div class="pa-2 d-flex flex-wrap align-end">
                  <div class="ml-1 body-2">{{ table.title ? $t(`Database.${table.title}`) : "" }}</div>
                  <v-spacer></v-spacer>
                  <v-btn color="secondary" small @click="showFullTable(table)" :disabled="!table.top10.length || table.items.length < 11">
                    {{ $t("Database.さらに見る") }}
                  </v-btn>
                </div>
                <v-divider></v-divider>
                <v-simple-table dense :class="{ 'my-6': !table.top10.length }">
                  <tbody>
                    <tr v-for="(row, rank) in table.top10" :key="rank" class="clickable" @click="clickedRaw(row.data, $event)">
                      <td v-if="!isMobile" class="py-1 pr-0 text-right">{{ rank + 1 }}</td>
                      <td class="py-1 pr-0">
                        <div class="d-flex align-center">
                          <template v-if="isShipMode">
                            <!-- 艦娘モードの時 -->
                            <div>
                              <v-img v-if="row.data.id" :src="`./img/ship/${row.data.id}.png`" height="30" width="120" />
                            </div>
                            <div class="ml-1 ship-name text-caption text-truncate">{{ getShipName(row.data) }}</div>
                          </template>
                          <template v-else>
                            <!-- 装備モードの時 -->
                            <div>
                              <v-img v-if="row.data.id" :src="`./img/type/icon${row.data.iconTypeId}.png`" height="30" width="30" />
                            </div>
                            <div class="ml-1 ship-name text-caption text-truncate">{{ needTrans ? $t(`${row.data.name}`) : row.data.name }}</div>
                            <div v-if="selectedRemodel >= 1">
                              <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                              <span class="teal--text text--accent-4">{{ selectedRemodel }}</span>
                            </div>
                          </template>
                        </div>
                      </td>
                      <td class="py-1 text-right value-td">{{ row.value }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="isShipMode && shipStock.length">
          <v-expansion-panel-header min-height="10" class="py-0">
            <div class="d-flex align-center">
              <v-icon>mdi-account-details</v-icon>
              <div class="ml-2">{{ $t("Database.自分のデータと比較") }}</div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="d-flex flex-wrap mt-3">
              <button v-ripple="{ class: 'info--text' }" class="type-selector d-flex" :class="{ active: shipType === -1 }" @click="changeShipType(-1)">
                <div class="type-all-text">ALL</div>
              </button>
              <button
                v-for="(i, index) in shipTypes"
                :key="index"
                v-ripple="{ class: 'info--text' }"
                class="type-selector"
                :class="{ active: index === shipType }"
                @click="changeShipType(index)"
              >
                {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
              </button>
            </div>
            <div class="d-flex flex-wrap mb-1">
              <v-checkbox v-model="includeInitial" dense :label="$t('Fleet.未改造')" :error="errorRemodel" class="mr-3" @click="setShipTables()" />
              <v-checkbox v-model="includeIntermediate" dense :label="$t('Fleet.中間改造')" :error="errorRemodel" class="mr-3" @click="setShipTables()" />
              <v-checkbox v-model="includeFinal" dense :label="$t('Fleet.最終改造')" :error="errorRemodel" @click="setShipTables()" />
            </div>
            <div class="your-data-area">
              <v-card outlined>
                <div class="pa-2 d-flex align-end">
                  <div class="body-2">{{ $t("Database.艦娘偏差値") }} TOP10</div>
                  <v-spacer></v-spacer>
                  <v-btn color="secondary" small @click="showFullDeviationTable()">{{ $t("Database.さらに見る") }}</v-btn>
                </div>
                <v-divider></v-divider>
                <v-simple-table dense :class="{ 'my-6': !deviations.length }">
                  <tbody>
                    <tr v-for="(row, rank) in deviationTop10s" :key="rank" class="clickable" @click="clickedRaw(row.data, $event)">
                      <td v-if="!isMobile" class="py-1 pr-0 text-right">{{ rank + 1 }}</td>
                      <td class="py-1 pr-0">
                        <div class="d-flex align-center">
                          <div>
                            <v-img v-if="row.data.id" :src="`./img/ship/${row.data.id}.png`" height="30" width="120" />
                          </div>
                          <div class="ml-1 ship-name text-caption text-truncate">{{ getShipName(row.data) }}</div>
                        </div>
                      </td>
                      <td class="py-1 text-right">{{ row.level }}</td>
                      <td class="py-1 text-right">
                        <v-chip small :color="row.color" :light="row.isLight" :dark="row.isDark">
                          {{ row.deviation.toFixed(1) }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
              <div class="your-data-container">
                <v-simple-table>
                  <thead>
                    <tr>
                      <th></th>
                      <th class="text-no-wrap pr-0 text-right">{{ $t("Database.サーバー平均") }}</th>
                      <th class="text-no-wrap pr-0 text-right">{{ $t("Database.サーバー中央値") }}</th>
                      <th class="text-no-wrap pr-0 text-right">{{ $t("Database.あなたのデータ") }}</th>
                      <th class="text-no-wrap pr-0 text-center">{{ $t("Database.偏差値") }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in deviationTable" :key="`dev${i}`">
                      <td class="text-no-wrap">{{ $t(`Database.${row.title}`) }}</td>
                      <td class="text-right pr-0">{{ Math.floor(row.avg).toLocaleString() }}</td>
                      <td class="text-right pr-0">{{ Math.floor(row.med).toLocaleString() }}</td>
                      <td class="text-right pr-0">{{ row.value.toLocaleString() }}</td>
                      <td class="text-center pr-0 py-1">
                        <v-chip
                          :color="getChipColor(row.deviation)"
                          :light="row.deviation <= 55 && row.deviation > 38"
                          :dark="row.deviation > 55 || row.deviation <= 38"
                        >
                          {{ row.deviation.toFixed(1) }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="mt-10" v-if="isShipMode">
        <div>{{ $t("Database.その他のデータ") }}</div>
        <v-divider class="mb-3"></v-divider>
        <v-expansion-panels focusable>
          <v-expansion-panel v-if="isShipMode">
            <v-expansion-panel-header min-height="10" class="py-0">
              <div class="d-flex align-center">
                <v-icon>mdi-swap-horizontal</v-icon>
                <div class="ml-2">{{ $t("Database.コンバート艦") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="convert-results">
                <v-card v-for="(row, i) in convertRemodelResults" :key="`convert_${i}`" class="px-2 py-1" outlined>
                  <div class="d-flex align-center my-1" v-for="(version, j) in row.versions" :key="`version${j}`">
                    <div>
                      <v-img v-if="version.data.id" :src="`./img/ship/${version.data.id}.png`" height="30" width="120" />
                    </div>
                    <div class="ml-1 convert-ship-name text-caption text-truncate">{{ getShipName(version.data) }}</div>
                    <div class="ml-auto text-right text-no-wrap">{{ version.rate }} <span class="text-body-2">%</span></div>
                  </div>
                </v-card>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="!isShipMode">
            <v-expansion-panel-header min-height="10" class="py-0">
              <div class="d-flex align-center">
                <v-icon>mdi-swap-horizontal</v-icon>
                <div class="ml-2">改修値平均</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="convert-results">
                <v-card v-for="(row, i) in convertRemodelResults" :key="`convert_${i}`" class="px-2 py-1" outlined>
                  <div class="d-flex align-center my-1" v-for="(version, j) in row.versions" :key="`version${j}`">
                    <div>
                      <v-img v-if="version.data.id" :src="`./img/ship/${version.data.id}.png`" height="30" width="120" />
                    </div>
                    <div class="ml-1 convert-ship-name text-caption text-truncate">{{ getShipName(version.data) }}</div>
                    <div class="ml-auto text-right text-no-wrap">{{ version.rate }} <span class="text-body-2">%</span></div>
                  </div>
                </v-card>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="mt-3">
          <v-alert type="info" outlined>その他、閲覧、比較したいデータ募集中！</v-alert>
        </div>
      </div>
    </template>
    <!-- ダイアログの類 -->
    <v-dialog v-model="fullTableDialog" width="500" :fullscreen="isMobile">
      <v-card class="full-table-card">
        <div class="pt-2 pb-1 px-2 d-flex flex-wrap align-center">
          <div>{{ fullTable.title ? $t(`Database.${fullTable.title}`) : "" }}</div>
          <v-btn class="ml-auto" icon @click="fullTableDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="pa-1">
          <v-text-field
            clearable
            v-model="keyword"
            hide-details
            dense
            outlined
            :placeholder="isShipMode ? '例: 春雨' : '例: 12.7cm連装砲C型改三H'"
            prepend-inner-icon="mdi-magnify"
          />
        </div>
        <div class="full-table-container">
          <v-simple-table dense>
            <tbody>
              <template v-for="(row, rank) in fullTable.items">
                <tr v-if="!keyword || row.data.name.indexOf(keyword) >= 0" class="clickable" @click="clickedRaw(row.data, $event)" :key="rank">
                  <td class="py-1 px-0 text-right rank-td">{{ rank + 1 }}</td>
                  <td class="py-1 pr-0">
                    <div class="d-flex align-center">
                      <template v-if="isShipMode">
                        <div>
                          <v-img v-if="row.data.id" :src="`./img/ship/${row.data.id}.png`" height="30" width="120" />
                        </div>
                        <div class="ml-1 ship-name text-caption text-truncate">{{ getShipName(row.data) }}</div>
                      </template>
                      <template v-else>
                        <!-- 装備モードの時 -->
                        <div>
                          <v-img v-if="row.data.id" :src="`./img/type/icon${row.data.iconTypeId}.png`" height="30" width="30" />
                        </div>
                        <div class="ml-1 ship-name text-caption text-truncate">{{ needTrans ? $t(`${row.data.name}`) : row.data.name }}</div>
                        <div v-if="selectedRemodel >= 1">
                          <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                          <span class="teal--text text--accent-4">{{ selectedRemodel }}</span>
                        </div>
                      </template>
                    </div>
                  </td>
                  <td class="pl-0 py-1 text-right value-td">{{ row.value }}</td>
                </tr>
              </template>
            </tbody>
          </v-simple-table>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="fullDeviationDialog" width="500" :fullscreen="isMobile">
      <v-card class="full-table-card">
        <div class="pt-2 pb-1 px-2 d-flex align-center">
          <div>{{ $t("Database.艦娘偏差値") }}</div>
          <v-btn class="ml-auto" icon @click="fullDeviationDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="pa-1">
          <v-text-field
            clearable
            v-model="keyword"
            hide-details
            dense
            outlined
            :placeholder="isShipMode ? '例: 春雨' : '例: 12.7cm連装砲C型改三H'"
            prepend-inner-icon="mdi-magnify"
          />
        </div>
        <div class="full-table-container">
          <v-simple-table dense>
            <tbody>
              <template v-for="(row, rank) in deviations">
                <tr v-if="!keyword || row.data.name.indexOf(keyword) >= 0" class="clickable" @click="clickedRaw(row.data, $event)" :key="rank">
                  <td class="text-right">{{ rank + 1 }}</td>
                  <td class="px-0">
                    <div class="d-flex align-center">
                      <div>
                        <v-img v-if="row.data.id" :src="`./img/ship/${row.data.id}.png`" height="30" width="120" />
                      </div>
                      <div class="ml-1 ship-name text-caption text-truncate">{{ getShipName(row.data) }}</div>
                    </div>
                  </td>
                  <td class="text-right">{{ row.level }}</td>
                  <td class="text-right">
                    <v-chip small :color="row.color" :light="row.isLight" :dark="row.isDark">
                      {{ row.deviation.toFixed(1) }}
                    </v-chip>
                  </td>
                </tr>
              </template>
            </tbody>
          </v-simple-table>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="detailDialog" width="360">
      <v-card>
        <div class="pt-2 pb-1 px-2 d-flex align-center" v-if="detailData.data">
          <div class="d-flex align-center flex-grow-1">
            <template v-if="isShipMode">
              <div>
                <v-img v-if="detailData.data.id" :src="`./img/ship/${detailData.data.id}.png`" height="30" width="120" />
              </div>
              <div class="ml-1 detail-name text-caption text-sm-body-2 text-truncate">{{ getShipName(detailData.data) }}</div>
            </template>
            <template v-else>
              <!-- 装備モードの時 -->
              <div>
                <v-img v-if="detailData.data.id" :src="`./img/type/icon${detailData.data.iconTypeId}.png`" height="30" width="30" />
              </div>
              <div class="ml-1 detail-name text-caption text-truncate">
                {{ needTrans ? $t(`${detailData.data.name}`) : detailData.data.name }}
              </div>
            </template>
          </div>
          <v-btn class="ml-auto" icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider class="mx-3"></v-divider>
        <div class="px-1">
          <v-container v-if="detailData.items">
            <template v-for="(row, i) in detailData.items">
              <v-row align="end" :key="`body${i}`">
                <v-col class="text-body-2 text-no-wrap">{{ $t(`Database.${row.header}`) }}</v-col>
                <v-col class="text-right">{{ row.value }}</v-col>
              </v-row>
              <v-divider class="mb-1" :key="`line${i}`"></v-divider>
            </template>
            <v-row align="end" v-if="isShipMode">
              <!-- 艦娘モード限定 偏差値計算機 -->
              <v-col class="text-body-2 text-no-wrap">{{ $t("Database.Lv偏差値計算") }}</v-col>
              <v-col>
                <v-text-field v-model="manualLevel" type="number" hide-details label="Lv" :max="maxLevel" min="1" />
              </v-col>
              <v-col class="text-right">{{ deviationValue }}</v-col>
            </v-row>
            <template v-if="!isShipMode && detailData.levels">
              <!-- 装備モード限定 改修値別の個数表示 -->
              <template v-for="remodel in 11">
                <v-row align="center" :key="`remodel_${remodel}`" class="ml-1">
                  <v-col class="text-no-wrap">
                    <v-icon small color="teal accent-4">mdi-star</v-icon>
                    <span class="teal--text text--accent-4">+ {{ remodel - 1 }}</span>
                  </v-col>
                  <v-col class="text-right text--secondary">{{ detailData.levels[remodel - 1].toLocaleString() }}</v-col>
                </v-row>
                <div class="mb-1 ml-3" :key="`bar${remodel}`">
                  <v-progress-linear height="1px" color="grey" :value="Math.floor(100 * (detailData.levels[remodel - 1] / detailData.totalCount))" />
                </div>
              </template>
            </template>
          </v-container>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

@media (min-width: 600px) {
  .v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}

.ranking-cards {
  display: grid;
  grid-template-columns: 1fr;
  flex-wrap: wrap;
  row-gap: 0.5rem;
  column-gap: 0.5rem;
  min-height: 30vh;
}
@media (min-width: 800px) {
  .ranking-cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1200px) {
  .ranking-cards {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1480px) {
  .drawer-fixed .ranking-cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1600px) {
  .drawer-fixed .ranking-cards {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1960px) {
  .ranking-cards {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.your-data-area {
  display: grid;
  grid-template-columns: auto;
  row-gap: 20px;
  column-gap: 20px;
  justify-content: center;
}
.your-data-area > div {
  max-width: 800px;
}
.your-data-container {
  overflow-x: auto;
}
@media (min-width: 1200px) {
  .your-data-area {
    display: grid;
    grid-template-columns: 540px 1fr;
  }
  .your-data-area > div {
    max-width: unset;
  }
  .drawer-fixed .your-data-area {
    grid-template-columns: auto 1fr;
  }
}
@media (min-width: 1600px) {
  .drawer-fixed .your-data-area {
    grid-template-columns: 500px 1fr;
  }
}

tr.clickable {
  cursor: pointer;
}
.ship-name {
  flex-grow: 1;
  width: 10px;
}
@media (min-width: 600px) {
  .ship-name {
    width: 100px;
  }
}
tr:hover .ship-name:not(.no-pointer) {
  color: #4466ff;
  text-decoration: underline;
}
.theme--dark tr:hover .ship-name:not(.no-pointer) {
  color: #44aaff;
}
.ship-name.no-pointer {
  cursor: unset;
}

.rank-td {
  width: 40px;
}
.value-td {
  font-size: 12px;
  width: 100px;
}

.convert-ship-name {
  width: 134px;
}
.detail-name {
  flex-grow: 1;
  width: 100px;
}

.full-table-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.full-table-container {
  overflow-y: auto;
}

@media (min-width: 600px) {
  .full-table-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }

  .full-table-container {
    height: 64vh;
  }
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem;
  font-size: 14px;
  cursor: pointer;
  min-width: 50px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
@media (min-width: 600px) {
  .type-selector {
    min-width: 44px;
    min-height: 44px;
  }
}
.type-selector:hover {
  background-color: rgba(17, 9, 9, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
}

.convert-results {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.5rem;
  column-gap: 0.5rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';
import Const from '@/classes/const';
import Convert from '@/classes/convert';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ItemMaster from '@/classes/item/itemMaster';
import ShipStock from '@/classes/fleet/shipStock';
import ShipMaster from '@/classes/fleet/shipMaster';
import FirebaseManager from '@/classes/firebaseManager';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getDatabase, ref, onValue, set,
} from 'firebase/database';

interface MinifyAnalyzeResult {
  avgTotalExp: number;
  divTotalExp: number;
  medTotalExp: number;
  avgImproveAsw: number;
  medImproveAsw: number;
  divImproveAsw: number;
  avgImproveLuck: number;
  medImproveLuck: number;
  divImproveLuck: number;
  avgImproveHP: number;
  medImproveHP: number;
  divImproveHP: number;
  avgMaruyu: number;
  medMaruyu: number;
  divMaruyu: number;
  itemCount: number;
  shipCount: number;
  is: {
    i: number;
    oc: number;
    tc: number;
    rm: number[];
    mx: number;
    ms: number[];
  }[];
  ss: {
    i: number;
    rc: number;
    lu: number;
    hp: number;
    as: number;
    av: number;
    dv: number;
    mc: number;
    oc: number;
    tc: number;
    mx: number;
    me: number;
    wt: number;
    sc: number;
    md: number;
  }[];
}

interface AnalyzeShipResult {
  /** 艦娘マスタid */
  id: number;
  /** 本艦娘の補強増設が開放された総数 */
  releaseExCount: number;
  /** 本艦娘に海色りぼんが付与された総数 */
  totalSeaRibbonCount: number;
  /** 本艦娘に白たすきが付与された総数 */
  totalWhiteTasukiCount: number;
  /** 本艦娘に施された運改修の合計値 */
  totalImproveLuck: number;
  /** 本艦娘に施された耐久改修の合計値 */
  totalImproveHP: number;
  /** 本艦娘に施された対潜改修の合計値 */
  totalImproveASW: number;
  /** 本艦娘の練度の平均 */
  avgLevel: number;
  /** 本艦娘の練度の中央値 */
  medLevel: number;
  /** 本艦娘の練度の標準偏差 */
  divLevel: number;
  /** 本艦娘に指輪を渡したの提督の総数 */
  onceMarriageCount: number;
  /** 本艦娘が着任している提督数 */
  onceCount: number;
  /** 本艦娘の全体在籍数 */
  totalCount: number;
  /** 本艦娘の最多在籍数 */
  maxCount: number;
  /** 本艦娘の最多EXP */
  maxExp: number;
  /** 艦娘マスタデータ(あとで紐づけ) */
  data: ShipMaster;
}

interface AnalyzeItemResult {
  /** 装備マスタid */
  id: number;
  /** 本装備の所持提督数 */
  onceCount: number;
  /** 本装備の全体所持数 */
  totalCount: number;
  /** 本装備の最多所持数 */
  maxCount: number;
  /** 装備マスタデータ(あとで紐づけ) */
  data: ItemMaster;
  /** 改修値別個数 */
  levels: number[];
  /** 本装備の最多所持数(改修値別) */
  maxCounts: number[];
}

interface AnalyzeResult {
  /** 総経験値平均 */
  avgTotalExp: number;
  /** 総経験値中央値 */
  medTotalExp: number;
  /** 総経験値標準偏差 */
  divTotalExp: number;
  /** 対潜改修平均 */
  avgImproveAsw: number;
  /** 対潜改修中央値 */
  medImproveAsw: number;
  /** 対潜改修標準偏差 */
  divImproveAsw: number;
  /** 運改修平均 */
  avgImproveLuck: number;
  /** 運改修中央値 */
  medImproveLuck: number;
  /** 運改修標準偏差 */
  divImproveLuck: number;
  /** 耐久改修平均 */
  avgImproveHP: number;
  /** 耐久改修中央値 */
  medImproveHP: number;
  /** 耐久改修標準偏差 */
  divImproveHP: number;
  /** まるゆ指数平均 */
  avgMaruyu: number;
  /** まるゆ指数中央値 */
  medMaruyu: number;
  /** まるゆ指数標準偏差 */
  divMaruyu: number;
  /** 装備有効データ総数 */
  itemCount: number;
  /** 艦娘有効データ総数 */
  shipCount: number;
  /** 装備分析データ一覧 */
  items: AnalyzeItemResult[];
  /** 艦娘分析データ一覧 */
  ships: AnalyzeShipResult[];
}

interface ShipRankingTable {
  title: string;
  top10: { data: ShipMaster; value: number | string }[];
  items: { data: ShipMaster; value: number | string }[];
}

interface ItemRankingTable {
  title: string;
  top10: { data: ItemMaster; value: number | string }[];
  items: { data: ItemMaster; value: number | string }[];
}

export default Vue.extend({
  name: 'FleetStatics',
  components: {},
  data: () => ({
    isShipMode: true,
    allShipMaster: [] as ShipMaster[],
    allItemMaster: [] as ItemMaster[],
    itemStock: [] as ItemStock[],
    shipStock: [] as ShipStock[],
    shipTypes: [] as { text: string; types: number[] }[],
    shipType: -1,
    itemTypes: [] as { id: number; types: number[] }[],
    itemType: -1,
    selectedRemodel: -1,
    includeInitial: true,
    includeIntermediate: true,
    includeFinal: true,
    unsubscribe: undefined as unknown,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipX: 0,
    tooltipY: 0,
    readOnly: false,
    isMobile: true,
    fullTable: {} as ShipRankingTable | ItemRankingTable,
    fullTableDialog: false,
    fullDeviationDialog: false,
    detailDialog: false,
    manualLevel: 99,
    maxLevel: Const.MAX_LEVEL,
    detailData: {} as {
      data: ItemMaster | ShipMaster;
      items: { header: string; value: string }[];
      divLevel?: number;
      avgLevel?: number;
      levels?: number[];
      totalCount?: number;
    },
    analyzeResult: {
      ships: [],
      items: [],
      avgTotalExp: 0,
      divTotalExp: 0,
      medTotalExp: 0,
      avgImproveAsw: 0,
      medImproveAsw: 0,
      divImproveAsw: 0,
      avgImproveLuck: 0,
      medImproveLuck: 0,
      divImproveLuck: 0,
      avgImproveHP: 0,
      medImproveHP: 0,
      divImproveHP: 0,
      avgMaruyu: 0,
      medMaruyu: 0,
      divMaruyu: 0,
      itemCount: 0,
      shipCount: 0,
    } as AnalyzeResult,
    /** 基本統計データ結果セット */
    viewTables: [] as ShipRankingTable[] | ItemRankingTable[],
    keyword: '',
    deviations: [] as { data: ShipMaster; level: number; deviation: number; color: string; isLight: boolean; isDark: boolean }[],
    /** コンバート艦どっち？リスト */
    convertRemodelResults: [] as { base: ShipMaster; versions: { data: ShipMaster; rate: number }[] }[],
    deviationTable: [] as { title: string; avg: number; med: number; value: number; deviation: number }[],
    loading: false,
    confirmDialog: false,
    isSubmitted: false,
    errorDialog: false,
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }

    this.initialize();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setItemStock') {
        this.itemStock = state.itemStock as ItemStock[];
        this.setItemTables();
        this.isSubmitted = false;
      } else if (mutation.type === 'setShipStock') {
        this.shipStock = state.shipStock as ShipStock[];
        this.setShipTables();
        this.isSubmitted = false;
      }
    });
  },
  watch: {
    completed(value) {
      if (value && !this.allItemMaster.length && !this.allShipMaster.length) {
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
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    deviationValue(): string {
      if (this.manualLevel && this.detailData.divLevel && this.detailData.avgLevel) {
        if (this.manualLevel <= 0 || this.manualLevel > this.maxLevel) {
          return '-';
        }
        const level = Math.min(this.maxLevel, +this.manualLevel);
        return (((level - this.detailData.avgLevel) / this.detailData.divLevel) * 10 + 50).toFixed(1);
      }

      return '-';
    },
    deviationTop10s() {
      return this.deviations.slice(0, 10);
    },
    errorRemodel() {
      return !this.includeInitial && !this.includeIntermediate && !this.includeFinal;
    },
    hasManualData() {
      if (this.shipStock && this.shipStock.length) {
        if (this.shipStock.some((v) => v.isManualInput)) {
          return true;
        }
      }
      if (this.itemStock && this.itemStock.length) {
        return this.itemStock.some((v) => v.isManualInput);
      }

      return false;
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
      this.allItemMaster = this.$store.state.items as ItemMaster[];
      this.allItemMaster = this.allItemMaster.filter((v) => !v.isEnemyItem);
      this.itemStock = this.$store.state.itemStock as ItemStock[];

      this.allShipMaster = this.$store.state.ships as ShipMaster[];
      this.shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnly) {
        // 閲覧モード
        this.itemStock = this.$store.state.tempItemStock as ItemStock[];
        this.shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      // 艦娘カテゴリ一覧セット
      this.shipTypes = [];
      for (let i = 0; i < Const.SHIP_TYPES_ALT2.length; i += 1) {
        const data = Const.SHIP_TYPES_ALT2[i];
        this.shipTypes.push({ text: data.text, types: data.types });
      }

      // 装備カテゴリ一覧セット
      this.itemTypes = [];
      for (let i = 0; i < Const.ITEM_TYPES_ALT.length; i += 1) {
        const type = Const.ITEM_TYPES_ALT[i];
        this.itemTypes.push({ id: type.id, types: type.types });
      }
    },
    async fetchAnalyticsResult() {
      this.loading = true;

      // 匿名ログイン
      const auth = getAuth();
      await signInAnonymously(auth);

      const db = getDatabase();
      onValue(
        ref(db, '/analyze_result'),
        (snapshot) => {
          const raw = snapshot.val();
          const decoded = decompressFromEncodedURIComponent(raw);
          if (decoded) {
            const min = JSON.parse(decoded) as MinifyAnalyzeResult;
            this.analyzeResult = {
              avgTotalExp: min.avgTotalExp ?? 0,
              medTotalExp: min.medTotalExp ?? 0,
              divTotalExp: min.divTotalExp ?? 0,
              avgImproveAsw: min.avgImproveAsw ?? 0,
              medImproveAsw: min.medImproveAsw ?? 0,
              divImproveAsw: min.divImproveAsw ?? 0,
              avgImproveLuck: min.avgImproveLuck ?? 0,
              medImproveLuck: min.medImproveLuck ?? 0,
              divImproveLuck: min.divImproveLuck ?? 0,
              avgImproveHP: min.avgImproveHP ?? 0,
              medImproveHP: min.medImproveHP ?? 0,
              divImproveHP: min.divImproveHP ?? 0,
              avgMaruyu: min.avgMaruyu ?? 0,
              medMaruyu: min.medMaruyu ?? 0,
              divMaruyu: min.divMaruyu ?? 0,
              itemCount: min.itemCount ?? 0,
              items: min.is.map((v) => {
                const data = this.allItemMaster.find((x) => x.id === v.i) ?? new ItemMaster();
                return {
                  id: v.i,
                  data,
                  onceCount: v.oc,
                  totalCount: v.tc,
                  levels: v.rm,
                  maxCount: v.mx,
                  maxCounts: v.ms,
                };
              }),
              shipCount: min.shipCount ?? 0,
              ships: min.ss.map((v) => {
                const data = this.allShipMaster.find((x) => x.id === v.i) ?? new ShipMaster();
                return {
                  id: v.i,
                  data,
                  totalCount: v.tc,
                  maxCount: v.mx,
                  totalImproveHP: v.hp,
                  totalImproveASW: v.as,
                  totalImproveLuck: v.lu,
                  releaseExCount: v.rc,
                  totalSeaRibbonCount: v.sc,
                  totalWhiteTasukiCount: v.wt,
                  onceMarriageCount: v.mc,
                  onceCount: v.oc,
                  avgLevel: v.av,
                  divLevel: v.dv,
                  medLevel: v.md,
                  maxExp: v.me,
                };
              }),
            };
          } else {
            this.analyzeResult = {
              ships: [],
              items: [],
              avgTotalExp: 0,
              medTotalExp: 0,
              divTotalExp: 0,
              avgImproveAsw: 0,
              medImproveAsw: 0,
              divImproveAsw: 0,
              avgImproveLuck: 0,
              medImproveLuck: 0,
              divImproveLuck: 0,
              avgImproveHP: 0,
              medImproveHP: 0,
              divImproveHP: 0,
              avgMaruyu: 0,
              medMaruyu: 0,
              divMaruyu: 0,
              itemCount: 0,
              shipCount: 0,
            };
          }

          if (!this.analyzeResult.shipCount) {
            this.errorDialog = true;
          }

          this.setItemTables();
          this.setShipTables();

          this.loading = false;
        },
        { onlyOnce: true },
      );
    },
    async sendStockData() {
      this.loading = true;

      if (this.hasManualData) {
        this.loading = false;
        this.confirmDialog = false;
        return;
      }

      const shipStock = this.$store.state.shipStock as ShipStock[];
      const itemStock = this.$store.state.itemStock as ItemStock[];
      const stockData = FirebaseManager.createFirebaseStockObject(shipStock, itemStock);

      if (this.isTempStockMode || (!stockData.ships && !stockData.items)) {
        this.loading = false;
        return;
      }

      try {
        const db = getDatabase();
        // 匿名ログイン
        const auth = getAuth();
        signInAnonymously(auth)
          .then(() => {
            const setting = this.$store.state.siteSetting as SiteSetting;
            // 念のためuuidなければ発行
            if (!setting.userId) {
              setting.userId = uuidv4();
            }
            // 集計用データ送信
            set(ref(db, `user_stocks/${setting.userId}`), {
              ships: stockData.ships,
              items: stockData.items,
              date: Convert.formatDate(new Date(), 'yy/MM/dd HH:mm:ss'),
            })
              .then(() => {
                // サイト設定を保存
                this.$store.dispatch('updateSetting', setting);
                this.loading = false;
                this.isSubmitted = true;
                this.confirmDialog = false;
              })
              .catch((error) => {
                console.error(error);
                this.loading = false;
              });
          })
          .catch((error) => {
            console.error(error);
            this.loading = false;
          });
      } catch (error) {
        console.error(error);
        this.loading = false;
      }
    },
    changeShipType(type = 0) {
      this.shipType = type;
      this.setShipTables();
    },
    changeItemType(type = 0) {
      this.itemType = type;
      this.setItemTables();
    },
    changeRemodel(remodel = 0) {
      this.selectedRemodel = remodel;
      this.setItemTables();
    },
    setShipTables() {
      this.isMobile = window.innerWidth < 600;
      this.isShipMode = true;
      this.viewTables = [] as ShipRankingTable[];
      /** 有効登録母数 */
      const baseCount = this.analyzeResult.shipCount;
      let ships = this.analyzeResult.ships.concat() as AnalyzeShipResult[];

      // カテゴリ検索
      const t = this.shipTypes[this.shipType];
      if (t) {
        ships = ships.filter((v) => t.types.includes(v.data.type));
      }

      // 初期改造状態で絞る
      if (!this.includeInitial) {
        ships = ships.filter((v) => v.data.version !== 0 || v.data.isFinal);
      }
      // 中間改造状態で絞る
      if (!this.includeIntermediate) {
        ships = ships.filter((v) => v.data.version === 0 || v.data.isFinal);
      }
      // 最終改造状態で絞る
      if (!this.includeFinal) {
        ships = ships.filter((v) => !v.data.isFinal);
      }

      const maxTableRows = this.shipType === -1 ? 400 : 500;

      ships.sort((a, b) => b.onceCount - a.onceCount);
      this.viewTables.push({
        title: '在籍率',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
      });
      ships.sort((a, b) => b.totalCount - a.totalCount);
      this.viewTables.push({
        title: '総在籍数',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: v.totalCount.toLocaleString() })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: v.totalCount.toLocaleString() })),
      });
      this.viewTables.push({
        title: '平均在籍数',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: (v.totalCount / baseCount).toFixed(1) })),
        items: ships.map((v) => ({ data: v.data, value: (v.totalCount / baseCount).toFixed(1) })),
      });
      ships.sort((a, b) => b.maxCount - a.maxCount);
      this.viewTables.push({
        title: '最多在籍数',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: v.maxCount.toLocaleString() })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: v.maxCount.toLocaleString() })),
      });
      ships.sort((a, b) => b.maxExp - a.maxExp);
      this.viewTables.push({
        title: '最多EXP',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: v.maxExp.toLocaleString() })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: v.maxExp.toLocaleString() })),
      });
      ships.sort((a, b) => b.onceMarriageCount - a.onceMarriageCount);
      this.viewTables.push({
        title: 'ケッコン率',
        top10: ships
          .filter((v) => v.onceMarriageCount)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: `${(100 * (v.onceMarriageCount / baseCount)).toFixed(1)} %` })),
        items: ships
          .filter((v) => v.onceMarriageCount)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: `${(100 * (v.onceMarriageCount / baseCount)).toFixed(1)} %` })),
      });

      ships.sort((a, b) => b.avgLevel - a.avgLevel);
      this.viewTables.push({
        title: 'Lv平均',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: v.avgLevel.toFixed(1) })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: v.avgLevel.toFixed(1) })),
      });
      ships.sort((a, b) => b.medLevel - a.medLevel);
      this.viewTables.push({
        title: 'Lv中央値',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: v.medLevel })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: v.medLevel })),
      });

      ships.sort((a, b) => b.releaseExCount / b.totalCount - a.releaseExCount / a.totalCount);
      this.viewTables.push({
        title: '補強増設開放率',
        top10: ships
          .filter((v) => v.releaseExCount)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: `${(100 * (v.releaseExCount / v.totalCount)).toFixed(1)} %` })),
        items: ships
          .filter((v) => v.releaseExCount)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: `${(100 * (v.releaseExCount / v.totalCount)).toFixed(1)} %` })),
      });

      ships.sort((a, b) => b.totalSeaRibbonCount - a.totalSeaRibbonCount);
      this.viewTables.push({
        title: '海色リボン付与数',
        top10: ships
          .filter((v) => v.totalSeaRibbonCount)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalSeaRibbonCount.toLocaleString() })),
        items: ships
          .filter((v) => v.totalSeaRibbonCount)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalSeaRibbonCount.toLocaleString() })),
      });

      ships.sort((a, b) => b.totalWhiteTasukiCount - a.totalWhiteTasukiCount);
      this.viewTables.push({
        title: '白たすき付与数',
        top10: ships
          .filter((v) => v.totalWhiteTasukiCount)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalWhiteTasukiCount.toLocaleString() })),
        items: ships
          .filter((v) => v.totalWhiteTasukiCount)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalWhiteTasukiCount.toLocaleString() })),
      });

      ships.sort((a, b) => b.totalImproveLuck - a.totalImproveLuck);
      this.viewTables.push({
        title: '総運改修値',
        top10: ships
          .filter((v) => v.totalImproveLuck)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalImproveLuck.toLocaleString() })),
        items: ships
          .filter((v) => v.totalImproveLuck)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalImproveLuck.toLocaleString() })),
      });

      ships.sort((a, b) => b.totalImproveHP - a.totalImproveHP);
      this.viewTables.push({
        title: '総耐久改修値',
        top10: ships
          .filter((v) => v.totalImproveHP)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalImproveHP.toLocaleString() })),
        items: ships
          .filter((v) => v.totalImproveHP)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalImproveHP.toLocaleString() })),
      });

      ships.sort((a, b) => b.totalImproveASW - a.totalImproveASW);
      this.viewTables.push({
        title: '総対潜改修値',
        top10: ships
          .filter((v) => v.totalImproveASW)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalImproveASW.toLocaleString() })),
        items: ships
          .filter((v) => v.totalImproveASW)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalImproveASW.toLocaleString() })),
      });

      // 偏差値の集計
      this.setDeviations();

      // その他の集計
      this.extendAnalyze();
    },
    setDeviations() {
      const stocks = this.shipStock;
      this.deviations = [];
      this.deviationTable = [];
      let totalExp = 0;
      let totalImproveHP = 0;
      let totalImproveASW = 0;
      let totalImproveLuck = 0;
      let marriageCount = 0;
      let maruyuCount = 0;

      if (!stocks.length) {
        return;
      }

      // カテゴリ検索
      const t = this.shipTypes[this.shipType];

      for (let i = 0; i < stocks.length; i += 1) {
        const stock = stocks[i];
        const data = this.allShipMaster.find((v) => v.id === stock.id);
        totalExp += stock.exp;
        totalImproveHP += stock.improvement.hp;
        totalImproveASW += stock.improvement.asw;
        totalImproveLuck += stock.improvement.luck;
        marriageCount += stock.level > 99 ? 1 : 0;
        maruyuCount += stock.id === 163 || stock.id === 402 ? 1 : 0;

        const result = this.analyzeResult.ships.find((v) => v.id === stock.id);
        if (!data || !result) continue;

        if (t && !t.types.includes(data.type)) continue;
        // 初期改造状態で絞る
        if (!this.includeInitial && data.version === 0) continue;
        // 中間改造状態で絞る
        if (!this.includeIntermediate && data.version !== 0 && !data.isFinal) continue;
        // 最終改造状態で絞る
        if (!this.includeFinal && data.isFinal) continue;

        // 艦とLvが重複していないかチェック
        if (this.deviations.some((v) => v.data.id === stock.id && v.level === stock.level)) continue;

        // 偏差値を取得
        const deviation = ((stock.level - result.avgLevel) / result.divLevel) * 10 + 50;
        this.deviations.push({
          data,
          level: stock.level,
          deviation,
          color: this.getChipColor(deviation),
          isLight: deviation <= 55 && deviation > 38,
          isDark: deviation > 55 || deviation <= 38,
        });
      }

      const maruyuIndex = Math.max(Math.floor(maruyuCount + (totalImproveLuck - marriageCount * 4.5) / 1.6), 0);

      this.deviations.sort((a, b) => b.deviation - a.deviation);
      if (this.analyzeResult.divTotalExp) {
        this.deviationTable.push({
          title: '総経験値',
          avg: this.analyzeResult.avgTotalExp,
          med: this.analyzeResult.medTotalExp,
          value: totalExp,
          deviation: ((totalExp - this.analyzeResult.avgTotalExp) / this.analyzeResult.divTotalExp) * 10 + 50,
        });
      }
      if (this.analyzeResult.divImproveLuck) {
        this.deviationTable.push({
          title: '総運改修値',
          avg: this.analyzeResult.avgImproveLuck,
          med: this.analyzeResult.medImproveLuck,
          value: totalImproveLuck,
          deviation: ((totalImproveLuck - this.analyzeResult.avgImproveLuck) / this.analyzeResult.divImproveLuck) * 10 + 50,
        });
      }
      if (this.analyzeResult.divImproveHP) {
        this.deviationTable.push({
          title: '総耐久改修値',
          avg: this.analyzeResult.avgImproveHP,
          med: this.analyzeResult.medImproveHP,
          value: totalImproveHP,
          deviation: ((totalImproveHP - this.analyzeResult.avgImproveHP) / this.analyzeResult.divImproveHP) * 10 + 50,
        });
      }
      if (this.analyzeResult.divImproveAsw) {
        this.deviationTable.push({
          title: '総対潜改修値',
          avg: this.analyzeResult.avgImproveAsw,
          med: this.analyzeResult.medImproveAsw,
          value: totalImproveASW,
          deviation: ((totalImproveASW - this.analyzeResult.avgImproveAsw) / this.analyzeResult.divImproveAsw) * 10 + 50,
        });
      }
      if (this.analyzeResult.divMaruyu) {
        this.deviationTable.push({
          title: 'まるゆ指数',
          avg: this.analyzeResult.avgMaruyu,
          med: this.analyzeResult.medMaruyu,
          value: maruyuIndex,
          deviation: ((maruyuIndex - this.analyzeResult.avgMaruyu) / this.analyzeResult.divMaruyu) * 10 + 50,
        });
      }
    },
    extendAnalyze() {
      // コンバート艦の集計
      this.convertRemodelResults = [];
      const hasConvertOriginalIds = ShipMaster.getConvertOriginalShips(this.allShipMaster).map((v) => v.id);
      const finals = this.allShipMaster.filter((v) => hasConvertOriginalIds.includes(v.originalId) && v.isFinal);

      for (let i = 0; i < hasConvertOriginalIds.length; i += 1) {
        const originalId = hasConvertOriginalIds[i];
        const base = finals.find((v) => v.originalId === originalId);
        if (!base) continue;

        const results = [];
        const finalShips = finals.filter((v) => v.originalId === originalId);
        let totalCount = 0;
        for (let j = 0; j < finalShips.length; j += 1) {
          const ship = finalShips[j];
          if (ship.id === 184) continue;
          const result = this.analyzeResult.ships.find((v) => v.id === ship.id);
          if (result) {
            results.push(result);
            totalCount += result.totalCount;
          }
        }

        const versions = results.map((v) => ({ data: v.data, rate: Math.round((100 * v.totalCount) / totalCount) }));
        versions.sort((a, b) => b.rate - a.rate);
        this.convertRemodelResults.push({ base, versions });
      }

      this.convertRemodelResults.sort((a, b) => {
        if (a.versions.length !== b.versions.length) return a.versions.length - b.versions.length;
        return a.base.type - b.base.type;
      });
    },
    setItemTables() {
      this.isMobile = window.innerWidth < 600;
      this.isShipMode = false;
      this.viewTables = [] as ItemRankingTable[];
      /** 有効登録母数 */
      const baseCount = this.analyzeResult.itemCount;
      let items = this.analyzeResult.items.concat() as AnalyzeItemResult[];

      const t = this.itemTypes.find((v) => v.id === this.itemType);
      if (t) {
        items = items.filter((v) => t.types.includes(v.data.apiTypeId));
      }

      if (this.selectedRemodel === -1) {
        // 改修値ALLの時
        items.sort((a, b) => b.onceCount - a.onceCount);
        this.viewTables.push({
          title: '所持率',
          top10: items.slice(0, 10).map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
          items: items.map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
        });
        items.sort((a, b) => b.totalCount - a.totalCount);
        this.viewTables.push({
          title: '総在庫数',
          top10: items.slice(0, 10).map((v) => ({ data: v.data, value: v.totalCount.toLocaleString() })),
          items: items.map((v) => ({ data: v.data, value: v.totalCount.toLocaleString() })),
        });
        this.viewTables.push({
          title: '平均所持数',
          top10: items.slice(0, 10).map((v) => ({ data: v.data, value: (v.totalCount / baseCount).toFixed(1) })),
          items: items.map((v) => ({ data: v.data, value: (v.totalCount / baseCount).toFixed(1) })),
        });
        items.sort((a, b) => b.maxCount - a.maxCount);
        this.viewTables.push({
          title: '最多所持数',
          top10: items.slice(0, 10).map((v) => ({ data: v.data, value: v.maxCount.toLocaleString() })),
          items: items.filter((v) => v.maxCount).map((v) => ({ data: v.data, value: v.maxCount.toLocaleString() })),
        });
      } else {
        items.sort((a, b) => b.levels[this.selectedRemodel] - a.levels[this.selectedRemodel]);
        this.viewTables.push({
          title: '総在庫数',
          top10: items
            .filter((v) => v.levels[this.selectedRemodel])
            .slice(0, 10)
            .map((v) => ({ data: v.data, value: v.levels[this.selectedRemodel] })),
          items: items
            .filter((v) => v.levels[this.selectedRemodel])
            .slice(0, 300)
            .map((v) => ({ data: v.data, value: v.levels[this.selectedRemodel] })),
        });
        this.viewTables.push({
          title: '平均所持数',
          top10: items
            .filter((v) => v.levels[this.selectedRemodel])
            .slice(0, 10)
            .map((v) => ({ data: v.data, value: (v.levels[this.selectedRemodel] / baseCount).toFixed(2) })),
          items: items
            .filter((v) => v.levels[this.selectedRemodel])
            .slice(0, 300)
            .map((v) => ({ data: v.data, value: (v.levels[this.selectedRemodel] / baseCount).toFixed(2) })),
        });
        items.sort((a, b) => b.maxCounts[this.selectedRemodel] - a.maxCounts[this.selectedRemodel]);
        this.viewTables.push({
          title: '最多所持数',
          top10: items
            .filter((v) => v.maxCounts[this.selectedRemodel])
            .slice(0, 10)
            .map((v) => ({ data: v.data, value: v.maxCounts[this.selectedRemodel].toLocaleString() })),
          items: items
            .filter((v) => v.maxCounts[this.selectedRemodel])
            .map((v) => ({ data: v.data, value: v.maxCounts[this.selectedRemodel].toLocaleString() })),
        });
      }
    },
    showFullTable(tableData: ShipRankingTable | ItemRankingTable) {
      this.isMobile = window.innerWidth < 600;
      this.fullTable = tableData;
      this.fullTableDialog = true;
    },
    showFullDeviationTable() {
      this.isMobile = window.innerWidth < 600;
      this.fullDeviationDialog = true;
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
    getChipColor(value: number) {
      if (value > 80) return 'indigo';
      if (value > 70) return 'blue darken-3';
      if (value > 65) return 'blue';
      if (value > 60) return 'teal';
      if (value > 55) return 'green';
      if (value > 53) return 'lime';
      if (value > 47) return 'yellow';
      if (value > 45) return 'amber';
      if (value > 38) return 'orange';
      if (value > 30) return 'deep-orange';
      return 'error';
    },
    clickedRaw(data: ItemMaster | ShipMaster, event: MouseEvent) {
      if (!this.isShipMode && event && event.ctrlKey && data && data instanceof ItemMaster && !data.isEnemyItem) {
        window.open(ItemMaster.getWikiURL(data));
        return;
      }
      const target = this.isShipMode ? this.analyzeResult.ships.find((v) => v.id === data.id) : this.analyzeResult.items.find((v) => v.id === data.id);
      if (!target) {
        return;
      }
      target.data = data;
      this.detailData = {
        data,
        items: [] as { header: string; value: string }[],
      };

      if (this.isShipMode && 'releaseExCount' in target) {
        this.detailData.items.push({ header: '在籍率', value: `${(100 * (target.onceCount / this.analyzeResult.shipCount)).toFixed(1)} %` });
        this.detailData.items.push({ header: 'ケッコン率', value: `${(100 * (target.onceMarriageCount / this.analyzeResult.shipCount)).toFixed(1)} %` });
        this.detailData.items.push({ header: '総在籍数', value: target.totalCount.toLocaleString() });
        this.detailData.items.push({ header: '最多在籍数', value: target.maxCount.toLocaleString() });
        this.detailData.items.push({ header: '補強増設開放数', value: target.releaseExCount.toLocaleString() });
        this.detailData.items.push({ header: '総運改修値', value: target.totalImproveLuck.toLocaleString() });
        this.detailData.items.push({ header: '総耐久改修値', value: target.totalImproveHP.toLocaleString() });
        this.detailData.items.push({ header: '総対潜改修値', value: target.totalImproveASW.toLocaleString() });
        this.detailData.items.push({ header: 'Lv平均', value: target.avgLevel.toLocaleString() });
        this.detailData.items.push({ header: 'Lv標準偏差', value: target.divLevel.toLocaleString() });
        this.detailData.avgLevel = target.avgLevel;
        this.detailData.divLevel = target.divLevel;
      } else if (!this.isShipMode && 'levels' in target) {
        this.detailData.items.push({ header: '所持率', value: `${(100 * (target.onceCount / this.analyzeResult.itemCount)).toFixed(1)} %` });
        this.detailData.items.push({ header: '平均所持数', value: (target.totalCount / this.analyzeResult.itemCount).toFixed(1) });
        this.detailData.items.push({ header: '最多所持数', value: target.maxCount.toLocaleString() });
        this.detailData.items.push({ header: '総在庫数', value: target.totalCount.toLocaleString() });
        this.detailData.totalCount = target.totalCount;
        this.detailData.levels = target.levels;
      }

      this.isMobile = window.innerWidth < 600;
      this.detailDialog = true;
    },
  },
});
</script>
