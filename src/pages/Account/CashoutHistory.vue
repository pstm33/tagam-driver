<template>
  <q-header class="bg-white text-tagam-ink shadow-sm">
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        unelevated
        round
        dense
        icon="arrow_back"
        class="bg-tagam-canvas text-tagam-ink"
      />
      <q-toolbar-title class="text-[18px] font-black">{{
        $t("Cash out history")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
            Payout ledger
          </div>
          <h1 class="m-0 mt-1 text-[28px] font-black text-tagam-ink">
            {{ $t("Cash out history") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">
            Track payout requests, approvals and transfer status.
          </p>
        </div>

        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-3 shadow-tagam-card">
          <div class="flex items-center gap-2">
            <div class="min-w-0 flex-1">
            <CalendarHalf
              ref="calendar"
              @after-selectdate="afterSelectdate"
              :today_date="date_start"
            ></CalendarHalf>
            </div>
            <q-btn icon="event" round unelevated class="bg-tagam-canvas text-tagam-ink">
              <q-popup-proxy
                @before-show="updateProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="proxyDate" mask="YYYY-MM-DD" range>
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Cancel" color="primary" flat v-close-popup />
                    <q-btn
                      :label="$t('OK')"
                      color="primary"
                      flat
                      @click="filterByDate"
                      v-close-popup
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
          </div>
        </div>

      <q-infinite-scroll ref="nscroll" @load="getCashoutHistory" :offset="250">
        <template v-slot:loading>
          <template v-if="page <= 0">
            <div
              class="flex flex-center full-width q-pa-xl"
              style="min-height: calc(30vh)"
            >
              <q-spinner color="primary" size="2em" />
            </div>
          </template>
          <template v-else>
            <div v-if="data.length > 1" class="text-center">
              <q-circular-progress
                indeterminate
                rounded
                size="30px"
                color="primary"
                class="q-ma-md"
              />
            </div>
          </template>
        </template>
        <template v-slot:default>
          <template v-if="!loading && !hasData">
            <div class="flex flex-center rounded-[8px] border border-dashed border-tagam-line bg-white shadow-tagam-card" style="min-height: calc(50vh)">
              <div class="text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
                  <q-icon name="payments" size="28px" />
                </div>
                <div class="text-[18px] font-black text-tagam-ink">
                  {{ $t("No available data") }}
                </div>
                <p class="mt-2 text-[13px] font-semibold text-tagam-muted">{{ $t("Pull down the page to refresh") }}</p>
              </div>
            </div>
          </template>
          <template v-else>
            <q-list separator class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
              <template v-for="itemdata in data" :key="itemdata">
                <q-item v-for="items in itemdata" :key="items" class="px-4 py-3">
                  <q-item-section avatar>
                    <q-avatar :color="changeColor(items.status_raw)" :text-color="changeTextColor(items.status_raw)" icon="las la-money-check-alt" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-[12px]">
                      <q-badge
                        :color="changeColor(items.status_raw)"
                        :text-color="changeTextColor(items.status_raw)"
                        :label="items.status"
                        class="text-weight-bold"
                      />
                    </q-item-label>
                    <q-item-label caption class="mt-1 font-semibold">{{ items.description }}</q-item-label>
                    <q-item-label caption class="text-[12px] font-semibold">{{
                      items.date
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side class="font-black text-tagam-ink">
                    {{ items.amount }}
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </template>
        </template>
      </q-infinite-scroll>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "CashoutHistory",
  data() {
    return {
      loading: false,
      data: [],
      page: 0,
      refresh_done: undefined,
      date_start: "",
      date_end: "",
      proxyDate: undefined,
    };
  },
  components: {
    CalendarHalf: defineAsyncComponent(() =>
      import("components/CalendarHalf.vue")
    ),
  },
  created() {},
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    afterSelectdate(data) {
      this.date_start = data;
      this.date_end = data;
      this.resetPagination();
    },
    filterByDate() {
      this.date_start = this.proxyDate.from;
      this.date_end = this.proxyDate.to;
      this.resetPagination();
    },
    refresh(done) {
      this.refresh_done = done;
      this.resetPagination();
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    getCashoutHistory(index, done) {
      this.loading = true;
      APIinterface.fetchDataByToken("getCashoutHistory", {
        page: index,
        date_start: this.date_start,
        date_end: this.date_end,
      })
        .then((data) => {
          this.page = index;
          this.data.push(data.details.data);
        })
        .catch((error) => {
          if (!APIinterface.empty(this.$refs.nscroll)) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          if (!APIinterface.empty(done)) {
            done();
          }
          if (!APIinterface.empty(this.refresh_done)) {
            this.refresh_done();
          }
          this.loading = false;
        });
    },
    changeColor(data) {
      if (data == "paid") {
        return "green-4";
      } else if (data == "cancelled") {
        return "red-4";
      }
      return "grey-2";
    },
    changeTextColor(data) {
      if (data == "paid") {
        return "white";
      } else if (data == "cancelled") {
        return "white";
      }
      return "dark";
    },
  },
};
</script>
