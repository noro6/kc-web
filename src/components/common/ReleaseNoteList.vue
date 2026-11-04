<template>
  <div>
    <div v-for="release in releases" :key="release.tag" class="release-note">
      <div class="d-flex align-center">
        <div class="release-name">{{ release.name }}</div>
        <div class="ml-3 caption text--secondary">{{ formatDate(release.publishedAt) }}</div>
        <v-btn class="ml-auto" icon small :href="release.url" target="_blank" rel="noopener noreferrer">
          <v-icon small>mdi-open-in-new</v-icon>
        </v-btn>
      </div>
      <div class="release-body" v-html="release.html" />
    </div>
  </div>
</template>

<style scoped>
.release-note {
  padding: 8px 0 12px;
}
.release-note + .release-note {
  border-top: 1px solid rgba(128, 128, 128, 0.3);
}
.release-name {
  font-size: 1.1em;
  font-weight: bold;
}
.release-body {
  font-size: 0.9em;
}
.release-body >>> h1,
.release-body >>> h2,
.release-body >>> h3,
.release-body >>> h4 {
  margin: 10px 0 4px;
  padding-left: 8px;
  font-size: 1em;
  border-left: 4px solid #9e9e9e;
  line-height: 1.4;
}
.release-body >>> .release-heading-new {
  border-left-color: #e53935;
}
.release-body >>> .release-heading-update {
  border-left-color: #4caf50;
}
.release-body >>> .release-heading-fix {
  border-left-color: #ff9800;
}
.release-body >>> ul {
  padding-left: 24px;
}
.release-body >>> li {
  margin: 2px 0;
}
.release-body >>> p {
  margin: 4px 0;
}
.release-body >>> img {
  max-width: 100%;
}
</style>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ReleaseNote } from '@/classes/releaseNote';

export default Vue.extend({
  name: 'ReleaseNoteList',
  props: {
    releases: {
      type: Array as PropType<ReleaseNote[]>,
      required: true,
    },
  },
  methods: {
    formatDate(time: number): string {
      const date = new Date(time);
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${date.getFullYear()}/${month}/${day}`;
    },
  },
});
</script>
