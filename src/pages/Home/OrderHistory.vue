<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
                {{ $t("Delivery ledger") }}
              </div>
              <h1 class="m-0 mt-1 text-[28px] font-black text-tagam-ink">
                {{ $t("History") }}
              </h1>
              <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">
                {{ $t("Completed orders, collected cash and delivery pay by date") }}.
              </p>
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
                    <q-btn :label="$t('Cancel')" color="primary" flat v-close-popup />
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

        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-3 shadow-tagam-card">
          <CalendarHalf
            ref="calendar"
            @after-selectdate="afterSelectdate"
            :today_date="date_start"
          ></CalendarHalf>
        </div>

        <!-- <CalendarHalf
          ref="calendar"
          @after-selectdate="afterSelectdate"
          :today_date="date_start"
        ></CalendarHalf> -->

        <template v-if="loading_summary">
          <div class="q-mb-sm">
            <div class="row q-col-gutter-sm">
              <div v-for="items in 3" :key="items" class="col">
                <q-skeleton height="60px" square />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <swiper
            :slidesPerView="2.15"
            :spaceBetween="10"
            @swiper="onSwiper"
            class="mb-5"
          >
            <swiper-slide>
              <div class="rounded-[8px] bg-tagam-ink p-4 text-white">
                <div class="text-[12px] font-bold text-white/70">{{ $t("Total delivered") }}</div>
                <div class="mt-1 text-[22px] font-black">
                  {{ summary_data.total_deliveries }}
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="rounded-[8px] bg-tagam-leaf p-4 text-white">
                <div class="text-[12px] font-bold text-white/80">{{ $t("Cash collected") }}</div>
                <div class="mt-1 text-[22px] font-black">
                  {{ summary_data.cash_collected }}
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="rounded-[8px] bg-tagam-amber p-4 text-white">
                <div class="text-[12px] font-bold text-white/85">{{ $t("Delivery pay") }}</div>
                <div class="mt-1 text-[22px] font-black">
                  {{ summary_data.total_delivery_pay }}
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div class="rounded-[8px] bg-tagam-sky p-4 text-white">
                <div class="text-[12px] font-bold text-white/80">{{ $t("Total Tips") }}</div>
                <div class="mt-1 text-[22px] font-black">
                  {{ summary_data.total_tips }}
                </div>
              </div>
            </swiper-slide>
          </swiper>
        </template>

        <div class="mb-3 flex items-center justify-between">
          <div class="text-[18px] font-black">{{ $t("Transaction history") }}</div>
          <div class="text-[12px] font-bold text-tagam-muted">{{ date_start }}{{ date_end && date_end !== date_start ? " - " + date_end : "" }}</div>
        </div>

        <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <q-infinite-scroll ref="nscroll" @load="getHistory" :offset="250">
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
                <div class="flex flex-center" style="min-height: calc(50vh)">
                  <div class="text-center">
                    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
                      <q-icon name="receipt_long" size="28px" />
                    </div>
                    <div class="text-[18px] font-black text-tagam-ink">
                      {{ $t("No available data") }}
                    </div>
                    <p class="mt-2 text-[13px] font-semibold text-tagam-muted">
                      {{ $t("Pull down the page to refresh") }}
                    </p>
                  </div>
                </div>
              </template>

              <q-list separator>
                <template v-for="itemdata in data" :key="itemdata">
                  <q-item v-for="items in itemdata" :key="items" class="px-4 py-3">
                    <q-item-section avatar style="min-width: 42px">
                      <!-- green-4 -->
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
                      <q-item-label class="text-[15px] font-black text-tagam-ink">#{{ items.order_id }}</q-item-label>
                      <q-item-label caption class="font-semibold">{{
                        items.merchant.restaurant_name
                      }}</q-item-label>
                      <q-item-label caption class="text-[12px] font-semibold">{{
                        items.total
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
                    <!-- <q-item-section side> {{ items.total }}</q-item-section> -->
                  </q-item>
                </template>
              </q-list>
            </template>
          </q-infinite-scroll>
        </div>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "PageName",
  data() {
    return {
      calendar: "1",
      loading: true,
      loading_summary: true,
      data: [],
      page: 0,
      data_done: false,
      order_meta: [],
      merchant: [],
      payment_list: [],
      summary_data: [],
      date_start: "",
      date_end: "",
      proxyDate: undefined,
    };
  },
  components: {
    Swiper,
    SwiperSlide,
    CalendarHalf: defineAsyncComponent(() =>
      import("components/CalendarHalf.vue")
    ),
    //LoaderOrder: defineAsyncComponent(() => import("components/LoaderOrder.vue")),
    //CalendarWeekly: defineAsyncComponent(() => import("components/CalendarWeekly.vue")),
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.Activity.setTitle(this.$t("History"));
    this.date_start = APIinterface.getDateNow();
    this.date_end = APIinterface.getDateNow();
    this.getDeliverySummary();
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
    filterByDate() {
      this.date_start = this.proxyDate.from;
      this.date_end = this.proxyDate.to;
      this.resetPagination();
    },
    afterSelectdate(data) {
      console.log(data);
      this.date_start = data;
      this.date_end = data;
      this.resetPagination();
      this.getDeliverySummary();
    },
    refresh(done) {
      this.getDeliverySummary(done);
      this.resetPagination();
    },
    getDeliverySummary(done) {
      this.loading_summary = true;
      APIinterface.fetchDataByTokenPost(
        "deliverysummary",
        "date_start=" + this.date_start + "&date_end=" + this.date_end
      )
        .then((data) => {
          this.summary_data = data.details;
        })
        .catch((error) => {
          this.summary_data = [];
        })
        .then((data) => {
          this.loading_summary = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getHistory(index, done) {
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
          this.data.push(data.details.data);
          this.order_meta = data.details.order_meta;
        })
        .catch((error) => {
          if (!APIinterface.empty(this.$refs.nscroll)) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          done();
          this.loading = false;
        });
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.order_meta = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    //
  },
};
</script>
