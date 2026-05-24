<template>
  <q-header class="bg-white text-tagam-ink shadow-sm" reveal reveal-offset="50">
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="arrow_back"
        color="dark"
      />
      <q-toolbar-title class="text-[18px] font-black text-tagam-ink">{{
        $t("Reviews")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5">
      <section class="mx-auto max-w-4xl">
      <ReviewOverview :overview="true" :refresh="is_refresh" />

      <div v-if="!hasData && !loading" class="flex flex-center q-pa-xl rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
        <div class="text-center">
          <div class="text-[16px] font-black text-tagam-ink">
            {{ $t("No available data") }}
          </div>
          <p class="text-xs font-semibold text-tagam-muted">{{ $t("Pull down the page to refresh") }}</p>
        </div>
      </div>

      <q-infinite-scroll ref="nscroll" @load="getReview" :offset="250">
        <template v-slot:default>
          <q-list class="space-y-3">
            <template v-for="itemdata in data" :key="itemdata">
              <q-item v-for="items in itemdata" :key="items" class="rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
                <q-item-section avatar>
                  <q-avatar class="ring-2 ring-amber-100">
                    <q-img
                      :src="items.avatar"
                      style="height: 50px; max-width: 50px"
                      fit="cover"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-bold text-tagam-ink">{{ items.review }}</q-item-label>
                  <q-item-label class="text-xs font-semibold" caption>{{
                    items.date_created
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="flex flex-center q-gutter-sm">
                    <div class="text-sm font-black text-tagam-ink">{{ items.rating }}</div>
                    <q-icon
                      name="las la-star"
                      size="15px"
                      :color="changeColor(items.rating)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>
        <template v-slot:loading>
          <q-list v-if="page <= 0" class="rounded-[8px] bg-white">
            <q-item v-for="i in 6" :key="i">
              <q-item-section avatar>
                <q-skeleton type="QAvatar" />
              </q-item-section>
              <q-item-section>
                <q-skeleton type="text" />
                <q-skeleton type="text" style="width: 100px" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-list v-else class="rounded-[8px] bg-white">
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" />
              </q-item-section>
              <q-item-section>
                <q-skeleton type="text" />
                <q-skeleton type="text" style="width: 100px" />
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-infinite-scroll>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  // name: 'PageName',
  data() {
    return {
      loading: false,
      data: [],
      page: 0,
      is_refresh: false,
    };
  },
  components: {
    ReviewOverview: defineAsyncComponent(() =>
      import("components/ReviewOverview.vue")
    ),
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasDataSummary() {
      if (Object.keys(this.data_summary).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getReview(index, done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getReview", "page=" + index)
        .then((data) => {
          this.page = index;
          this.data.push(data.details.data);
        })
        .catch((error) => {
          this.data_done = true;
          this.$refs.nscroll.stop();
        })
        .then((data) => {
          done();
          this.loading = false;
        });
    },
    changeColor(data) {
      return data > 0 ? "primary" : "dark";
    },
    refresh(done) {
      this.resetPagination();
      this.page = 0;
      this.is_refresh = true;
      setTimeout(() => {
        this.is_refresh = false;
        done();
      }, 1000);
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
  },
};
</script>
