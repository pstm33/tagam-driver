<template>
  <q-header
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-tagam-ink shadow-sm': !$q.dark.mode,
    }"
  >
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="las la-angle-left"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page
      class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink"
      :class="{
        'flex flex-center': !hasData && !loading,
      }"
    >
      <template v-if="!loading">
        <div class="mx-auto max-w-4xl rounded-[8px] border border-tagam-line bg-white p-5 shadow-tagam-card">
          <div class="text-[22px] font-black text-tagam-ink">
            {{ data.title }}
          </div>
          <div class="mt-4 text-sm font-semibold leading-7 text-tagam-muted" v-html="data.long_content"></div>
        </div>
      </template>
      <template v-if="!hasData && !loading">
        <div class="text-center full-width">
          <div class="text-[16px] font-black text-tagam-ink">No results</div>
          <p class="text-grey font12">
            {{ $t("This page is not available please come back later") }}.
          </p>
        </div>
      </template>

      <q-inner-loading :showing="loading" color="amber-7" size="md" />
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PageRender",
  data() {
    return {
      data: [],
      loading: false,
    };
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  created() {
    this.getPage(this.$route.params.page_id, null);
  },
  methods: {
    getPage(page_id, done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getPage", "page_id=" + page_id)
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    refresh(done) {
      this.getPage(this.$route.params.page_id, done);
    },
  },
};
</script>
