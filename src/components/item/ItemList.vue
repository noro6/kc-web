<template>
  <v-card class="list-card">
    <div class="list-toolbar">
      <div class="item-search-text" :class="{ 'flex-grow-1': isMobile }">
        <v-text-field :placeholder="$t('ItemList.図鑑id 名称検索')" clearable v-model="keyword" @input="filter()" hide-details
          dense prepend-inner-icon="mdi-magnify" />
      </div>
      <div v-if="!isMobile" class="toolbar-filter">
        <div class="status-filter" :class="{ active: +filterStatusValue > 0 }">
          <v-select class="status-filter-key" dense v-model="filterStatus" hide-details :items="filterStatusItems"
            @change="changedFilter()" />
          <v-text-field class="status-filter-value" dense v-model="filterStatusValue" hide-details type="number" max="30"
            min="0" @input="changedFilter()" />
          <div class="status-filter-spin">
            <button type="button" :disabled="+filterStatusValue >= 30" @click="stepFilterValue(1)">
              <v-icon x-small>mdi-chevron-up</v-icon>
            </button>
            <button type="button" :disabled="+filterStatusValue <= 0" @click="stepFilterValue(-1)">
              <v-icon x-small>mdi-chevron-down</v-icon>
            </button>
          </div>
          <span class="status-filter-op">{{ isCostFilter ? $t("ItemList.以下") : $t("ItemList.以上") }}</span>
          <button v-if="+filterStatusValue > 0" type="button" class="status-filter-clear" @click="clearStatusValue()">
            <v-icon x-small>mdi-close</v-icon>
          </button>
        </div>
        <button v-if="canSaveStatusFilter" type="button" class="status-save-button"
          :title="currentStatusFilterLabel" @click="saveStatusFilterPreset()">
          {{ $t("ItemList.この条件を保存") }}
        </button>
      </div>
      <div class="toolbar-tools">
        <v-switch v-if="!isMobile && itemStock.length && !isEnemyMode" class="toolbar-stock"
          :label="$t('ItemList.所持装備反映')" v-model="isStockOnly" @click="clickedStockOnly" dense hide-details
          :disabled="!!batchList.length" />
        <v-btn-toggle v-if="!isMobile" class="view-toggle" dense v-model="multiLine" borderless mandatory>
          <v-btn :value="false" :class="{ active: !multiLine }" @click.stop="changeMultiLine(false)">
            <v-icon small>mdi-view-headline</v-icon>
          </v-btn>
          <v-btn :value="true" :class="{ active: multiLine }" @click.stop="changeMultiLine(true)">
            <v-icon small>mdi-view-comfy</v-icon>
          </v-btn>
        </v-btn-toggle>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>
    <v-divider />
    <div class="item-filter-container" v-if="!isMobile">
      <div class="filter-row" ref="filterRow">
      <template v-if="!isBatchMode || !isCheckedOnly">
        <button type="button" class="filter-chip" :class="{ active: isEnemyMode }"
          @click="isEnemyMode = !isEnemyMode; filter()">{{ $t("ItemList.敵装備") }}</button>
        <div class="filter-tri" v-if="!isAirbaseMode">
          <span class="filter-tri-label">{{ $t("ItemList.射程増加") }}</span>
          <div class="filter-segmented">
            <button v-for="opt in triStateOptions" :key="`range${opt.value}`" type="button"
              :class="{ active: affectingRangeState === opt.value }" @click="setAffectingRangeState(opt.value)">
              {{ $t(`ItemList.${opt.text}`) }}
            </button>
          </div>
        </div>
        <div class="filter-tri" v-if="type === 7 && !isEnemyMode">
          <span class="filter-tri-label">{{ $t("ItemList.対地攻撃") }}</span>
          <div class="filter-segmented">
            <button v-for="opt in triStateOptions" :key="`lba${opt.value}`" type="button"
              :class="{ active: landBaseAttackState === opt.value }" @click="setLandBaseAttackState(opt.value)">
              {{ $t(`ItemList.${opt.text}`) }}
            </button>
          </div>
        </div>
        <button v-if="enabledNightAircraftFilter" type="button" class="filter-chip"
          :class="{ active: onlyNightAircraft }" @click="onlyNightAircraft = !onlyNightAircraft; filter()">
          {{ $t("ItemList.夜間機") }}
        </button>
        <button v-if="enabledAAResistFilter" type="button" class="filter-chip" :class="{ active: onlyAAResistAircraft }"
          @click="onlyAAResistAircraft = !onlyAAResistAircraft; filter()">{{ $t("ItemList.射撃回避") }}</button>
        <button v-if="!isEnemyMode && setting.displayBonusKey" type="button" class="filter-chip"
          :class="{ active: isSpecialOnly }" @click="isSpecialOnly = !isSpecialOnly; filter()">
          {{ $t("ItemList.特効装備") }}
        </button>
        <template v-if="type === 14">
          <div class="filter-separator" />
          <button type="button" class="filter-chip" :class="{ active: includeSonar }"
            @click="includeSonar = !includeSonar; filter()">{{ $t("EType.ソナー") }}</button>
          <button type="button" class="filter-chip" :class="{ active: includeDepthCharge }"
            @click="includeDepthCharge = !includeDepthCharge; filter()">{{ $t("EType.爆雷") }}</button>
          <button type="button" class="filter-chip" :class="{ active: includeDepthChargeLauncher }"
            @click="includeDepthChargeLauncher = !includeDepthChargeLauncher; filter()">
            {{ $t("EType.爆雷投射機") }}
          </button>
        </template>
        <template v-if="type === 5">
          <div class="filter-separator" />
          <button type="button" class="filter-chip" :class="{ active: includeTorpedo }"
            @click="includeTorpedo = !includeTorpedo; filter()">{{ $t("EType.魚雷") }}</button>
          <button type="button" class="filter-chip" :class="{ active: includeSPTorpedo }"
            @click="includeSPTorpedo = !includeSPTorpedo; filter()">{{ $t("EType.特殊潜航艇") }}</button>
          <button type="button" class="filter-chip" :class="{ active: includeSVTorpedo }"
            @click="includeSVTorpedo = !includeSVTorpedo; filter()">{{ $t("EType.潜水艦魚雷") }}</button>
        </template>
      </template>
        <div v-if="statusFilterPresets.length && !presetsOnOwnRow" class="filter-separator preset-separator" />
        <div v-if="statusFilterPresets.length" class="preset-group" :class="{ own: presetsOnOwnRow }">
          <transition-group name="preset-pop" tag="div" class="preset-chips" :appear="animatePresetEnter">
            <div v-for="preset in statusFilterPresets" :key="preset.id" class="filter-chip preset-chip"
              :class="{ active: isActiveStatusPreset(preset) }">
              <button type="button" class="preset-apply" @click="applyStatusFilterPreset(preset)">
                {{ statusFilterPresetLabel(preset) }}
              </button>
              <button type="button" class="preset-remove" :title="$t('Common.削除')"
                @click="removeStatusFilterPreset(preset)">
                <v-icon x-small>mdi-close</v-icon>
              </button>
            </div>
          </transition-group>
        </div>
      <div class="filter-right">
        <button v-if="isStockOnly && !multiLine && !isEnemyMode" type="button" class="filter-chip"
          :class="{ active: sortExcludeRemodelStatus }"
          @click="sortExcludeRemodelStatus = !sortExcludeRemodelStatus; filter()">
          {{ $t("ItemList.改修値無効") }}
        </button>
        <button v-if="!multiLine && !isAirbaseMode && !isEnemyMode" type="button" class="filter-chip"
          :class="{ active: sortExcludeSynergyStatus }"
          @click="sortExcludeSynergyStatus = !sortExcludeSynergyStatus; filter()">
          {{ $t("ItemList.装備シナジー無効") }}
        </button>
        <button type="button" class="filter-chip" :class="{ active: setting.blacklistItemIds.length }"
          :title="$t('ItemList.ブラックリスト')" @click="showBlacklist()">
          <v-icon small>mdi-eye-off-outline</v-icon>
          <span class="ml-1">{{ setting.blacklistItemIds.length }}</span>
        </button>
      </div>
      </div>
    </div>
    <div class="type-selector-container"
      :class="{ 'ml-3': multiLine && !isMobile, 'ml-1': !multiLine && !isMobile, 'px-2': isMobile, mobile: isMobile }">
      <div v-ripple="{ class: 'info--text' }" class="type-selector"
        :class="{ active: type === -1 && !disabledDetailFilter, disabled: keyword, 'batch-max': isBatchListMax }"
        @click="changeType(-1)" @keypress="changeType(-1)">
        <div class="type-all-text">ALL</div>
      </div>
      <div v-for="i in enabledTypes" :key="i.id" v-ripple="{ class: 'info--text' }" class="type-selector"
        :class="{ active: type === i.id && !disabledDetailFilter, disabled: keyword, 'batch-max': isBatchListMax }"
        @click="changeType(i.id)" @keypress="changeType(i.id)">
        <v-img class="type-icon" :src="`./img/type/type${isAirbaseMode && i.id === 17 ? 26 : i.id}.png`" height="28"
          width="28" />
      </div>
      <div v-if="batchList.length" v-ripple="{ class: 'info--text' }" class="type-selector"
        :class="{ active: isCheckedOnly, disabled: keyword }" @click="toggleCheckedOnly" @keypress="toggleCheckedOnly">
        <div class="type-all-text">{{ $t("Fleet.選択済") }}</div>
      </div>
      <span v-if="!isMobile" class="filter-count type-count">{{ $t("ItemList.x件", { number: viewItems.length }) }}</span>
    </div>
    <div v-if="isMobile" class="mobile-summary-bar">
      <span class="filter-count">{{ $t("ItemList.x件", { number: viewItems.length }) }}</span>
      <v-spacer />
      <button type="button" class="filter-chip" :class="{ active: sortKey }" @click="sortDialog = true">
        <v-icon small class="mr-1">mdi-sort</v-icon>
        <template v-if="sortKey">{{ sortKeyLabel }} {{ isDesc ? "↓" : "↑" }}</template>
        <template v-else>{{ $t("Common.ソート") }}</template>
      </button>
      <button type="button" class="filter-chip" :class="{ active: activeFilterCount }" @click="filterDialog = true">
        <v-icon small class="mr-1">mdi-filter-variant</v-icon>
        {{ $t("Common.絞り込み") }}<template v-if="activeFilterCount">&nbsp;{{ activeFilterCount }}</template>
      </button>
    </div>
    <v-divider :class="{ 'mx-3': multiLine && !isMobile }" />
    <div class="list-main" :class="{ 'with-pane': showDetailPane }">
    <!-- 装備表示一覧部分 -->
    <div id="item-table-body" class="pb-2"
      :class="{ 'ml-3': multiLine && !isMobile, 'table-mode': !multiLine, 'px-2': isMobile }">
      <!-- 一列表示モード用 装備ステータスヘッダー部分 -->
      <div v-if="!multiLine && !isMobile && viewItems.length" class="item-status-header">
        <div class="header-sort">
          <v-btn icon x-small @click="sortDialog = true">
            <v-icon size="16">mdi-sort</v-icon>
          </v-btn>
        </div>
        <div class="item-status text-left flex-grow-1" @click="toggleSortKey('name')" @keypress="toggleSortKey('name')"
          :class="{ desc: sortKey === 'name' && isDesc, asc: sortKey === 'name' && !isDesc }">
          <div><span class="header-arrow">↓</span>{{ $t(`Common.装備名称`) }}</div>
        </div>
        <div v-if="isBatchMode" class="batch-index-header" />
        <div v-if="isStockOnly" class="item-remodel-header" />
        <div v-if="isStockOnly && !isEnemyMode" class="item-count-header">{{ $t("ItemList.所持") }}</div>
        <div v-for="(data, i) in headerItems" :key="`item${i}`" @click="toggleSortKey(data.key)"
          @keypress="toggleSortKey(data.key)" :class="itemHeaderClasses(data.key, viewStatus)">
          <div><span class="header-arrow">↓</span>{{ $t(`Common.${data.text}`) }}</div>
        </div>
        <div @click="toggleSortKey('airPower')" @keypress="toggleSortKey('airPower')"
          :class="itemHeaderClasses('airPower', viewStatus)">
          <div>
            <span class="header-arrow">↓</span>{{ $t("Common.制空") }}
            <span class="header-slot">{{ $t("Common.x機", { number: slot }) }}</span>
          </div>
        </div>
        <div @click="toggleSortKey('defenseAirPower')" @keypress="toggleSortKey('defenseAirPower')"
          :class="itemHeaderClasses('defenseAirPower', viewStatus)">
          <div>
            <span class="header-arrow">↓</span>{{ $t("Common.防空制空") }}
            <span class="header-slot">{{ $t("Common.x機", { number: slot }) }}</span>
          </div>
        </div>
      </div>
      <!-- 装備表示部分 -->
      <div v-for="(data, i) in itemListData" :key="i">
        <div class="type-divider" v-if="multiLine && !isMobile">
          <div class="caption text--secondary">{{ $t(`EType.${data.typeName}`) }}</div>
          <div class="type-divider-border" />
        </div>
        <div class="type-item-container"
          :class="{ multi: multiLine, 'batch-mode': isBatchMode, 'batch-max': isBatchListMax }">
          <div class="list-item-container" v-if="!multiLine && !isMobile && data.items.length">
            <!-- 一列表示モードの場合の装備個別表示処理コチラ -->
            <div v-for="(item, i) in data.items" :key="`item-${i}`"
              v-ripple="{ class: item.count ? 'info--text' : 'red--text' }" class="list-item single" :class="{
                'no-stock': !item.count,
                'has-bonus': !isCheckedOnly && item.sumBonus,
                'has-bad-bonus': !isCheckedOnly && item.sumBonus < 0,
                'ignore-bonus': sortExcludeSynergyStatus,
                selected: item.batchListIndexes.length,
                disabled: !isCheckedOnly && item.disabled,
                'lack-remodel': item.lackRemodel,
                'detail-target': isDetailTarget(item),
              }" @click="clickedItem(item, $event)" @keypress.enter="clickedItem(item, $event)"
              @mouseenter="previewItem(item)" @focus="previewItem(item)" @contextmenu="showItemMenu(item, $event)">
              <div>
                <div>
                  <v-img :src="`./img/type/icon${item.item.data.iconTypeId}.png`" height="30" width="30" />
                </div>
              </div>
              <div class="item-name-container" :class="{ 'is-special': item.item.data.isSpecial }"
                @mouseenter="bootTooltip(item.item, item.bonus, $event)" @mouseleave="clearTooltip"
                @focus="previewItem(item); bootTooltip(item.item, item.bonus, $event)" @blur="clearTooltip">
                <div class="text-truncate">
                  {{ needTrans ? $t(`${item.item.data.name}`) : item.item.data.name }}
                </div>
                <!-- 秋刀魚特効表示特別対応 -->
                <v-icon v-if="item.text[0] === 'Saury'" class="saury-bonus" small
                  :color="$vuetify.theme.dark ? 'light-blue lighten-3' : 'light-blue lighten-2'">mdi-fish mdi-rotate-315</v-icon>
                <template v-else>
                  <span v-for="text in item.text" :key="text" class="item-special-text"
                    :class="specialTextColorByText(text)">{{ text }}</span>
                </template>
              </div>
              <div v-if="!isCheckedOnly && item.sumBonus" class="bonus-icon">
                <v-icon v-if="item.sumBonus < 0" color="red lighten-1">mdi-chevron-double-down</v-icon>
                <v-icon v-else-if="item.sumBonus <= 2" :color="item.batchListIndexes.length ? 'success' : 'light-blue'"
                  class="pt-1">mdi-chevron-up</v-icon>
                <v-icon v-else-if="item.sumBonus <= 5"
                  :color="item.batchListIndexes.length ? 'success' : 'light-blue'">mdi-chevron-double-up</v-icon>
                <v-icon v-else
                  :color="item.batchListIndexes.length ? 'success' : 'light-blue'">mdi-chevron-triple-up</v-icon>
              </div>
              <div class="item-tail">
                <div v-if="isBatchMode" class="batch-index-container">
                  <div v-for="value in item.batchListIndexes" class="batch-index" :key="value">
                    {{ isShipMode && value + 1 === batchMax ? $t("ItemList.補") : value + 1 }}
                  </div>
                </div>
                <div class="item-remodel caption" v-if="isStockOnly">
                  <template v-if="item.remodel > 0">
                    <v-icon small>mdi-star</v-icon>
                    <span>{{ item.remodel }}</span>
                  </template>
                </div>
                <div class="item-count caption" v-if="isStockOnly && !isEnemyMode">&times;{{ item.count }}</div>
              </div>
              <div v-for="key in viewStatus" class="item-status" :class="{ sorted: key === sortKey }"
                :key="`status${key}`">
                <div v-if="barWidth(item, key)" class="status-bar" :class="{ weak: key !== sortKey }"
                  :style="{ width: `${barWidth(item, key)}%` }" />
                <span class="item-status-value">{{ formatStatus(item, key) }}</span>
                <span v-if="!isCheckedOnly && statusBonus(item, key)" class="status-bonus"
                  :class="{ minus: statusBonus(item, key) < 0 }">{{ statusBonus(item, key) > 0 ? '+' : '' }}{{
                    statusBonus(item, key) }}                </span>
              </div>
            </div>
          </div>
          <!-- 複数列表示モードの場合の装備個別表示処理コチラ(あとスマホ) -->
          <template v-else>
            <div v-for="(v, i) in data.items" :key="i" v-ripple="{ class: v.count ? 'info--text' : 'red--text' }"
              class="list-item" :class="{
                'no-stock': !v.count,
                'has-bonus': !isCheckedOnly && v.sumBonus,
                'has-bad-bonus': !isCheckedOnly && v.sumBonus < 0,
                'ignore-bonus': sortExcludeSynergyStatus,
                mobile: isMobile,
                selected: v.batchListIndexes.length,
                disabled: !isCheckedOnly && v.disabled,
                'lack-remodel': v.lackRemodel,
                'detail-target': isDetailTarget(v),
              }" @click="clickedItem(v, $event)" @keypress.enter="clickedItem(v, $event)"
              @mouseenter="previewItem(v)" @focus="previewItem(v)" @focusin="previewItem(v)"
              @contextmenu="showItemMenu(v, $event)">
              <div>
                <div>
                  <v-img :src="`./img/type/icon${v.item.data.iconTypeId}.png`" height="30" width="30" />
                </div>
              </div>
              <div class="flex-grow-1" :class="{ 'min-width-0': isMobile }">
                <div class="d-flex align-center">
                  <div class="item-name-container" :class="{ 'is-special': v.item.data.isSpecial }"
                    @mouseenter="bootTooltip(v.item, v.bonus, $event)" @mouseleave="clearTooltip"
                    @focus="previewItem(v); bootTooltip(v.item, v.bonus, $event)" @blur="clearTooltip">
                    <div class="text-truncate">
                      {{ needTrans ? $t(`${v.item.data.name}`) : v.item.data.name }}
                    </div>
                    <!-- 秋刀魚特効表示特別対応 -->
                    <v-icon v-if="v.text[0] === 'Saury'" class="saury-bonus" small
                      :color="$vuetify.theme.dark ? 'light-blue lighten-3' : 'light-blue lighten-2'">mdi-fish mdi-rotate-315</v-icon>
                    <template v-else>
                      <span v-for="text in v.text" :key="text" class="item-special-text"
                        :class="specialTextColorByText(text)">{{ text }}</span>
                    </template>
                  </div>
                  <div v-if="!isCheckedOnly && v.sumBonus && !isMobile" class="bonus-icon">
                    <v-icon v-if="v.sumBonus < 0" color="red lighten-1">mdi-chevron-double-down</v-icon>
                    <v-icon v-else-if="v.sumBonus <= 2" :color="v.batchListIndexes.length ? 'success' : 'light-blue'"
                      class="pt-1">mdi-chevron-up</v-icon>
                    <v-icon v-else-if="v.sumBonus <= 5"
                      :color="v.batchListIndexes.length ? 'success' : 'light-blue'">mdi-chevron-double-up</v-icon>
                    <v-icon v-else
                      :color="v.batchListIndexes.length ? 'success' : 'light-blue'">mdi-chevron-triple-up</v-icon>
                  </div>
                  <div class="item-tail">
                    <div v-if="isBatchMode" class="batch-index-container">
                      <div v-for="value in v.batchListIndexes" class="batch-index" :key="value">
                        {{ isShipMode && value + 1 === batchMax ? $t("ItemList.補") : value + 1 }}
                      </div>
                    </div>
                    <div class="item-remodel caption" v-if="isStockOnly && v.remodel > 0">
                      <v-icon small>mdi-star</v-icon>
                      <span>{{ v.remodel }}</span>
                    </div>
                    <div class="item-count caption" v-if="isStockOnly && !isEnemyMode">
                      <span>&times;</span>
                      <span>{{ v.count }}</span>
                    </div>
                  </div>
                </div>
                <div class="mobile-sub-status" v-if="isMobile">
                  <div v-for="key in mobileSubStatusKeys" class="mobile-sub-status-value" :key="`status${key}`">
                    <div class="sub-status-header">{{ $t(`Statuses.${key}`) }}</div>
                    <div>
                      {{ formatStatus(v, key) }}
                      <span v-if="!isCheckedOnly && statusBonus(v, key)" class="status-bonus"
                        :class="{ minus: statusBonus(v, key) < 0 }">{{ statusBonus(v, key) > 0 ? '+' : '' }}{{
                          statusBonus(v, key) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="isMobile && mobileHighlightKey" class="mobile-sort-value">
                <div class="mobile-sort-number">
                  {{ formatStatus(v, mobileHighlightKey) }}
                  <span v-if="!isCheckedOnly && statusBonus(v, mobileHighlightKey)" class="status-bonus"
                    :class="{ minus: statusBonus(v, mobileHighlightKey) < 0 }">{{ statusBonus(v, mobileHighlightKey) > 0 ? '+' : '' }}{{
                      statusBonus(v, mobileHighlightKey) }}</span>
                </div>
                <div class="mobile-sort-label">{{ $t(`Statuses.${mobileHighlightKey}`) }}</div>
              </div>
              <button v-if="isMobile" type="button" class="item-menu-button" :title="$t('ItemList.メニュー')"
                @click.stop="openItemMenu(v, $event)" @keypress.stop @mousedown.stop @touchstart.stop>
                <v-icon small>mdi-dots-horizontal</v-icon>
              </button>
            </div>
          </template>
        </div>
      </div>
      <div v-show="viewItems.length === 0" class="body-2 text-center mt-6">
        <div>{{ $t("Common.探したけど見つからなかったよ") }}&#128546;</div>
        <v-btn v-if="hasActiveFilter" class="mt-3" small outlined color="primary" @click="resetAllFilter()">
          {{ $t("ItemList.条件をリセット") }}
        </v-btn>
      </div>
    </div>
    <item-list-detail-pane v-if="showDetailPane" />
    </div>
    <div v-if="isMobile && isBatchMode" class="mobile-batch-bar">
      <div>
        <div class="caption text--secondary">{{ $t("ItemList.一括配備") }}</div>
        <div class="body-2 font-weight-medium">{{ batchList.length }} / {{ batchMax }} {{ $t("ItemList.選択中") }}</div>
      </div>
      <v-spacer />
      <v-btn color="primary" :disabled="!batchList.length" @click="close()">{{ $t("Common.配備") }}</v-btn>
    </div>
    <v-menu v-model="showMenu" :position-x="menuX" :position-y="menuY" absolute offset-y>
      <v-list dense class="caption" v-if="menuItem">
        <v-list-item link @click="compareItem()" :disabled="!isAirbaseMode && !isShipMode">{{ $t("ItemList.装備比較")
        }}</v-list-item>
        <v-list-item link @click="clickedItem(menuItem, $event)">{{ $t("Common.配備") }}</v-list-item>
        <v-menu v-model="remodelChangeMenu" offset-x max-width="72" v-if="isStockOnly && !isReadonlyMode">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item link v-bind="attrs" v-on="on">{{ $t("ItemList.改修値変更") }}</v-list-item>
          </template>
          <v-list dense class="caption">
            <v-list-item link v-for="remodel in 11" :key="`change-remodel-${remodel}`"
              @click="changeRemodel(menuItem.item, 11 - remodel)">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ 11 - remodel }}</span>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-list-item link @click="copyItemName()">
          {{ $t("ItemList.装備名コピー") }}
          <input id="item-name-box" readonly :value="menuItem.item.data.name" />
        </v-list-item>
        <v-list-item link @click="openWiki(menuItem.item.data)" :disabled="menuItem.item.data.isEnemyItem">{{
          $t("ItemList.wikiを開く") }}</v-list-item>
        <v-list-item link @click="showMenu = false">{{ $t("ItemList.メニューを閉じる") }}</v-list-item>
      </v-list>
    </v-menu>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition"
      :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" :bonus="tooltipBonus" :is-airbase-mode="isAirbaseMode" />
    </v-tooltip>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="auto" scrollable>
      <v-card class="pa-3">
        <div class="mx-4 my-2">
          <div>{{ $t("Common.既に配備されています。") }}</div>
          <div class="caption mt-2">※ {{ $t("Common.配備を押せば無視して配備できます。") }}</div>
        </div>
        <v-divider />
        <template v-if="confirmFleets.some(v => v.ships.length)">
          <div class="mt-2 ml-4 caption">{{ $t("ItemList.この装備を搭載している艦") }}</div>
          <div class="detected-parents px-4">
            <div v-for="fleet in confirmFleets" :key="`fleet${fleet.fleet}`">
              <template v-if="fleet.ships.length">
                <div class="caption text--secondary">{{ $t("Fleet.第x艦隊", { number: fleet.fleet + 1 }) }}</div>
                <div class="detected-ships-container mb-2">
                  <div v-for="ship in fleet.ships" :key="`ship${ship.ship.data.id}`">
                    <div class="d-flex align-center">
                      <div class="ship-img mb-1">
                        <img :src="`./img/ship/banner/${ship.ship.data.id}.png`" :alt="`ship${ship.ship.data.id}`" />
                      </div>
                      <div class="flex-grow-1 ml-1">
                        <div class="d-flex ship-caption">
                          <div class="primary--text ship-level">
                            Lv {{ ship.ship.level }}
                          </div>
                        </div>
                        <div class="d-flex">
                          <div class="ship-name text-truncate">{{ getShipName(ship.ship.data) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
        <template v-if="confirmAirbases.length">
          <div class="px-4">
            <div class="caption text--secondary">{{ $t("Airbase.基地航空隊") }}</div>
            <div v-for="airbase in confirmAirbases" :key="`airbase${airbase.no}`">
              <div class="d-flex align-center">
                <div class="ship-img mb-1">
                  <img :src="`./img/util/airbase.png`" :alt="`airbase`" />
                </div>
                <div class="body-2 ml-1">{{ $t("Airbase.第x基地航空隊", { number: airbase.no + 1 }) }}</div>
              </div>
            </div>
          </div>
        </template>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark @click.stop="clickedItem(confirmItem, $event)">{{ $t("Common.配備")
          }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="blacklistDialog" width="960" @input="toggleBlacklistDialog" :fullscreen="isMobile">
      <blacklist-item-edit :handle-close="closeBlacklist" />
    </v-dialog>
    <item-list-sheets />
    <v-dialog v-model="compareDialog" transition="scroll-x-transition" width="auto">
      <v-card class="compare-dialog" v-if="menuItem">
        <div class="compare-dialog-header">
          <div class="compare-dialog-title">{{ $t("ItemList.装備比較") }}</div>
          <v-btn class="ml-auto" icon small @click="compareDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <item-compare :target-item="menuItem.item" :item-parent="itemParent" :slot-index="slotIndex"
          :is-airbase-mode="isAirbaseMode"></item-compare>
        <div class="compare-dialog-footer">
          <v-checkbox class="compare-keep" v-model="setting.showItemCompareDialog" @click="toggleCompareSetting" hide-details dense
            :label="$t('ItemList.装備選択時は常に表示する')" />
          <div class="compare-dialog-actions">
            <button v-if="!isBatchMode" type="button" class="compare-equip" @click.stop="clickedItem(menuItem, $event)">
              {{ $t("Common.配備") }}
            </button>
            <button type="button" class="compare-dismiss" @click.stop="compareDialog = false">{{ $t("Common.閉じる") }}</button>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <div class="hint-footer" :class="{ 'with-pane': showDetailPane }" v-if="!isEnemyMode && isJapanese">
      <div class="caption d-none d-md-block text--secondary">Ctrlキー + 装備をクリックでwikiを展開します。</div>
    </div>
  </v-card>
</template>

<style scoped>
.list-card {
  --accent: #14b8a6;
  --accent-text: #0f766e;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
}

.theme--dark .list-card,
.theme--dark.list-card {
  --accent-text: #5eead4;
}

#item-table-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 599px) {
  .list-card {
    height: 100%;
    max-height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .list-toolbar {
    flex-shrink: 0;
  }

  .list-main {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  #item-table-body {
    flex: 1 1 auto;
    min-height: 0;
  }
}

@media (min-width: 600px) {
  .list-card {
    display: block;
    flex-direction: unset;
    position: relative;
    height: unset;
  }

  #item-table-body {
    height: 65vh;
  }

  .item-search-text {
    width: 168px;
    min-width: 140px;
    flex-shrink: 1;
  }
}

.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 8px 8px 12px;
}

.toolbar-filter,
.toolbar-tools {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.toolbar-tools {
  margin-left: auto;
}

.item-search-text >>> .v-input {
  margin-top: 0;
  padding-top: 0;
}

.item-search-text >>> .v-input__slot {
  margin-bottom: 0;
  min-height: 32px !important;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 16px;
}

.item-search-text >>> .v-input__slot::before,
.item-search-text >>> .v-input__slot::after {
  border-style: none !important;
}

.item-search-text >>> .v-input__prepend-inner,
.item-search-text >>> .v-input__append-inner {
  margin-top: 0 !important;
  align-self: center;
}

.item-search-text >>> input {
  font-size: 12px;
}

.item-search-text >>> .v-icon {
  font-size: 16px !important;
  height: 16px;
  width: 16px;
}

.status-filter {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 32px;
  padding: 0 4px 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 16px;
}

.status-filter.active {
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
}

.status-filter >>> .v-input {
  margin-top: 0;
  padding-top: 0;
}

.status-filter >>> .v-input__slot {
  margin-bottom: 0;
  min-height: 28px !important;
}

.status-filter >>> .v-input__slot::before,
.status-filter >>> .v-input__slot::after {
  border-style: none !important;
}

.status-filter >>> .v-select__selections,
.status-filter >>> input {
  font-size: 12px;
}

.status-filter >>> .v-input__append-inner {
  margin-top: 2px !important;
}

.status-filter-key {
  flex: 0 0 108px;
  width: 108px;
}

.status-filter-value {
  flex: 0 0 44px;
  width: 44px;
}

.status-filter-value >>> input {
  text-align: right;
}

.status-filter-value >>> input::-webkit-outer-spin-button,
.status-filter-value >>> input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.status-filter-spin {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 16px;
  height: 26px;
  margin-left: 1px;
}

.status-filter-spin button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.status-filter-spin button:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
}

.status-filter-spin button:disabled {
  opacity: 0.3;
}

.status-filter-spin >>> .v-icon {
  font-size: 12px !important;
  height: 12px;
  width: 12px;
}

.status-filter-op {
  flex-shrink: 0;
  margin: 0 4px;
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
}

.status-filter-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 2px;
  border-radius: 11px;
  color: var(--accent-text);
}

.status-filter-clear:hover {
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
}

.status-save-button {
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border: 1px dashed color-mix(in srgb, var(--accent) 70%, transparent);
  border-radius: 16px;
  background-color: transparent;
  color: var(--accent-text);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.status-save-button:hover {
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
}

.toolbar-stock {
  flex-shrink: 0;
  margin-top: 0;
  padding-top: 0;
}

.toolbar-stock >>> .v-input--selection-controls__input {
  margin-right: 2px;
}

.toolbar-stock >>> label {
  font-size: 12px;
}

.view-toggle {
  flex-shrink: 0;
  height: 32px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 16px;
}

.view-toggle >>> .v-btn {
  height: 30px !important;
  min-width: 36px !important;
  width: 36px;
  background-color: transparent !important;
  color: inherit !important;
  opacity: 0.5;
}

.view-toggle >>> .v-btn.active {
  opacity: 1;
  background-color: color-mix(in srgb, var(--accent) 18%, transparent) !important;
  color: var(--accent-text) !important;
}

.view-toggle >>> .v-btn::before {
  opacity: 0 !important;
}

.item-filter-container {
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
}

.preset-group:not(.own) {
  display: contents;
}

.preset-group:not(.own) .preset-chips {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.preset-group.own {
  order: -1;
  flex: 0 0 100%;
  max-width: 100%;
}

.preset-group.own .preset-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.preset-pop-enter-active {
  position: relative;
  z-index: 2;
  animation: preset-drop 0.48s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.preset-pop-leave-active {
  position: absolute;
  z-index: 2;
  animation: preset-lift 0.2s ease both;
}

@keyframes preset-drop {
  from {
    opacity: 0.4;
    transform: translateY(-46px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes preset-lift {
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}

@media (prefers-reduced-motion: reduce) {
  .preset-pop-enter-active,
  .preset-pop-leave-active {
    animation: none;
  }
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  position: relative;
}

.item-filter-container>>>.v-input--switch label {
  font-size: 12px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 13px;
  background-color: transparent;
  color: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.filter-chip:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.filter-chip.active {
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent-text);
}

.filter-chip.active>>>.v-icon {
  color: inherit;
}

.preset-chip {
  padding: 0 4px 0 0;
  gap: 0;
  cursor: default;
}

.filter-chip.preset-pop-enter-active {
  background-color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
}

.theme--dark .filter-chip.preset-pop-enter-active {
  background-color: rgb(40, 40, 45);
}

.preset-apply,
.preset-remove {
  display: inline-flex;
  align-items: center;
  height: 24px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.preset-apply {
  padding: 0 2px 0 10px;
}

.preset-remove {
  justify-content: center;
  width: 18px;
  border-radius: 9px;
  opacity: 0.6;
}

.preset-remove:hover {
  opacity: 1;
  background-color: color-mix(in srgb, var(--accent) 22%, transparent);
}

.filter-tri {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-tri-label {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
}

.filter-segmented {
  display: inline-flex;
  height: 26px;
  padding: 2px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 13px;
}

.filter-segmented button {
  padding: 0 8px;
  border-radius: 11px;
  background-color: transparent;
  color: inherit;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0.75;
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.filter-segmented button:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.filter-segmented button.active {
  opacity: 1;
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent-text);
}

.filter-separator {
  width: 1px;
  height: 18px;
  margin: 0 2px;
  background-color: rgba(128, 128, 128, 0.4);
}

.filter-separator.preset-separator {
  height: 14px;
  margin: 0;
  background-color: rgba(128, 128, 128, 0.32);
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.filter-count {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.type-count {
  align-self: center;
  margin-left: auto;
  padding-right: 12px;
}

.type-selector-container {
  padding-top: 4px;
  padding-bottom: 4px;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.type-selector-container.mobile {
  flex-shrink: 0;
  flex-wrap: wrap;
}

.type-selector {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 34px;
  min-width: 36px;
  padding: 0 3px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 11px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.type-selector .type-icon {
  flex: 0 0 auto;
}

.type-selector:hover {
  background-color: color-mix(in srgb, var(--accent) 12%, transparent);
}

.type-selector.active {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
}

.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
}

.type-selector.batch-max {
  opacity: 0.4;
}

.type-all-text {
  padding: 0 5px;
  font-weight: bold;
}

.type-divider {
  margin-top: 1.25rem;
  display: flex;
  width: 100%;
}

.type-divider-border {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.type-item-container.multi {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .type-item-container.multi {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 880px) {
  .type-item-container.multi {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (min-width: 1100px) {
  .type-item-container.multi {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.list-item {
  position: relative;
  display: flex;
  cursor: pointer;
  margin-left: 1px;
  margin-bottom: 1px;
  padding-left: 0.25rem;
  padding-right: 0.1rem;
  transition: 0.1s;
  border-radius: 0.2rem;
  border: 1px solid transparent;
  user-select: none;
}

.list-item:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.list-item.single {
  margin: 1px;
  padding-right: 12px;
  padding-left: 12px;
}

.list-item.mobile {
  min-height: 56px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
}

.min-width-0 {
  min-width: 0;
}

.mobile-summary-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-top: 1px solid rgba(128, 128, 128, 0.35);
}

.mobile-sort-value {
  flex-shrink: 0;
  min-width: 44px;
  margin-left: 4px;
  text-align: right;
}

.mobile-sort-number {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.mobile-sort-label {
  margin-top: 1px;
  font-size: 10px;
  color: var(--accent-text);
}

.mobile-batch-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.type-item-container .list-item.no-stock:not(.selected) {
  opacity: 0.72;
}

.list-item.no-stock:hover {
  background-color: rgba(255, 128, 128, 0.1);
}

.no-stock .item-name-container {
  color: #ff6464;
}

.list-item.has-bonus {
  border-color: rgba(3, 169, 244, 0.8);
  border-bottom-left-radius: 0.2rem;
  border-bottom-right-radius: 0.2rem;
}

.list-item.single.has-bonus {
  padding-left: 6px;
  border-left: 6px solid rgba(3, 169, 244, 0.8);
}

.list-item.has-bonus.has-bad-bonus {
  border-color: rgba(239, 83, 80, 0.8);
}

.list-item.has-bonus.ignore-bonus {
  border-color: rgba(3, 169, 244, 0.4);
}

.list-item.has-bonus.has-bad-bonus.ignore-bonus {
  border-color: rgba(239, 83, 80, 0.4);
}

.bonus-icon {
  position: absolute;
  left: -4px;
  bottom: -4px;
  font-size: 0.8em;
  filter: drop-shadow(0 0 2px #fff);
}

.theme--dark .bonus-icon {
  filter: drop-shadow(0 0 2px #000);
}

.ignore-bonus .bonus-icon {
  opacity: 0.4;
}

.list-item>div {
  align-self: center;
}

.item-name-container {
  display: flex;
  align-items: center;
  flex-grow: 1;
  font-size: 0.82em;
  width: 10px;
  height: 34px;
  margin-left: 0.1rem;
}

.mobile .item-name-container {
  font-size: 14px;
  height: unset;
}

.is-special {
  color: #3cac42;
}

.theme--dark .is-special {
  color: #66bb6a;
}

.lack-remodel .item-name-container {
  color: #ff6964;
}

.item-remodel,
.item-remodel-header {
  flex-shrink: 0;
  width: 36px;
  white-space: nowrap;
}

.list-item:not(.single) .item-remodel {
  display: inline-flex;
  align-items: center;
  width: 30px;
  margin-right: 4px;
  font-variant-numeric: tabular-nums;
}

.item-remodel {
  color: #00bfa5;
}

.item-remodel>>>.v-icon {
  color: #00bfa5;
}

.lack-remodel .item-remodel {
  color: #ff6464;
}

.lack-remodel .item-remodel>>>.v-icon {
  color: #ff6464;
}

.opacity0 {
  opacity: 0;
}

.item-count,
.item-count-header {
  flex-shrink: 0;
  width: 32px;
  text-align: right;
  white-space: nowrap;
}

.list-item:not(.single) .item-count {
  width: 24px;
  text-align: right;
}

.item-count {
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.no-stock .item-count {
  opacity: 1;
  color: #ff6464;
  font-weight: 700;
}

.item-count-header {
  font-size: 11px;
  font-weight: 500;
}

.item-special-text {
  flex-shrink: 0;
  margin-left: 4px;
  padding: 0 4px;
  min-width: 22px;
  border: 1px solid #2196F3;
  border-radius: 4px;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  /** 装備名の特殊色（緑）を引き継がない */
  color: rgba(0, 0, 0, 0.87);
}

.theme--dark .item-special-text {
  color: rgba(255, 255, 255, 0.92);
}

/* テキスト内容に応じた色（頻出順で主要色を割り当て） */
.item-special-text.color-A3 { border-color: #2196F3; }
.item-special-text.color-C2 { border-color: #4CAF50; }
.item-special-text.color-A2 { border-color: #F44336; }
.item-special-text.color-C3 { border-color: #FF9800; }
.item-special-text.color-A1 { border-color: #3F51B5; }
.item-special-text.color-B1 { border-color: #009688; }
.item-special-text.color-B2 { border-color: #9C27B0; }
.item-special-text.color-B3 { border-color: #757575; }
.item-special-text.color-B4 { border-color: #535353; }

.batch-mode .list-item {
  opacity: 0.8;
}

.batch-mode .list-item.selected {
  border-color: #4caf50;
  opacity: 1;
}

.batch-mode .list-item .item-name {
  position: relative;
}

.item-tail {
  display: flex;
  align-items: center;
  align-self: center;
  flex-shrink: 0;
}

.batch-index-header,
.batch-mode .batch-index-container {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  width: max-content;
  min-width: 20px;
  margin-right: 4px;
}

.batch-mode .batch-index {
  z-index: 1;
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
  background-color: #4caf50;
}

.batch-mode .list-item.disabled .item-name-container {
  color: rgb(255, 100, 100);
}

.batch-mode.batch-max .list-item.disabled {
  opacity: 0.4;
}

.saury-bonus {
  flex-shrink: 0;
  margin-left: 4px;
}

.item-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.35);
  /** 追従するためカードと同じ不透明色 */
  background-color: #fff;
  color: rgba(0, 0, 0, 0.72);
  position: sticky;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 2;
  top: 0;
  /** 行と同じ左右の余白にしないと、10%列の幅がヘッダーだけ広がる */
  box-sizing: border-box;
  margin: 0 1px;
  padding: 0 12px;
}

.theme--dark .item-status-header {
  background-color: rgb(40, 40, 45);
  color: rgba(255, 255, 255, 0.88);
}

.deep-sea .theme--dark .item-status-header {
  background-color: rgb(36, 44, 54);
  color: rgba(255, 255, 255, 0.88);
}

.header-sort {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
}

.item-status {
  position: relative;
  align-self: center;
  text-align: right;
  width: 10%;
  font-size: 0.8em;
  font-variant-numeric: tabular-nums;
}

.list-item .item-status.sorted {
  font-weight: bold;
}

.list-item.single > .item-status {
  padding-right: 4px;
}

.status-bar {
  position: absolute;
  right: 4px;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--accent) 22%, transparent);
  pointer-events: none;
}

.status-bar.weak {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.item-status-value {
  position: relative;
}

.status-bonus {
  position: relative;
  margin-left: 1px;
  font-size: 10px;
  font-weight: bold;
  color: #039be5;
}

.theme--dark .status-bonus {
  color: #4fc3f7;
}

.status-bonus.minus {
  color: #ef5350;
}

.ignore-bonus .status-bonus {
  opacity: 0.45;
}

.item-status-header .item-status {
  padding-right: 4px;
  font-size: 11px;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
  transition: 0.2s;
  user-select: none;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}

.item-status-header .item-status > div {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item-status-header .item-status:not(.text-left),
.list-item.single > .item-status {
  flex: 0 0 10%;
  min-width: 0;
}

.item-status-header .item-status.text-left {
  justify-content: flex-start;
}

.header-slot {
  margin-left: 2px;
  font-weight: 400;
  opacity: 0.7;
}

.item-status-header .item-status.desc,
.item-status-header .item-status.asc {
  color: var(--accent-text);
  font-weight: 600;
}

.item-status-header .item-status:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.header-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  font-size: 10px;
  opacity: 0;
}

.item-status-header .item-status.desc .header-arrow,
.item-status-header .item-status.asc .header-arrow {
  opacity: 1;
}

.item-status-header .item-status.asc .header-arrow {
  transform: rotate(180deg);
}

.item-menu-button {
  flex-shrink: 0;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 4px;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  transition: opacity 0.12s ease, background-color 0.12s ease;
}

.item-menu-button:hover {
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
}

.list-item.mobile .item-menu-button {
  width: 32px;
  height: 32px;
}

.list-main.with-pane {
  display: flex;
  align-items: stretch;
}

.list-main.with-pane #item-table-body {
  flex: 1;
  min-width: 0;
}

.list-item.detail-target {
  background-color: color-mix(in srgb, var(--accent) 12%, transparent);
}

.hint-footer {
  position: absolute;
  right: 8px;
  bottom: 0;
}

.hint-footer.with-pane {
  right: 276px;
}

#item-name-box {
  height: 1px;
  width: 1px;
  opacity: 0;
}

.compare-dialog {
  --accent: #14b8a6;
  --accent-text: #0f766e;
  width: min(1040px, calc(100vw - 48px));
  border-radius: 16px !important;
  overflow: hidden;
}

.theme--dark .compare-dialog,
.compare-dialog.theme--dark {
  --accent-text: #5eead4;
}

.compare-dialog-header {
  display: flex;
  align-items: center;
  padding: 8px 8px 0 16px;
}

.compare-dialog-title {
  font-size: 14px;
  font-weight: 600;
}

.compare-dialog-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 8px 16px 12px;
  border-top: 1px solid rgba(128, 128, 128, 0.28);
}

.compare-keep {
  margin-top: 0;
  padding-top: 0;
}

.compare-keep >>> .v-label {
  font-size: 12px;
}

.compare-dialog-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.compare-equip,
.compare-dismiss {
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}

.compare-equip {
  border: none;
  background-color: var(--accent);
  color: #042f2e;
  font-weight: 600;
}

.compare-equip:hover {
  filter: brightness(1.08);
}

.compare-dismiss {
  border: 1px solid rgba(128, 128, 128, 0.4);
  background: transparent;
  color: inherit;
}

.compare-dismiss:hover {
  background-color: rgba(128, 128, 128, 0.12);
}

/** スマホ版表示 */
.mobile-sub-status {
  margin-top: 2px;
  margin-left: 0.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.mobile-sub-status-value {
  display: flex;
  align-items: center;
  font-size: 11px;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}

.sub-status-header {
  opacity: 0.7;
  margin-right: 4px;
  font-size: 11px;
}

.detected-parents {
  max-height: 50vh;
  overflow-y: auto;
}

.detected-ships-container {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 2px;
  column-gap: 0.25rem;
}

@media (min-width: 600px) {
  .detected-ships-container {
    display: grid;
    grid-template-columns: 220px 220px;
    column-gap: 0.25rem;
  }
}

.ship-img {
  height: 30px;
}

.ship-img img {
  height: 30px;
  width: 120px;
}

.ship-caption {
  font-size: 11px;
  margin-left: 0.1rem;
}

.ship-level {
  min-width: 36px;
}

.ship-name {
  flex-grow: 1;
  font-size: 0.8em;
  width: 10px;
  margin-left: 0.1rem;
  overflow: hidden;
  white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import ItemCompare from '@/components/item/ItemCompare.vue';
import BlacklistItemEdit from '@/components/item/BlacklistItemEdit.vue';
import ItemListDetailPane from '@/components/item/list/ItemListDetailPane.vue';
import ItemListSheets from '@/components/item/list/ItemListSheets.vue';
import ItemMaster from '@/classes/item/itemMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';
import Item from '@/classes/item/item';
import SiteSetting, { isItemStatusFilterKey, ITEM_STATUS_FILTER_PRESET_LIMIT, ItemStatusFilterPreset } from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import SaveData from '@/classes/saveData/saveData';
import ShipValidation from '@/classes/fleet/shipValidation';
import { cloneDeep } from 'lodash';
import ItemBonus, { ItemBonusStatus } from '@/classes/item/ItemBonus';
import ShipMaster from '@/classes/fleet/shipMaster';

type sortItem = { [key: string]: number | { [key: string]: number } };
type viewItem = {
  item: Item;
  /** 装備個数(表示値) */
  count: number;
  /** 装備個数(実際) */
  allCount: number;
  remodel: number;
  sumBonus: number;
  bonus: ItemBonusStatus;
  text: string[];
  dayBattleFirePower: number;
  aircraftDayBattleFirePower: number;
  /** 一括編成リストのインデックスたち */
  batchListIndexes: number[];
  /** 一括装備モード 搭載不可の場合true */
  disabled: boolean;
  /** 改修値がもう少しあれば搭載できるやつ */
  lackRemodel: boolean;
};

const actualKey = ['tp', 'tp2', 'airPower', 'defenseAirPower', 'antiAirWeight', 'antiAirBonus', 'nightBattleFirePower'];

/** 表示値にそのまま加算されるボーナスのみ対象 対空・砲戦火力・射程は加算のされ方が異なるため除外 */
const statusBonusKeys: { [key: string]: (keyof ItemBonusStatus)[] } = {
  actualFire: ['firePower'],
  actualTorpedo: ['torpedo'],
  nightBattleFirePower: ['firePower', 'torpedo'],
  actualBomber: ['bomber'],
  actualArmor: ['armor'],
  actualAsw: ['asw'],
  actualAvoid: ['avoid'],
  actualAccuracy: ['accuracy'],
  actualScout: ['scout'],
};

const textStatusKeys = ['name', 'id', 'actualRange', 'avoidId'];

/** 3状態フィルタ 0: 指定なし 1: あり 2: なし */
const triStateOptions = [
  { value: 0, text: '指定なし' },
  { value: 1, text: 'あり' },
  { value: 2, text: 'なし' },
];

type PresetResizeObserver = {
  disconnect(): void;
  observe(target: Element): void;
};

type PresetLayoutState = {
  pending: boolean;
  passes: number;
  tops: Map<HTMLElement, number>;
  observer?: PresetResizeObserver;
  observed?: HTMLElement;
  width: number;
};

function createPresetResizeObserver(callback: () => void): PresetResizeObserver {
  const Ctor = (window as unknown as {
    ResizeObserver: new (cb: () => void) => PresetResizeObserver;
  }).ResizeObserver;
  return new Ctor(callback);
}

const presetLayouts = new WeakMap<Vue, PresetLayoutState>();

function presetLayoutOf(vm: Vue): PresetLayoutState {
  let layout = presetLayouts.get(vm);
  if (!layout) {
    layout = {
      pending: false, passes: 0, tops: new Map(), width: 0,
    };
    presetLayouts.set(vm, layout);
  }
  return layout;
}

export default Vue.extend({
  name: 'ItemList',
  components: {
    ItemTooltip, BlacklistItemEdit, ItemCompare, ItemListDetailPane, ItemListSheets,
  },
  provide(): { itemList: Vue } {
    return { itemList: this };
  },
  props: {
    handleEquipItem: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
    handleChangeWidth: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    itemParent: undefined as undefined | Ship | Airbase | Enemy,
    slotIndex: -1,
    sortItemListIndex: 0,
    all: [] as ItemMaster[],
    baseItems: [] as ItemMaster[],
    types: [] as { id: number; text: string; viewStatus: string[]; types: number[]; sortKey: string; isDesc: boolean }[],
    avoids: Const.AVOID_TYPE,
    type: 0,
    multiLine: true,
    keyword: '' as string | undefined,
    isEnemyMode: false,
    isStockOnly: false,
    isReadonlyMode: false,
    isEnabledLandBaseAttack: false,
    includeSonar: true,
    includeDepthCharge: true,
    includeDepthChargeLauncher: true,
    includeTorpedo: true,
    includeSPTorpedo: true,
    includeSVTorpedo: true,
    onlyEnabledLandBaseAttack: false,
    onlyDisabledLandBaseAttack: false,
    onlyAffectingRange: false,
    onlyNotAffectingRange: false,
    onlyNightAircraft: false,
    onlyAAResistAircraft: false,
    isSpecialOnly: false,
    sortExcludeRemodelStatus: false,
    sortExcludeSynergyStatus: false,
    slot: 0,
    avoidTexts: Const.AVOID_TYPE.map((v) => v.text),
    viewStatus: Const.ITEM_TYPES_ALT[0].viewStatus,
    setting: new SiteSetting(),
    sortKey: '',
    isDesc: false,
    viewItems: [] as viewItem[],
    itemStock: [] as ItemStock[],
    usedItems: [] as Item[],
    confirmDialog: false,
    confirmItem: {} as unknown as viewItem,
    confirmFleets: [] as { fleet: number; ships: { ship: Ship; count: number }[] }[],
    confirmAirbases: [] as { no: number; count: number }[],
    headerItems: [
      { text: '火力', key: 'actualFire' },
      { text: '砲戦火力', key: 'dayBattleFirePower' },
      { text: '雷装', key: 'actualTorpedo' },
      { text: '夜戦火力', key: 'nightBattleFirePower' },
      { text: '爆装', key: 'actualBomber' },
      { text: '対空', key: 'antiAir' },
      { text: '出撃対空', key: 'actualAntiAir' },
      { text: '防空対空', key: 'actualDefenseAntiAir' },
      { text: '装甲', key: 'actualArmor' },
      { text: '対潜', key: 'actualAsw' },
      { text: '回避', key: 'actualAvoid' },
      { text: '索敵', key: 'actualScout' },
      { text: '命中', key: 'actualAccuracy' },
      { text: '対爆', key: 'antiBomber' },
      { text: '加重対空', key: 'antiAirWeight' },
      { text: '艦隊防空', key: 'antiAirBonus' },
      { text: '半径', key: 'radius' },
      { text: 'コスト', key: 'cost' },
      { text: 'TP', key: 'tp' },
      { text: 'TP2', key: 'tp2' },
      { text: '射撃回避', key: 'avoidId' },
      { text: '射程', key: 'actualRange' },
    ],
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipBonus: '',
    tooltipX: 0,
    tooltipY: 0,
    filterStatus: 'radius',
    filterStatusItems: [] as { text: string; value: string }[],
    filterStatusValue: 0,
    presetsOnOwnRow: false,
    animatePresetEnter: false,
    sortKeyItems: [] as { text: string; value: string }[],
    blacklistDialog: false,
    blacklistItems: [] as number[],
    sortDialog: false,
    filterDialog: false,
    decidedItem: false,
    wikiDialog: false,
    showMenu: false,
    actionSheet: false,
    remodelChangeMenu: false,
    menuItem: null as viewItem | null,
    menuX: 0,
    menuY: 0,
    compareDialog: false,
    isBatchMode: false,
    batchMax: 0,
    batchList: [] as viewItem[],
    isCheckedOnly: false,
    rangeText: ['', '短', '中', '長', '超長', '超長+', '極', '極+', '極長', '極長+'],
    itemListHeight: 100,
    isMobile: true,
    detailPaneFits: false,
    triStateOptions,
    detailItem: null as Item | null,
    detailBonus: '',
    detailView: null as viewItem | null,
  }),
  mounted() {
    this.types = [];
    for (let i = 0; i < Const.ITEM_TYPES_ALT.length; i += 1) {
      const type = Const.ITEM_TYPES_ALT[i];
      this.types.push({
        id: type.id,
        text: type.text,
        viewStatus: type.viewStatus,
        types: type.types,
        sortKey: '',
        isDesc: false,
      });
    }

    const items = this.$store.state.items as ItemMaster[];
    for (let i = 0; i < items.length; i += 1) {
      this.all.push(items[i]);
    }
    this.all.sort((a, b) => a.apiTypeId - b.apiTypeId);
    this.avoidTexts[0] = '';
    this.setting = this.$store.state.siteSetting as SiteSetting;
    this.changeMultiLine(this.setting.isMultiLineForItemList);

    this.sortKeyItems.push({ text: '図鑑ID', value: 'id' });
    for (let i = 0; i < this.headerItems.length; i += 1) {
      const { text, key } = this.headerItems[i];
      if (text === '対潜' && this.filterStatusItems.find((v) => v.text === this.$t('Common.対潜'))) {
        continue;
      }
      this.filterStatusItems.push({ text: `${this.$t(`Common.${text}`)}`, value: key });
      this.sortKeyItems.push({ text, value: key });
    }

    this.updateIsMobile();
    window.addEventListener('resize', this.onViewportResize);
    this.$nextTick(() => {
      this.ensureFilterRowObserver();
      this.syncPresetPlacement();
    });
  },
  beforeUpdate() {
    const layout = presetLayoutOf(this);
    if (layout.pending) return;
    if (this.isMobile || !this.statusFilterPresets.length) {
      layout.tops.clear();
      return;
    }
    this.captureFilterPositions();
  },
  updated() {
    this.ensureFilterRowObserver();
    this.syncPresetPlacement();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onViewportResize);
    const row = this.$refs.filterRow as HTMLElement | undefined;
    if (row) row.removeEventListener('animationend', this.onPresetAnimationEnd);
    const layout = presetLayoutOf(this);
    if (layout.observer) layout.observer.disconnect();
  },
  watch: {
    confirmDialog(value: boolean) {
      if (value && this.confirmItem) {
        this.confirmFleets = [];
        this.confirmAirbases = [];

        const item = this.confirmItem;
        // 現在の計算画面内で配備されている装備を列挙する
        const mainData = this.$store.state.mainSaveData as SaveData;
        if (mainData) {
          const manager = mainData.tempData[mainData.tempIndex];
          if (manager) {
            // 艦隊データから同じ装備持ってる人を探す
            for (let i = 0; i < manager.fleetInfo.fleets.length; i += 1) {
              const { ships } = manager.fleetInfo.fleets[i];
              if (!this.confirmFleets[i]) {
                this.confirmFleets[i] = { fleet: i, ships: [] };
              }
              for (let j = 0; j < ships.length; j += 1) {
                const ship = ships[j];
                const equippedItems = ship.items.concat(ship.exItem);
                if (ship.isActive) {
                  const items = equippedItems.filter((v) => v.data.id === item.item.data.id && v.remodel === item.item.remodel);
                  if (items.length) {
                    this.confirmFleets[i].ships.push({ ship, count: items.length });
                  }
                }
              }
            }

            // 基地航空隊データから装備全取得
            const { airbases } = manager.airbaseInfo;
            for (let i = 0; i < airbases.length; i += 1) {
              const airbase = airbases[i];
              const items = airbase.items.filter((v) => v.data.id === item.item.data.id && v.remodel === item.item.remodel);
              if (items.length) {
                this.confirmAirbases.push({ no: i, count: items.length });
              }
            }
          }
        }
      }
    },
  },
  computed: {
    isAirbaseMode(): boolean {
      return this.itemParent instanceof Airbase;
    },
    isShipMode(): boolean {
      return this.itemParent instanceof Ship;
    },
    isAircraftMode(): boolean {
      return this.itemParent instanceof Ship && (this.itemParent.data.isCV || [352, 717, 1008].includes(this.itemParent.data.id));
    },
    itemListData(): { typeName: string; items: viewItem[] }[] {
      const targetItems = this.viewItems;
      if (this.multiLine && !this.isMobile) {
        const depthChargeLauncher = { id: 1700, name: '爆雷投射機', sortKey: [] };
        // 種別に応じて分けたい
        const types = Const.ITEM_API_TYPE.concat();
        types.splice(22, 0, depthChargeLauncher);
        const resultItems = [];
        for (let i = 0; i < types.length; i += 1) {
          const type = types[i];
          let items = [];

          // 爆雷関係でちょっと分ける
          if (type.id === 15) {
            items = targetItems.filter((v) => v.item.data.isStrictDepthCharge);
          } else if (type.id === depthChargeLauncher.id) {
            items = targetItems.filter((v) => v.item.data.apiTypeId === 15 && !v.item.data.isStrictDepthCharge);
          } else {
            items = targetItems.filter((v) => v.item.data.apiTypeId === type.id);
          }
          if (items.length) {
            // 存在する種別を生成
            resultItems.push({ typeName: type.name, items });
          }
        }
        return resultItems;
      }

      // 複数列モードじゃないならなかよし
      return [{ typeName: '', items: targetItems }];
    },
    enabledTypes() {
      const apis = this.baseItems.map((v) => v.apiTypeId);
      const enabledItems = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const d = this.types[i].types;
        if (apis.find((api) => d.includes(api))) {
          enabledItems.push(this.types[i]);
        }
      }
      return enabledItems;
    },
    selectedType(): { id: number; text: string; viewStatus: string[]; types: number[]; sortKey: string; isDesc: boolean } | undefined {
      const selected = this.types.find((v) => v.id === this.type);
      if (selected) {
        return selected;
      }
      return undefined;
    },
    viewOrder() {
      return (key: string, items: string[]) => items.findIndex((v) => v === key);
    },
    itemHeaderClasses() {
      return (key: string, items: string[]) => {
        const classes: string[] = ['item-status'];
        if (key === this.sortKey && this.isDesc) classes.push('desc');
        else if (key === this.sortKey && !this.isDesc) classes.push('asc');

        const index = items.findIndex((v) => v === key);
        if (index >= 0) {
          classes.push(`order-${index}`);
        } else {
          classes.push('d-none');
        }
        return classes;
      };
    },
    mobileItemHeaderText() {
      return (key: string, items: string[]) => {
        const classes: string[] = ['item-status'];
        if (key === this.sortKey && this.isDesc) classes.push('desc');
        else if (key === this.sortKey && !this.isDesc) classes.push('asc');

        const index = items.findIndex((v) => v === key);
        if (index >= 0) {
          classes.push(`order-${index}`);
        } else {
          classes.push('d-none');
        }
        return classes;
      };
    },
    formatStatus() {
      return (v: viewItem, key: string) => {
        const item = v.item as unknown as sortItem;
        let value = 0;
        if (key === 'dayBattleFirePower') {
          // 昼火力
          value = this.isAircraftMode ? v.aircraftDayBattleFirePower : v.dayBattleFirePower;
        } else if (key === 'antiAirBonus') {
          // 艦隊防空 /100する
          value = v.item.antiAirBonus / 100;
        } else if (key === 'actualRange') {
          // 射程 テキスト表示が必要なため別対応
          return this.rangeText[v.item.actualRange] ? this.$t(`Common.${this.rangeText[v.item.actualRange]}`) : '';
        } else if (key === 'avoidId') {
          // 射撃回避 テキスト表示が必要なため別対応
          return this.avoidTexts[v.item.data.avoidId] ? this.$t(`Common.回避性能.${this.avoidTexts[v.item.data.avoidId]}`) : '';
        } else if (key && (key.includes('actual') || actualKey.includes(key))) {
          // その他 改修効果が載る系のやつ
          value = (item as { [key: string]: number })[key];
        } else {
          // 装備素性能を出すやつなど
          value = (item.data as { [key: string]: number })[key];
        }
        return value ? `${Math.floor(10 * value) / 10}` : '';
      };
    },
    statusBonus(): (v: viewItem, key: string) => number {
      return (v: viewItem, key: string) => {
        const keys = statusBonusKeys[key];
        if (!keys || !v.bonus) return 0;
        return keys.reduce((sum, k) => sum + (v.bonus[k] ?? 0), 0);
      };
    },
    barKey(): string {
      if (this.isCheckedOnly) return '';
      if (this.sortKey && !textStatusKeys.includes(this.sortKey)) return this.sortKey;
      const mainKey = this.viewStatus[0];
      return mainKey && !textStatusKeys.includes(mainKey) ? mainKey : '';
    },
    barMaxValue(): number {
      const key = this.barKey;
      if (!key) return 0;
      return this.viewItems.reduce((max, v) => Math.max(max, parseFloat(`${this.formatStatus(v, key)}`) || 0), 0);
    },
    barWidth(): (v: viewItem, key: string) => number {
      return (v: viewItem, key: string) => {
        if (key !== this.barKey || this.barMaxValue <= 0) return 0;
        const value = parseFloat(`${this.formatStatus(v, key)}`);
        return value > 0 ? Math.round((value / this.barMaxValue) * 75) : 0;
      };
    },
    isJapanese() {
      return this.$i18n.locale === 'ja';
    },
    needTrans() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    enabledNightAircraftFilter() {
      return this.type === -1 || this.type === 6 || this.type === 7 || this.type === 8;
    },
    enabledAAResistFilter() {
      return Const.ATTACKERS.includes(this.type) || this.type === -1 || this.type === 1100;
    },
    disabledDetailFilter() {
      return !!this.keyword || (this.isBatchMode && this.isCheckedOnly);
    },
    currentBatchIndex() {
      return this.batchList.length === this.batchMax - 1 ? Const.EXPAND_SLOT_INDEX : this.batchList.length;
    },
    isBatchListMax() {
      return this.isBatchMode && this.batchList.length >= this.batchMax;
    },
    isCostFilter() {
      return this.filterStatus === 'cost';
    },
    normalizedStatusFilterValue(): number {
      const value = Math.floor(+this.filterStatusValue || 0);
      if (!Number.isFinite(value)) return 0;
      return Math.max(0, Math.min(30, value));
    },
    statusFilterPresets(): ItemStatusFilterPreset[] {
      const list = this.setting && this.setting.savedItemStatusFilters;
      return Array.isArray(list) ? list : [];
    },
    canSaveStatusFilter(): boolean {
      const value = this.normalizedStatusFilterValue;
      if (value <= 0 || !this.filterStatus) return false;
      if (this.statusFilterPresets.length >= ITEM_STATUS_FILTER_PRESET_LIMIT) return false;
      return !this.statusFilterPresets.some((v) => v.key === this.filterStatus && v.value === value);
    },
    currentStatusFilterLabel(): string {
      return this.statusFilterPresetLabel({ key: this.filterStatus, value: this.normalizedStatusFilterValue });
    },
    affectingRangeState(): number {
      if (this.onlyAffectingRange) return 1;
      return this.onlyNotAffectingRange ? 2 : 0;
    },
    landBaseAttackState(): number {
      if (this.onlyEnabledLandBaseAttack) return 1;
      return this.onlyDisabledLandBaseAttack ? 2 : 0;
    },
    hasActiveFilter(): boolean {
      return this.activeFilterCount > 0 || !!this.keyword;
    },
    activeFilterCount(): number {
      let count = 0;
      if (+this.filterStatusValue > 0) count += 1;
      if (this.affectingRangeState > 0) count += 1;
      if (this.landBaseAttackState > 0) count += 1;
      if (this.onlyNightAircraft) count += 1;
      if (this.onlyAAResistAircraft) count += 1;
      if (this.isSpecialOnly) count += 1;
      if (this.isEnemyMode) count += 1;
      if (this.type === 14) {
        if (!this.includeSonar) count += 1;
        if (!this.includeDepthCharge) count += 1;
        if (!this.includeDepthChargeLauncher) count += 1;
      }
      if (this.type === 5) {
        if (!this.includeTorpedo) count += 1;
        if (!this.includeSPTorpedo) count += 1;
        if (!this.includeSVTorpedo) count += 1;
      }
      return count;
    },
    sortKeyLabel(): string {
      if (!this.sortKey) return '';
      if (this.sortKey === 'name') return `${this.$t('Common.装備名称')}`;
      if (this.sortKey === 'id') return `${this.$t('Common.図鑑ID')}`;
      const header = this.headerItems.find((v) => v.key === this.sortKey);
      if (header) return `${this.$t(`Common.${header.text}`)}`;
      return `${this.$t(`Statuses.${this.sortKey}`)}`;
    },
    mobileHighlightKey(): string {
      if (this.sortKey && this.sortKey !== 'name' && this.sortKey !== 'id') return this.sortKey;
      return this.viewStatus[0] || '';
    },
    mobileSubStatusKeys(): string[] {
      const highlight = this.mobileHighlightKey;
      return this.viewStatus.filter((key) => key !== highlight).slice(0, 3);
    },
    showDetailPane(): boolean {
      return !this.isMobile && this.detailPaneFits;
    },
  },
  methods: {
    getContextualBonuses(master: ItemMaster) {
      const bonuses = master.bonuses || [];
      if (this.isAirbaseMode) {
        // 基地表示時は艦娘専用の特効は除外
        return bonuses.filter((b) => !b.isOnlyShip);
      }
      // 艦娘表示時は基地専用の特効は除外
      return bonuses.filter((b) => !b.isOnlyAB);
    },
    onViewportResize() {
      const wasMobile = this.isMobile;
      this.updateIsMobile();
      if (wasMobile !== this.isMobile) {
        this.filter();
      }
    },
    updateIsMobile() {
      const mobile = window.innerWidth < 600;
      const paneFits = window.innerWidth >= 960;
      this.isMobile = mobile;
      this.detailPaneFits = paneFits;
      let host = this.$parent as Vue & { isMobile?: boolean; itemDialogWidth?: number };
      while (host) {
        if (typeof host.isMobile === 'boolean' && typeof host.itemDialogWidth === 'number') {
          host.isMobile = mobile;
          break;
        }
        host = host.$parent as Vue & { isMobile?: boolean; itemDialogWidth?: number };
      }
      const pane = !mobile && paneFits ? 268 : 0;
      const preferred = (this.multiLine ? 1200 : 940) + pane;
      const width = mobile ? window.innerWidth : Math.min(preferred, Math.max(640, window.innerWidth - 32));
      this.handleChangeWidth(width);
    },
    changeType(type = 0): void {
      this.isCheckedOnly = false;
      this.type = type;

      if (this.selectedType && this.selectedType.sortKey) {
        // 選択したカテゴリにソート値が保存されていたら呼び出し
        this.isDesc = this.selectedType.isDesc;
        this.sortKey = this.selectedType.sortKey;
      } else {
        this.sortKey = '';
        this.isDesc = false;
      }
      this.filter();
    },
    toggleCheckedOnly() {
      this.isCheckedOnly = true;
      this.filter();
    },
    clickedStockOnly() {
      this.setting.isStockOnlyForItemList = this.isStockOnly;
      this.$store.dispatch('updateSetting', this.setting);
      this.filter();
    },
    resetFilter() {
      this.keyword = '';
      this.filterStatusValue = 0;
      this.changedFilter();
    },
    clearStatusValue() {
      this.filterStatusValue = 0;
      this.changedFilter();
    },
    initialFilter(parent: Ship | Enemy | Airbase, slotIndex = 0, usedItems: Item[] = [], batchMax = 0) {
      // 一括編成モード
      this.isBatchMode = batchMax > 0;
      this.isCheckedOnly = false;
      this.batchMax = batchMax;
      this.batchList = [];

      this.decidedItem = false;
      this.itemParent = parent;
      this.slotIndex = slotIndex;
      this.isEnemyMode = false;

      this.filterStatus = 'radius';
      this.filterStatusValue = 0;

      // 現行の所持装備情報を更新
      this.itemStock = this.$store.state.itemStock as ItemStock[];
      this.setting = this.$store.state.siteSetting as SiteSetting;
      this.isStockOnly = this.setting.isStockOnlyForItemList;
      this.isReadonlyMode = false;

      // 一時所持情報データがあるなら
      if (this.$store.getters.getExistsTempStock) {
        this.itemStock = this.$store.state.tempItemStock as ItemStock[];
        this.isStockOnly = true;
        this.isReadonlyMode = true;
      }

      // 装備がなければ解除
      if (this.isStockOnly && !this.itemStock.length) {
        this.isStockOnly = false;
      }

      // 搭載数情報を格納
      const isExpand = slotIndex === Const.EXPAND_SLOT_INDEX;
      if (isExpand) {
        this.slot = 0;
      } else {
        this.slot = parent.items[slotIndex] ? parent.items[slotIndex].fullSlot : 0;
      }

      this.usedItems = [];

      // 利用済み装備(直接指定)
      if (usedItems.length) {
        this.usedItems = usedItems;
      } else {
        // 現在の計算画面内で配備されている装備を列挙する
        const mainData = this.$store.state.mainSaveData as SaveData;
        if (mainData) {
          const manager = mainData.tempData[mainData.tempIndex];
          if (manager) {
            let allItems: Item[] = [];
            // 艦隊データから装備全取得
            for (let i = 0; i < manager.fleetInfo.fleets.length; i += 1) {
              const { ships } = manager.fleetInfo.fleets[i];
              for (let j = 0; j < ships.length; j += 1) {
                if (ships[j].isActive) {
                  allItems = allItems.concat(ships[j].items.filter((v) => v.data.id > 0));
                  if (ships[j].exItem.data.id > 0) allItems.push(ships[j].exItem);
                }
              }
            }

            // 基地航空隊データから装備全取得
            const { airbases } = manager.airbaseInfo;
            for (let i = 0; i < airbases.length; i += 1) {
              allItems = allItems.concat(airbases[i].items.filter((v) => v.data.id > 0));
            }

            this.usedItems = allItems;
          }
        }
      }

      // 装備可能フィルタ
      let types: number[] = [];
      if (parent instanceof Ship && parent.data.id) {
        // 渡された艦娘情報より装備可能種別を取得
        this.baseItems = this.all.filter((item) => ShipValidation.isValidItem(parent.data, item, slotIndex, 10));
        if (this.enabledTypes.length && this.type !== -1 && !this.enabledTypes.find((v) => v.id === this.type)) {
          // カテゴリがおかしかったら最初のカテゴリにする
          this.type = this.enabledTypes[0].id;
        }

        const filterData = this.setting.savedItemListFilter.find((v) => v.parent === 'ship');
        if (filterData && filterData.key) {
          this.filterStatus = filterData.key;
        }
        if (filterData && filterData.value) {
          this.filterStatusValue = filterData.value;
        }

        this.filter();
        return;
      }
      if (parent instanceof Ship) {
        // 空の艦娘 全部盛り
        for (let i = 1; i <= 60; i += 1) {
          if (Const.AB_PLANE_TYPES.includes(i)) {
            continue;
          }
          types.push(i);
          if (this.type <= 0) {
            // カテゴリがおかしかったら最初のカテゴリにする
            this.type = 1;
          }

          const filterData = this.setting.savedItemListFilter.find((v) => v.parent === 'ship');
          if (filterData && filterData.key) {
            this.filterStatus = filterData.key;
          }
          if (filterData && filterData.value) {
            this.filterStatusValue = filterData.value;
          }
        }
      } else if (parent instanceof Airbase) {
        // 基地航空隊 全艦載機装備可能
        types = Const.PLANE_TYPES.concat();
        if (this.type !== -1 && !types.includes(this.type)) {
          // なんか変だったら陸攻を初期位置に
          this.type = 47;
        }
        this.slot = 18;

        const filterData = this.setting.savedItemListFilter.find((v) => v.parent === 'airbase');
        if (filterData && filterData.key) {
          this.filterStatus = filterData.key;
        }
        if (filterData && filterData.value) {
          this.filterStatusValue = filterData.value;
        }
      } else if (parent instanceof Enemy) {
        // 基本は全装備
        types = Const.ITEM_API_TYPE.map((v) => v.id);
        // 敵装備マスタに存在しない装備カテゴリは抜いておく
        const enemyItems = this.all.filter((v) => v.isEnemyItem);
        types = types.filter((v) => enemyItems.some((x) => x.apiTypeId === v));

        // 敵装備フラグ強制ON
        this.isEnemyMode = true;

        // 初手フィルタ
        if (!types.includes(this.type)) {
          this.type = +types[0];
        }
      }

      if (isExpand) {
        // 補強増設枠フィルタ
        const enabledItems = Const.EXPANDED_ITEM_TYPE;
        types = types.filter((v) => enabledItems.includes(v));
      }

      this.baseItems = this.all.filter((v) => types.includes(v.apiTypeId));
      this.filter();
    },
    changedFilter() {
      const filterData = { parent: 'ship' as 'ship' | 'airbase', key: this.filterStatus, value: this.filterStatusValue };
      if (this.itemParent instanceof Ship) {
        filterData.parent = 'ship';
      } else if (this.isAirbaseMode) {
        filterData.parent = 'airbase';
      } else {
        this.filter();
        return;
      }

      if (!this.setting.savedItemListFilter) {
        this.filter();
        return;
      }

      const index = this.setting.savedItemListFilter.findIndex((v) => v.parent === filterData.parent);
      if (index >= 0) {
        this.setting.savedItemListFilter[index] = filterData;
        this.$store.dispatch('updateSetting', this.setting);
      }
      this.filter();
    },
    toggleAffectingRangeFilter() {
      if (this.onlyAffectingRange) {
        this.onlyAffectingRange = false;
        this.onlyNotAffectingRange = true;
      } else if (this.onlyNotAffectingRange) {
        this.onlyNotAffectingRange = false;
      } else {
        this.onlyAffectingRange = true;
      }
      this.filter();
    },
    setAffectingRangeState(state: number) {
      this.onlyAffectingRange = state === 1;
      this.onlyNotAffectingRange = state === 2;
      this.filter();
    },
    setLandBaseAttackState(state: number) {
      this.onlyEnabledLandBaseAttack = state === 1;
      this.onlyDisabledLandBaseAttack = state === 2;
      this.filter();
    },
    resetAllFilter() {
      this.onlyAffectingRange = false;
      this.onlyNotAffectingRange = false;
      this.onlyEnabledLandBaseAttack = false;
      this.onlyDisabledLandBaseAttack = false;
      this.onlyNightAircraft = false;
      this.onlyAAResistAircraft = false;
      this.isSpecialOnly = false;
      this.isEnemyMode = false;
      this.includeSonar = true;
      this.includeDepthCharge = true;
      this.includeDepthChargeLauncher = true;
      this.includeTorpedo = true;
      this.includeSPTorpedo = true;
      this.includeSVTorpedo = true;
      this.resetFilter();
    },
    stepFilterValue(delta: number) {
      const next = Math.max(0, Math.min(30, (+this.filterStatusValue || 0) + delta));
      this.filterStatusValue = next;
      this.changedFilter();
    },
    statusFilterPresetLabel(preset: { key: string; value: number }): string {
      const item = this.filterStatusItems.find((v) => v.value === preset.key);
      const name = item ? item.text : preset.key;
      const op = preset.key === 'cost' ? `${this.$t('ItemList.以下')}` : `${this.$t('ItemList.以上')}`;
      const suffix = this.$i18n.locale === 'en' ? ` ${op}` : op;
      return `${name} ${preset.value}${suffix}`;
    },
    isActiveStatusPreset(preset: { key: string; value: number }): boolean {
      return this.filterStatus === preset.key && this.normalizedStatusFilterValue === preset.value;
    },
    applyStatusFilterPreset(preset: ItemStatusFilterPreset) {
      if (!isItemStatusFilterKey(preset.key)) return;
      if (this.isActiveStatusPreset(preset)) {
        this.clearStatusValue();
        return;
      }
      this.keyword = '';
      this.filterStatus = preset.key;
      this.filterStatusValue = preset.value;
      this.changedFilter();
    },
    flexBoxes(el: HTMLElement): HTMLElement[] {
      const boxes: HTMLElement[] = [];
      for (let i = 0; i < el.children.length; i += 1) {
        const child = el.children[i] as HTMLElement;
        if (getComputedStyle(child).display === 'contents') boxes.push(...this.flexBoxes(child));
        else boxes.push(child);
      }
      return boxes;
    },
    captureFilterPositions() {
      const row = this.$refs.filterRow as HTMLElement | undefined;
      const layout = presetLayoutOf(this);
      layout.tops.clear();
      if (!row) return;
      this.flexBoxes(row).forEach((el) => {
        layout.tops.set(el, el.getBoundingClientRect().top);
      });
    },
    rowGap(row: HTMLElement): number {
      const raw = getComputedStyle(row).columnGap;
      const gap = parseFloat(raw);
      return Number.isFinite(gap) ? gap : 6;
    },
    filterRowWraps(row: HTMLElement): boolean {
      const boxes = this.flexBoxes(row).filter((el) => !el.classList.contains('preset-pop-leave-active'));
      if (boxes.length < 2) return false;
      const tops = boxes.map((el) => el.offsetTop);
      const min = Math.min(...tops);
      return tops.some((top) => top - min > 18);
    },
    shouldPlacePresetsOnOwnRow(): boolean {
      if (!this.statusFilterPresets.length || this.isMobile) return false;
      const row = this.$refs.filterRow as HTMLElement | undefined;
      if (!row || row.clientWidth < 40) return this.presetsOnOwnRow;
      if (!this.presetsOnOwnRow) return this.filterRowWraps(row);

      const group = row.querySelector('.preset-group') as HTMLElement | null;
      const chips = group
        ? (Array.from(group.querySelectorAll('.preset-chip')) as HTMLElement[])
          .filter((el) => !el.classList.contains('preset-pop-leave-active'))
        : [];
      if (!chips.length) return false;
      const gap = this.rowGap(row);
      const presetWidth = chips.reduce((sum, el) => sum + el.offsetWidth, 0) + gap * (chips.length - 1);
      const others = (Array.from(row.children) as HTMLElement[]).filter((el) => el !== group);
      const othersWidth = others.reduce((sum, el) => sum + el.offsetWidth, 0) + gap * Math.max(0, others.length - 1);
      const free = row.clientWidth - othersWidth;
      const needed = presetWidth + (others.length ? gap + 1 + gap : 0);
      return needed > free - 2;
    },
    syncPresetPlacement() {
      const layout = presetLayoutOf(this);
      const should = this.shouldPlacePresetsOnOwnRow();
      if (should === this.presetsOnOwnRow) {
        layout.passes = 0;
        layout.pending = false;
        this.playFilterMove();
        return;
      }
      layout.passes += 1;
      if (layout.passes > 2) {
        layout.passes = 0;
        layout.pending = false;
        return;
      }
      layout.pending = true;
      this.presetsOnOwnRow = should;
    },
    playFilterMove() {
      const layout = presetLayoutOf(this);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      layout.tops.forEach((top, el) => {
        if (!el.isConnected) return;
        if (el.classList.contains('preset-pop-enter-active') || el.classList.contains('preset-pop-leave-active')) return;
        const dy = top - el.getBoundingClientRect().top;
        if (reduce || Math.abs(dy) < 10) return;
        el.style.transition = 'none';
        el.style.transform = `translateY(${dy}px)`;
        // いったん元の位置に置いてから、折り返し先へ滑らせる
        const placed = el.getBoundingClientRect().top;
        if (!Number.isFinite(placed)) return;
        el.style.transition = 'transform 0.48s cubic-bezier(0.2, 0.7, 0.2, 1)';
        el.style.transform = '';
        const clear = (event: TransitionEvent) => {
          if (event.propertyName !== 'transform') return;
          el.style.transition = '';
          el.removeEventListener('transitionend', clear);
        };
        el.addEventListener('transitionend', clear);
      });
      layout.tops.clear();
    },
    ensureFilterRowObserver() {
      const row = this.$refs.filterRow as HTMLElement | undefined;
      const layout = presetLayoutOf(this);
      if (!row) {
        if (layout.observer) {
          layout.observer.disconnect();
          layout.observer = undefined;
          layout.observed = undefined;
          layout.width = 0;
        }
        return;
      }
      if (layout.observer && layout.observed === row) return;
      if (layout.observer) layout.observer.disconnect();
      layout.observed = row;
      layout.width = row.clientWidth;
      layout.observer = createPresetResizeObserver(() => this.onFilterRowResize());
      layout.observer.observe(row);
      row.addEventListener('animationend', this.onPresetAnimationEnd);
    },
    onPresetAnimationEnd(event: AnimationEvent) {
      const target = event.target as HTMLElement | null;
      if (!target || !target.classList || !target.classList.contains('preset-chip')) return;
      this.syncPresetPlacement();
    },
    onFilterRowResize() {
      const row = this.$refs.filterRow as HTMLElement | undefined;
      if (!row) return;
      const layout = presetLayoutOf(this);
      if (row.clientWidth === layout.width) return;
      layout.width = row.clientWidth;
      if (!layout.pending) this.captureFilterPositions();
      this.syncPresetPlacement();
    },
    saveStatusFilterPreset() {
      if (!this.canSaveStatusFilter) return;
      this.animatePresetEnter = true;
      const value = this.normalizedStatusFilterValue;
      this.setting.savedItemStatusFilters = this.statusFilterPresets.concat({
        id: `${Date.now()}`,
        key: this.filterStatus,
        value,
      });
      this.$store.dispatch('updateSetting', this.setting);
    },
    removeStatusFilterPreset(preset: ItemStatusFilterPreset) {
      this.setting.savedItemStatusFilters = this.statusFilterPresets.filter((v) => v.id !== preset.id);
      this.$store.dispatch('updateSetting', this.setting);
    },
    toggleLandBaseAttackFilter() {
      if (this.onlyEnabledLandBaseAttack) {
        this.onlyEnabledLandBaseAttack = false;
        this.onlyDisabledLandBaseAttack = true;
      } else if (this.onlyDisabledLandBaseAttack) {
        this.onlyDisabledLandBaseAttack = false;
      } else {
        this.onlyEnabledLandBaseAttack = true;
      }
      this.filter();
    },
    filter() {
      this.updateIsMobile();

      if (!this.batchList.length && this.isCheckedOnly) {
        // 一括配備モードのゴミ掃除 => 一件も選択装備がないのに選択装備のみフィルタがあった場合
        this.isCheckedOnly = false;
      }

      const word = this.keyword ? this.keyword.toUpperCase() : '';
      let result = this.baseItems.concat();
      const bonusKey = this.setting.displayBonusKey;

      // ブラックリスト装備を消す
      if (this.setting.blacklistItemIds.length) {
        const list = this.setting.blacklistItemIds;
        result = result.filter((v) => !list.includes(v.id));
      }

      // 検索語句あれば最優先
      if (word) {
        result = result.filter((v) => v.id === +word || v.name.toUpperCase().indexOf(word) >= 0);
      }
      if (!this.disabledDetailFilter) {
        // 通常フィルタ
        if (this.isEnemyMode) {
          // 敵装備
          result = result.filter((v) => v.isEnemyItem);
        } else {
          result = result.filter((v) => !v.isEnemyItem);
        }
        // カテゴリ毎のフィルタ
        if (this.type === 7) {
          // 艦爆フィルタ
          if (this.onlyEnabledLandBaseAttack) {
            result = result.filter((v) => Const.ENABLED_LAND_BASE_ATTACK.includes(v.id));
          } else if (this.onlyDisabledLandBaseAttack) {
            result = result.filter((v) => !Const.ENABLED_LAND_BASE_ATTACK.includes(v.id));
          }
        }

        if (this.type === 14 || this.type === 40) {
          // ソ爆投フィルタ
          if (!this.includeSonar) {
            result = result.filter((v) => v.apiTypeId !== 14 && v.apiTypeId !== 40);
          }
          if (!this.includeDepthCharge) {
            result = result.filter((v) => v.iconTypeId !== 1700);
          }
          if (!this.includeDepthChargeLauncher) {
            result = result.filter((v) => v.iconTypeId !== 17);
          }
        }
        if (this.type === 5) {
          // 魚雷フィルタ
          if (!this.includeTorpedo) {
            result = result.filter((v) => v.apiTypeId !== 5);
          }
          if (!this.includeSPTorpedo) {
            result = result.filter((v) => v.apiTypeId !== 22);
          }
          if (!this.includeSVTorpedo) {
            result = result.filter((v) => v.apiTypeId !== 32);
          }
        }
        if (this.enabledNightAircraftFilter && this.onlyNightAircraft) {
          // 夜間機フィルタ
          result = result.filter((v) => v.isNightAircraftItem);
        }
        if (this.enabledAAResistFilter && this.onlyAAResistAircraft) {
          // 射撃回避フィルタ
          result = result.filter((v) => v.avoidId);
        }
        if (this.isSpecialOnly && bonusKey) {
          // 特効フィルタ
          result = result.filter((v) => this.getContextualBonuses(v).find((x) => x.key === bonusKey));
        }

        // カテゴリ検索
        const t = this.types.find((v) => v.id === this.type);
        if (!word && this.type && t) {
          this.viewStatus = t.viewStatus.concat();

          if (!this.isAirbaseMode) {
            // 基地じゃない場合
            if (this.viewStatus.includes('radius')) {
              // 半径が含まれていたら、砲撃戦火力に置換
              this.viewStatus[this.viewStatus.indexOf('radius')] = 'dayBattleFirePower';
            }
            if (this.viewStatus.includes('cost')) {
              // コストが含まれていたら、回避に置換
              this.viewStatus[this.viewStatus.indexOf('cost')] = 'actualAvoid';
            }
          } else if (this.viewStatus.includes('nightBattleFirePower')) {
            // 基地の場合 夜戦火力が含まれていたら、対空に置換
            this.viewStatus[this.viewStatus.indexOf('nightBattleFirePower')] = 'antiAir';
          }
          result = result.filter((v) => t.types.includes(v.apiTypeId));
        } else if (!word && this.type === -1) {
          // カテゴリ全て検索
          if (this.itemParent instanceof Ship) {
            // 艦娘 -全て
            this.viewStatus = ['dayBattleFirePower', 'nightBattleFirePower', 'actualAccuracy', 'antiAir', 'actualScout', 'actualAsw'];
          } else if (this.isAirbaseMode) {
            // 基地 -全て
            this.viewStatus = ['actualTorpedo', 'actualBomber', 'actualAntiAir', 'radius', 'airPower', 'defenseAirPower'];
          } else {
            this.viewStatus = ['actualFire', 'actualAntiAir', 'actualAccuracy', 'actualScout', 'actualAvoid', 'armor'];
          }
        }
      }

      let usedItem = this.usedItems.concat();
      const withoutRemodel = this.sortExcludeRemodelStatus && this.isStockOnly;
      const withoutSynergy = this.sortExcludeSynergyStatus;
      const viewItems: viewItem[] = [];
      const iniLevels = this.setting.planeInitialLevels;
      const { slot } = this;
      if (!this.isEnemyMode && this.isStockOnly) {
        // 所持装備考慮
        const stock = this.itemStock;
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          const iniLevel = iniLevels.find((v) => v.id === master.apiTypeId);
          const stockData = stock.find((v) => v.id === master.id);
          if (!stockData) {
            // 未所持 出さない
            continue;
          }

          // 熟練度 設定値より
          const level = iniLevel ? iniLevel.level : 0;
          const bonusTexts = bonusKey
            ? this.getContextualBonuses(master).filter((v) => v.key === bonusKey).flatMap((v) => v.text)
            : [];

          // 改修値★10～0 だけ回す
          for (let remodel = 10; remodel >= 0; remodel -= 1) {
            let count = stockData.num[remodel];
            if (!count) continue;
            const item = new Item({
              master,
              slot,
              remodel,
              level,
              ignoreRemodelBonus: withoutRemodel,
            });

            // id 改修値を見て配備済みかどうか判定
            const usedCount = usedItem.filter((v) => v.data.id === master.id && v.remodel === remodel).length;
            // 減らす
            count -= usedCount;
            usedItem = usedItem.filter((v) => v.data.id !== master.id || v.remodel !== remodel);

            const allCount = count;
            const batchListIndexes: number[] = [];
            if (this.isBatchMode) {
              for (let j = 0; j < this.batchList.length; j += 1) {
                const el = this.batchList[j];
                if (el.item.data.id === master.id && el.remodel === remodel) {
                  batchListIndexes.push(j);
                }
              }

              // さらに個数減らす
              count -= batchListIndexes.length;
            }

            let disabled = false;
            let lackRemodel = false;
            if (this.itemParent instanceof Ship) {
              // 一括モード 現在の装備スロットに搭載できるかどうかを判定
              const parent = this.itemParent;
              if (this.isBatchMode) {
                // 一括モードの際は消さずに赤くする
                disabled = this.isBatchListMax || !ShipValidation.isValidItem(parent.data, master, this.currentBatchIndex, remodel);
              } else if (!ShipValidation.isValidItem(parent.data, master, this.slotIndex, remodel)) {
                // 通常モード
                if (this.slotIndex === Const.EXPAND_SLOT_INDEX && ShipValidation.isValidItem(parent.data, master, this.slotIndex, 10)) {
                  // 敗者復活
                  lackRemodel = true;
                } else {
                  // 搭載不可、消す
                  continue;
                }
              }
            }
            viewItems.push({
              item,
              count: Math.max(count, 0),
              allCount: Math.max(allCount, 0),
              remodel,
              sumBonus: 0,
              bonus: {},
              text: Array.from(new Set(bonusTexts)),
              dayBattleFirePower: item.dayBattleFirePower,
              aircraftDayBattleFirePower: item.aircraftDayBattleFirePower,
              batchListIndexes,
              disabled,
              lackRemodel,
            });
          }
        }
      } else {
        // 所持装備考慮なし 愚直に追加
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          const iniLevel = iniLevels.find((v) => v.id === master.apiTypeId);
          const level = iniLevel ? iniLevel.level : 0;
          const bonusTexts = bonusKey
            ? this.getContextualBonuses(master).filter((v) => v.key === bonusKey).flatMap((v) => v.text)
            : [];
          const item = new Item({
            master,
            slot,
            level,
          });

          const batchListIndexes: number[] = [];
          if (this.isBatchMode) {
            for (let j = 0; j < this.batchList.length; j += 1) {
              const el = this.batchList[j];
              if (el.item.data.id === master.id && el.remodel === 0) {
                batchListIndexes.push(j);
              }
            }
          }

          let disabled = false;
          let lackRemodel = false;
          if (this.itemParent instanceof Ship) {
            // 現在の装備スロットに搭載できるかどうかを最終判定
            const parent = this.itemParent;
            if (this.isBatchMode) {
              // 一括モードの際は消さずに赤くする
              disabled = this.isBatchListMax || !ShipValidation.isValidItem(parent.data, master, this.currentBatchIndex, 0);
            } else if (!ShipValidation.isValidItem(parent.data, master, this.slotIndex, 0)) {
              // 通常モード
              if (this.slotIndex === Const.EXPAND_SLOT_INDEX && ShipValidation.isValidItem(parent.data, master, this.slotIndex, 10)) {
                // 敗者復活
                lackRemodel = true;
              } else {
                // 搭載不可、消す
                continue;
              }
            }
          }
          viewItems.push({
            item,
            count: 1,
            allCount: 99,
            sumBonus: 0,
            remodel: 0,
            bonus: {},
            text: Array.from(new Set(bonusTexts)),
            dayBattleFirePower: item.dayBattleFirePower,
            aircraftDayBattleFirePower: item.aircraftDayBattleFirePower,
            batchListIndexes,
            disabled,
            lackRemodel,
          });
        }
      }

      if (this.isBatchMode && this.isCheckedOnly) {
        this.viewItems = viewItems.filter((v) => !!v.batchListIndexes.length);
      } else {
        this.viewItems = viewItems;
      }

      // 装備フィットの可視化
      if (this.itemParent instanceof Ship) {
        let parent = this.itemParent;
        if (this.isBatchMode && this.batchList.length) {
          // 一括モード => 既に搭載されている装備を反映したものとする
          const tempNewItems: Item[] = [];
          for (let index = 0; index < parent.items.length; index += 1) {
            const item = this.batchList[index];
            if (item && item.item.data.id) {
              tempNewItems.push(new Item({ item: item.item }));
            } else {
              tempNewItems.push(new Item());
            }
          }
          // 補強増設
          const exItem = this.batchList[parent.data.slotCount];
          if (exItem) {
            parent = new Ship({ ship: parent, items: tempNewItems, exItem: exItem.item });
          } else {
            parent = new Ship({ ship: parent, items: tempNewItems, exItem: new Item() });
          }
        }
        // viewItem配列全てのviewItemに対し、装備シナジーボーナスを付与する
        // => 変更対象のスロットが空の場合のボーナスと、それぞれの装備を搭載時に発生するボーナスの差分を採る
        const baseItems = parent.items.concat();
        baseItems.push(parent.exItem);

        let targetSlot = this.slotIndex;
        if (this.isBatchMode) {
          // 一括モードの際は現在のインデックス
          targetSlot = this.currentBatchIndex;
        }
        if (targetSlot === Const.EXPAND_SLOT_INDEX) {
          targetSlot = baseItems.length - 1;
        }

        // 装備を入れ替えようとしているスロットが未装備だった状態のbonusを取得...(1)
        const tempItems = cloneDeep(baseItems);
        tempItems[targetSlot] = new Item();
        const emptyBonus = Ship.getItemBonus(parent.data, tempItems);
        const totalEmptyBonus = ItemBonus.getTotalBonus(emptyBonus);

        for (let i = 0; i < this.viewItems.length; i += 1) {
          const item = this.viewItems[i];
          const items = cloneDeep(baseItems);
          items[targetSlot] = item.item;
          const bonuses = Ship.getItemBonus(parent.data, items);
          // (1) とのボーナスの個数を比較し、多ければボーナスありとする
          if (bonuses.length > emptyBonus.length) {
            const totalBonus = ItemBonus.getTotalBonus(bonuses);
            // ボーナスの差分を取る
            let sumBonus = 0;
            if (totalBonus.firePower !== undefined) {
              totalBonus.firePower -= totalEmptyBonus.firePower ?? 0;
              sumBonus += totalBonus.firePower;
            }
            if (totalBonus.torpedo !== undefined) {
              totalBonus.torpedo -= totalEmptyBonus.torpedo ?? 0;
              sumBonus += totalBonus.torpedo;
            }
            if (totalBonus.antiAir !== undefined) {
              totalBonus.antiAir -= totalEmptyBonus.antiAir ?? 0;
              sumBonus += totalBonus.antiAir;
            }
            if (totalBonus.armor !== undefined) {
              totalBonus.armor -= totalEmptyBonus.armor ?? 0;
              sumBonus += totalBonus.armor;
            }
            if (totalBonus.asw !== undefined) {
              totalBonus.asw -= totalEmptyBonus.asw ?? 0;
              sumBonus += totalBonus.asw;
            }
            if (totalBonus.avoid !== undefined) {
              totalBonus.avoid -= totalEmptyBonus.avoid ?? 0;
              sumBonus += totalBonus.avoid;
            }
            if (totalBonus.accuracy !== undefined) {
              totalBonus.accuracy -= totalEmptyBonus.accuracy ?? 0;
              sumBonus += totalBonus.accuracy;
            }
            if (totalBonus.range !== undefined) {
              totalBonus.range -= totalEmptyBonus.range ?? 0;
              sumBonus += totalBonus.range;
            }
            if (totalBonus.bomber !== undefined) {
              totalBonus.bomber -= totalEmptyBonus.bomber ?? 0;
              sumBonus += totalBonus.bomber;
            }
            if (totalBonus.scout !== undefined) {
              totalBonus.scout -= totalEmptyBonus.scout ?? 0;
              sumBonus += totalBonus.scout;
            }

            item.sumBonus = sumBonus;
            item.bonus = totalBonus;

            if (!withoutSynergy) {
              // ボーナス(差分のみ)をパラメータに加算 対空はややこしいので指摘されるまではスルー
              item.item.actualFire += totalBonus.firePower ?? 0;
              item.item.actualTorpedo += totalBonus.torpedo ?? 0;
              item.item.actualAsw += totalBonus.asw ?? 0;
              item.item.actualArmor += totalBonus.armor ?? 0;
              item.item.actualAccuracy += totalBonus.accuracy ?? 0;
              item.item.actualScout += totalBonus.scout ?? 0;
              item.item.actualAvoid += totalBonus.avoid ?? 0;
              item.item.actualRange += totalBonus.range ?? 0;
              item.item.nightBattleFirePower += (totalBonus.firePower ?? 0) + (totalBonus.torpedo ?? 0);

              // 砲戦火力に加算
              if (item.item.data.isPlane && !item.item.data.isSPPlane) {
                item.dayBattleFirePower += totalBonus.firePower ?? 0;
                item.aircraftDayBattleFirePower += ((totalBonus.firePower ?? 0) + (totalBonus.torpedo ?? 0) + (totalBonus.bomber ?? 0)) * 1.5;
              } else {
                item.dayBattleFirePower += totalBonus.firePower ?? 0;
                item.aircraftDayBattleFirePower += totalBonus.firePower ?? 0;
              }
            }
          }
        }

        if (!this.disabledDetailFilter) {
          // 射程変化フィルタ
          const currentRange = parent.displayStatus.range;
          if (this.onlyAffectingRange) {
            this.viewItems = this.viewItems.filter((v) => v.bonus.range || currentRange < v.item.data.range);
          } else if (this.onlyNotAffectingRange) {
            this.viewItems = this.viewItems.filter((v) => !v.bonus.range && currentRange >= v.item.data.range);
          }
        }
      }

      if (!this.disabledDetailFilter) {
        // ステータスの数値によるフィルタ => 装備ボーナス分を考慮するため、最後にやる必要がある
        const filterValue = this.filterStatusValue ? +this.filterStatusValue : 0;
        if (this.filterStatus && filterValue && isItemStatusFilterKey(this.filterStatus)) {
          let filterKey = this.filterStatus;
          if (withoutRemodel && filterKey.startsWith('actual')) {
            filterKey = filterKey.replace('actual', '');
            filterKey = filterKey[0].toLowerCase() + filterKey.slice(1);
          }
          const isActualFilterKey = filterKey.indexOf('actual') >= 0 || actualKey.includes(filterKey);
          this.viewItems = (this.viewItems as []).filter((v: { item: sortItem }) => {
            if (this.filterStatus === 'antiAirBonus') {
              return (v.item.antiAirBonus as number) / 100 >= filterValue;
            }
            if (isActualFilterKey) {
              return (v.item[filterKey] as number) >= filterValue;
            }
            if (this.isCostFilter) {
              return (v.item.data as { [key: string]: number }).cost <= filterValue;
            }
            return (v.item.data as { [key: string]: number })[filterKey] >= filterValue;
          });
        }
      }

      // スマホ版は表示ステータスを3つ程度まで減らす デザインが無理すぎる
      if (this.isMobile) {
        this.viewStatus = this.viewStatus.splice(0, 4);
      }

      // ソートを行う
      if (this.sortKey && !this.isCheckedOnly) {
        this.sortItems();
      } else if (this.isCheckedOnly) {
        this.viewItems.sort((a, b) => (a.batchListIndexes[0] ?? 0) - (b.batchListIndexes[0] ?? 0));
      }

      if (this.isJapanese) {
        this.itemListHeight = Math.floor(0.64 * window.innerHeight);
      } else {
        this.itemListHeight = Math.floor(0.6 * window.innerHeight);
      }
    },
    clickedItem(data: viewItem, event: MouseEvent) {
      if (event && event.ctrlKey && data && data.item && !data.item.data.isEnemyItem) {
        this.openWiki(data.item.data);
        return;
      }

      // 一括選択モードの処理
      if (this.isBatchMode) {
        this.clearTooltip();
        if (this.isCheckedOnly || this.isBatchListMax || data.batchListIndexes.length >= data.allCount || (data.batchListIndexes.length && data.disabled)) {
          // 選択済みのみモード || 選択装備数が配備可能数を上回っていたら || 選択装備数が在庫数を上回っていたら
          // この装備を一括選択状態から解除する
          this.batchList = this.batchList.filter((v) => !(v.item.data.id === data.item.data.id && v.remodel === data.remodel));
        } else if (!data.disabled) {
          // 選択不可(スロット位置の関係で装備できないとか)でないならば追加可能
          this.batchList.push(data);
        }
        this.filter();
        return;
      }

      if (this.decidedItem) {
        return;
      }
      this.clearTooltip();

      // 装備比較画面展開できるかどうか
      if (this.setting.showItemCompareDialog && !this.compareDialog && (this.isAirbaseMode || this.isShipMode) && this.itemParent) {
        // 元あった装備がないなら展開はしない
        const baseItem = this.itemParent.items[this.slotIndex] || (this.itemParent instanceof Ship && this.itemParent.exItem);
        if (baseItem && baseItem.data && baseItem.data.id) {
          // 比較画面展開
          this.menuItem = data;
          this.compareItem();
          return;
        }
      }

      if (data.count || this.confirmDialog) {
        this.decidedItem = true;
        this.confirmDialog = false;
        this.handleEquipItem(new Item({ item: data.item, remodel: data.remodel }));
      } else {
        this.confirmItem = data;
        this.confirmDialog = true;
      }
    },
    changeMultiLine(isMulti: boolean) {
      this.multiLine = isMulti;
      this.setting.isMultiLineForItemList = isMulti;
      this.$store.dispatch('updateSetting', this.setting);
      this.updateIsMobile();
    },
    close() {
      this.handleClose();
    },
    toggleSortKey(value: string) {
      if (this.sortKey !== value) {
        // 初回 降順
        this.isDesc = true;
        this.sortKey = value;
        this.sortItems();
      } else if (this.sortKey === value && this.isDesc) {
        // 2回目 昇順
        this.isDesc = false;
        this.sortItems();
      } else if (this.sortKey === value && !this.isDesc) {
        // 3回目 ソート解除
        this.sortKey = '';
        this.filter();
      }

      // 選択中のカテゴリにソートを記憶
      if (this.selectedType) {
        this.selectedType.isDesc = this.isDesc;
        this.selectedType.sortKey = this.sortKey;
      }
    },
    selectSortKey(value: string) {
      if (this.sortKey === value) {
        // もうソートされてるので何もせず
        return;
      }
      // 初回は基本的に降順
      this.isDesc = value !== 'id' && value !== 'cost';

      // ソート任意設定
      this.sortKey = value;
      this.handleSortItem();
    },
    handleSortItem() {
      // 昇順降順変更
      this.filter();
      // 選択中のカテゴリにソートを記憶
      if (this.selectedType) {
        this.selectedType.isDesc = this.isDesc;
        this.selectedType.sortKey = this.sortKey;
      }
    },
    resetOrdering() {
      this.sortKey = '';
      this.filter();

      // 選択中のカテゴリにソートを記憶
      if (this.selectedType) {
        this.selectedType.isDesc = this.isDesc;
        this.selectedType.sortKey = this.sortKey;
      }
    },
    sortItems() {
      const key = this.sortKey;
      const desc = this.isDesc ? 1 : -1;

      if ((!this.multiLine || this.isMobile) && key !== 'name' && key !== 'id' && !this.viewStatus.includes(key)) {
        // ソート対象が一覧になかった場合、ケツのviewStatusをソート項目に置き換え
        this.viewStatus[this.viewStatus.length - 1] = key;
      }

      // 砲戦火力ソート時特別対応
      if (key === 'dayBattleFirePower') {
        if (this.isAircraftMode) {
          this.viewItems.sort((a, b) => desc * (b.aircraftDayBattleFirePower - a.aircraftDayBattleFirePower));
          return;
        }
        this.viewItems.sort((a, b) => desc * (b.dayBattleFirePower - a.dayBattleFirePower));
        return;
      }

      const isNameSort = key === 'name';
      // 装備マスタの値でソートできないものたち
      const isActualValue = key.indexOf('actual') >= 0 || actualKey.includes(key);

      (this.viewItems as []).sort((a: { item: sortItem }, b: { item: sortItem }) => {
        if (isActualValue) {
          return desc * ((b.item[key] as number) - (a.item[key] as number));
        }
        if (isNameSort) {
          const sa = String((a.item.data as { name: number }).name).replace(/(\d+)/g, (m) => m.padStart(10, '0'));
          const sb = String((b.item.data as { name: number }).name).replace(/(\d+)/g, (m) => m.padStart(10, '0'));
          // eslint-disable-next-line no-nested-ternary
          return -desc * (sa < sb ? -1 : sa > sb ? 1 : 0);
        }
        return desc * ((b.item.data as { [key: string]: number })[key] - (a.item.data as { [key: string]: number })[key]);
      });
    },
    previewItem(v: viewItem) {
      if (this.isMobile) return;
      this.detailView = v;
      this.detailItem = v.item;
      this.detailBonus = v.bonus ? JSON.stringify(v.bonus) : '';
    },
    isDetailTarget(v: viewItem) {
      const current = this.detailView;
      return !!current && current.item.data.id === v.item.data.id && current.remodel === v.item.remodel;
    },
    compareDetail() {
      if (!this.detailView) return;
      this.menuItem = this.detailView;
      this.compareItem();
    },
    bootTooltip(item: Item, bonus: ItemBonusStatus, e: MouseEvent | FocusEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledItemTooltip || this.isMobile || this.showDetailPane) {
        return;
      }
      const div = e.target as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = div.getBoundingClientRect();

        if (e instanceof FocusEvent) {
          this.tooltipX = this.multiLine ? rect.x + rect.width / 3 : rect.left;
        } else {
          this.tooltipX = this.multiLine ? rect.x + rect.width / 3 : e.clientX;
        }

        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.tooltipBonus = bonus ? JSON.stringify(bonus) : '';
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    showBlacklist() {
      this.blacklistDialog = true;
    },
    closeBlacklist() {
      this.blacklistDialog = false;
      this.toggleBlacklistDialog();
    },
    toggleBlacklistDialog() {
      if (!this.blacklistDialog) {
        this.filter();
      }
    },
    closeFilterDialog() {
      this.filterDialog = false;
      this.toggleFilterDialog();
    },
    toggleFilterDialog() {
      if (!this.filterDialog) {
        this.changedFilter();
      }
    },
    openWiki(item: ItemMaster) {
      window.open(ItemMaster.getWikiURL(item));
    },
    showItemMenu(item: viewItem, e: MouseEvent) {
      e.preventDefault();
      this.clearTooltip();
      if (this.isMobile) {
        this.openActionSheet(item);
        return;
      }
      this.menuItem = item;
      this.showMenu = false;
      this.menuX = e.clientX;
      this.menuY = e.clientY;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    openItemMenu(item: viewItem, e: MouseEvent) {
      this.clearTooltip();
      if (this.isMobile) {
        this.openActionSheet(item);
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      this.menuItem = item;
      this.showMenu = false;
      this.menuX = rect.left;
      this.menuY = rect.bottom;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    openActionSheet(item: viewItem) {
      this.menuItem = item;
      this.showMenu = false;
      this.actionSheet = true;
    },
    equipFromSheet() {
      const item = this.menuItem;
      if (!item) return;
      this.actionSheet = false;
      this.clickedItem(item, { ctrlKey: false } as MouseEvent);
    },
    compareFromSheet() {
      this.actionSheet = false;
      this.compareItem();
    },
    copyItemName() {
      const name = this.menuItem ? this.menuItem.item.data.name : '';
      const textToCopy = document.getElementById('item-name-box') as HTMLInputElement | null;
      if (textToCopy) {
        textToCopy.value = name;
        textToCopy.select();
        document.execCommand('copy');
        return;
      }
      const area = document.createElement('textarea');
      area.value = name;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    },
    changeRemodel(item: Item, remodel: number) {
      // 改修値変更
      const stock = this.itemStock.find((v) => v.id === item.data.id);

      // 必ずあるはずだが、念のためチェックして書き換え
      if (stock && stock.num[item.remodel] > 0) {
        stock.num[item.remodel] -= 1;
        stock.num[remodel] += 1;
        this.$store.dispatch('updateItemStock', this.itemStock);
        this.showMenu = false;
        this.actionSheet = false;
        this.filter();
      }
    },
    compareItem() {
      if (this.isShipMode || this.isAirbaseMode) {
        this.compareDialog = true;
      }
    },
    toggleCompareSetting() {
      // 設定書き換え
      this.$store.dispatch('updateSetting', this.setting);
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
    specialTextColorByText(text: string) {
      const key = String(text).toUpperCase();
      const known = ['A3', 'C2', 'A2', 'C3', 'A1', 'B1', 'B2', 'B3', 'B4'];
      const match = known.find((v) => v === key);
      return match ? `color-${match}` : 'color-A3';
    },
  },
});
</script>
