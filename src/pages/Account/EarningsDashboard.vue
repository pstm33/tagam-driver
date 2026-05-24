<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
                Earnings
              </div>
              <h1 class="m-0 mt-1 text-[30px] font-black">
                {{ loading_earnings ? "--" : earnings.pretty }}
              </h1>
              <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
                {{ $t("Total earnings") }} · {{ date_range }}
              </p>
            </div>
            <q-btn-group unelevated class="overflow-hidden rounded-[8px] bg-white/10">
              <q-btn
                :class="chart_type == 'daily' ? 'bg-tagam-amber text-white' : 'bg-transparent text-white'"
                :label="$t('Daily')"
                no-caps
                @click="setDate('daily')"
              />
              <q-btn
                :class="chart_type == 'daily' ? 'bg-transparent text-white' : 'bg-tagam-amber text-white'"
                :label="$t('Weekly')"
                no-caps
                @click="setDate('weekly')"
              />
            </q-btn-group>
          </div>
        </div>

        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
          <template v-if="loading_earnings">
            <q-skeleton height="112px" square />
          </template>
          <template v-else>
              <apexchart
                type="bar"
                :options="chartOptions"
                :series="series"
                height="112"
              ></apexchart>
          </template>
        </div>

        <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <template v-if="loading_earnings">
            <div
              class="flex flex-center full-width q-pa-xl"
              style="min-height: calc(25vh)"
            >
              <q-spinner color="primary" size="2em" />
            </div>
          </template>
          <template v-else>
            <div class="px-4 pt-4">
              <div class="text-[12px] font-bold text-tagam-muted">{{ date_range }}</div>
            </div>
            <q-list separator dense>
              <q-item class="px-4 py-3">
                <q-item-section class="font-bold text-tagam-muted">{{ $t("Total Trips") }}</q-item-section>
                <q-item-section side class="text-[18px] font-black text-tagam-ink">{{ summary.total_trip }}</q-item-section>
              </q-item>
            </q-list>

            <div class="p-4">
              <q-btn
                :label="$t('View details')"
                no-caps
                unelevated
                class="h-12 w-full rounded-[8px] bg-tagam-canvas font-black text-tagam-ink"
                :to="{
                  name: 'earning-details',
                  query: {
                    start: date_start,
                    end: date_end,
                    chart_type: chart_type,
                  },
                }"
              ></q-btn>
              <!-- to="/account/earning-details" -->
            </div>
          </template>

          <q-separator></q-separator>

          <q-card-section>
            <template v-if="loading_earnings">
              <div
                class="flex flex-center full-width q-pa-xl"
                style="min-height: calc(20vh)"
              >
                <q-spinner color="primary" size="2em" />
              </div>
            </template>
            <template v-else>
              <!-- <div class="text-h7 q-mb-sm">Balance : {{ balance.pretty }}</div> -->
              <q-list class="dense">
                <q-item
                  class="q-ma-none q-pa-none"
                  clickable
                  to="/account/cashout-history"
                >
                  <q-item-section
                    ><div class="text-[16px] font-black text-tagam-ink">
                      {{ $t("Balance") }} : {{ balance.pretty }}
                    </div></q-item-section
                  >
                  <q-item-section side>
                    <q-btn
                      round
                      color="dark"
                      icon="las la-angle-right"
                      flat
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-btn
                :label="$t('Cash out')"
                no-caps
                unelevated
                size="lg"
                to="/account/cashout"
                :disable="can_cashout"
                class="mt-4 h-12 rounded-[8px] bg-tagam-leaf px-6 font-black text-white"
              ></q-btn>
              <q-space class="q-pa-xs"></q-space>
              <p class="text-[13px] font-semibold text-tagam-muted">{{ max_cashout }}</p>
            </template>
          </q-card-section>
        </div>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import APIinterface from "src/api/APIinterface";
import VueApexCharts from "vue3-apexcharts";
import { DateTime } from "luxon";

export default {
  name: "EarningsDashboard",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      loading: false,
      first_loading: false,
      loading_earnings: false,
      date_start: "",
      date_end: "",
      chart_type: "",
      balance: [],
      can_cashout: true,
      earnings: [],
      charts_data: [],
      max_cashout: 0,
      summary: [],
      date_range: "",
      payload: [],
      chartOptions: {
        chart: {
          id: "vuechart",
          type: "bar",
          height: "auto",
          toolbar: {
            show: false,
          },
          parentHeightOffset: 0,
        },
        plotOptions: {
          bar: {
            colors: {
              ranges: [
                {
                  from: -999999,
                  to: 0,
                  color: "#f44336",
                },
              ],
            },
          },
        },
        dataLabels: {
          enabled: false,
          position: "bottom",
        },
        colors: ["#81c784"],
        axisBorder: {
          show: false,
        },
        grid: {
          show: false,
          padding: {
            left: 0,
            right: 0,
          },
        },
        xaxis: {
          categories: ["M", "T", "W", "T", "F"],
        },
        yaxis: {
          show: false,
        },
      },
      series: [
        {
          name: "series-1",
          data: [1, -2, 3, 4, 5],
        },
      ],
    };
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.date_start = APIinterface.getDateNow();
    this.date_end = APIinterface.getDateNow();
    this.chart_type = "daily";

    this.Activity.setTitle(this.$t("Earnings"));
    this.refresh(null);
  },
  computed: {},
  methods: {
    setDate(data) {
      this.chart_type = data;
      if (data == "daily") {
        this.date_start = APIinterface.getDateNow();
        this.date_end = APIinterface.getDateNow();
      } else {
        this.date_start = DateTime.now()
          .minus({ days: 6 })
          .toFormat("yyyy-MM-dd");
        this.date_end = APIinterface.getDateNow();
      }
      this.refresh(null);
    },
    refresh(done) {
      this.getWalletBalance(done);
      this.getEarning(done);
    },
    getEarning(done) {
      if (this.first_loading) {
        APIinterface.showLoadingBox("", this.$q);
      } else {
        this.loading_earnings = true;
      }
      APIinterface.fetchDataByTokenPost(
        "getEarnings",
        "date_start=" +
          this.date_start +
          "&date_end=" +
          this.date_end +
          "&chart_type=" +
          this.chart_type
      )
        .then((data) => {
          this.first_loading = true;
          this.date_range = data.details.date_range;
          this.earnings = data.details.balance;
          this.charts_data = data.details.charts_data;
          this.max_cashout = data.details.max_cashout;
          this.summary = data.details.summary;

          this.chartOptions = {
            chart: {
              id: "vuechart",
              type: "bar",
              height: "auto",
              toolbar: {
                show: false,
              },
              parentHeightOffset: 0,
            },
            plotOptions: {
              bar: {
                colors: {
                  ranges: [
                    {
                      from: -999999,
                      to: 0,
                      color: "#f44336",
                    },
                  ],
                },
              },
            },
            dataLabels: {
              enabled: false,
              position: "bottom",
            },
            colors: ["#81c784"],
            axisBorder: {
              show: false,
            },
            grid: {
              show: false,
              padding: {
                left: 0,
                right: 0,
              },
            },
            xaxis: {
              categories: this.charts_data.date_range,
            },
            yaxis: {
              show: false,
            },
          };

          this.series = [
            {
              name: this.$t("Sale"),
              data: this.charts_data.data,
            },
          ];
        })
        .catch((error) => {
          this.summary = [];
        })
        .then((data) => {
          if (this.first_loading) {
            APIinterface.hideLoadingBox(this.$q);
          }
          this.loading_earnings = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getWalletBalance(done) {
      if (this.first_loading) {
        APIinterface.showLoadingBox("", this.$q);
      } else {
        this.loading = true;
      }
      APIinterface.fetchDataByTokenPost2("getWalletBalance", {
        payload: this.payload,
      })
        .then((data) => {
          this.balance = data.details.balance;
          this.cashout_miximum = data.details.cashout_miximum;
          if (this.balance.raw > 0) {
            this.can_cashout = false;
          }
        })
        .catch((error) => {})
        .then((data) => {
          if (this.first_loading) {
            APIinterface.hideLoadingBox(this.$q);
          }
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
  },
};
</script>
