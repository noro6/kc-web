<template>
  <div class="d-flex manual-checkbox" :class="{ text: mode !== 'img', disabled: disabled }">
    <v-btn icon @click="toggle()" class="manual-checkbox-button">
      <v-icon class="manual-icon" color="primary" v-if="ok">mdi-checkbox-marked</v-icon>
      <v-icon class="manual-icon" color="error" v-else-if="ng">mdi-close-box</v-icon>
      <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
    </v-btn>
    <img v-if="mode === 'img' && imgPath" @click="toggle()" @keypress="toggle()" :src="imgPath" alt="checkbox-img" />
    <div v-else class="label" @click="toggle()" @keypress="toggle()">
      <slot />
    </div>
  </div>
</template>

<style scoped>
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
</style>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ManualCheckbox',
  props: {
    mode: {
      type: String,
      default: '',
    },
    ok: {
      type: Boolean,
      required: true,
    },
    ng: {
      type: Boolean,
      required: true,
    },
    toggle: {
      type: Function,
      required: true,
    },
    imgPath: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
