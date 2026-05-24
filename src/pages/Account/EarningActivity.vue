<template>
  <q-header class="bg-white text-tagam-ink shadow-sm" reveal reveal-offset="50">
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
        $t("Earnings Activity")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
            Earnings activity
          </div>
          <h1 class="m-0 mt-1 text-[28px] font-black text-tagam-ink">
            {{ $t("Earnings Activity") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">
            Order-level earnings, tips and delivery pay.
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
                      label="OK"
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

      <div v-if="date_range" class="mb-3 rounded-[8px] bg-tagam-mint px-4 py-3">
        <div class="text-[12px] font-bold text-tagam-muted">Viewing</div>
        <div class="text-[15px] font-black text-tagam-leafDark">{{ date_range }}</div>
      </div>

      <q-infinite-scroll ref="nscroll" @load="getEarningActivity" :offset="250">
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
                  <q-icon name="receipt_long" size="28px" />
                </div>
                <div class="text-[18px] font-black text-tagam-ink">
                  {{ $t("No available data") }}
                </div>
                <p class="mt-2 text-[13px] font-semibold text-tagam-muted">{{ $t("Pull down the page to refresh") }}</p>
              </div>
            </div>
          </template>

          <q-list separator class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
            <template v-for="itemdata in data" :key="itemdata">
              <q-item v-for="items in itemdata" :key="items" class="px-4 py-3">
                <q-item-section avatar style="min-width: 42px">
                  <q-avatar
                    :color="items.online_payment ? 'blue-8' : 'green-7'"
                    text-color="white"
                    size="md"
                    :icon="
                      items.online_payment
                        ? 'las la-credit-card'
                        : 'las la-hand-holding-usd'
                    "
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-[14px]">
                    <span class="mr-2 font-black text-tagam-ink">{{
                      items.delivery_time
                    }}</span>
                    <span>#{{ items.order_id }}</span>
                  </q-item-label>
                  <q-item-label caption class="font-semibold">{{
                    items.merchant.restaurant_name
                  }}</q-item-label>
                  <q-item-label caption class="text-[12px] font-semibold">{{
                    items.merchant.address
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="font-black text-tagam-leaf">{{ items.delivery_pay }}</q-item-label>
                  <q-item-label
                    v-if="items.courier_tip_raw > 0"
                    caption
                    class="font11"
                    >{{ items.delivery_fee }} + {{ items.courier_tip }}
                    {{ $t("tips") }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>
      </q-infinite-scroll>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn fab icon="keyboard_arrow_up" color="primary" dense unelevated />
      </q-page-scroller>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "EarningActivity",
  components: {
    CalendarHalf: defineAsyncComponent(() =>
      import("components/CalendarHalf.vue")
    ),
  },
  data() {
    return {
      loading: false,
      date_start: "",
      date_end: "",
      data: [],
      page: 0,
      refresh_done: undefined,
      proxyDate: undefined,
      date_range: "",
    };
  },
  created() {
    this.date_start = this.$route.query.start;
    this.date_end = this.$route.query.end;
    this.chart_type = this.$route.query.chart_type;
  },
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
    getEarningActivity(index, done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "orderhistory",
        "page=" +
          index +
          "&date_start=" +
          this.date_start +
          "&date_end=" +
          this.date_end
      )
        .then((data) => {
          this.page = index;
          this.date_range = data.details.date_range;
          this.data.push(data.details.data);
        })
        .catch((error) => {
          if (!APIinterface.empty(this.$refs.nscroll)) {
            this.$refs.nscroll.stop();
          }
          if (Object.keys(this.data).length > 0) {
          } else {
            this.date_range = "";
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
  },
};
</script>
