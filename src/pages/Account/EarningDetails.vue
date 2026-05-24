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
        $t("Earnings")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
              {{ $t("Earnings detail") }}
            </div>
            <h1 class="m-0 mt-1 text-[30px] font-black">{{ balance || "--" }}</h1>
            <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
              {{ date_range || $t("Total earnings") }}
            </p>
          </div>
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

      <template v-if="loading">
        <div
          class="flex flex-center full-width q-pa-xl"
          style="min-height: calc(50vh)"
        >
          <q-spinner color="primary" size="2em" />
        </div>
      </template>
      <template v-else>
        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
          <div class="flex items-center justify-between">
            <q-btn
              round
              unelevated
              class="bg-tagam-canvas text-tagam-ink"
              icon="las la-angle-left"
              size="sm"
              :disable="!canMovePrev"
              @click="PreviousEarnings"
            />
            <div class="max-w-[250px] truncate text-[14px] font-black text-tagam-ink">
              {{ date_range }}
            </div>
            <q-btn
              round
              unelevated
              class="bg-tagam-canvas text-tagam-ink"
              icon="las la-angle-right"
              size="sm"
              :disable="!canMoveNext"
              @click="NextEarnings"
            />
          </div>
          <apexchart
            type="bar"
            :options="chartOptions"
            :series="series"
            height="150"
          ></apexchart>
        </div>

        <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <!-- <pre>{{ summary }}</pre> -->
          <q-list separator dense>
            <q-item class="px-4 py-3">
              <q-item-section class="font-bold text-tagam-muted">{{ $t("Delivery pay") }}</q-item-section>
              <q-item-section side class="font-black text-tagam-ink">{{ summary.total_delivery }}</q-item-section>
            </q-item>
            <q-item class="px-4 py-3">
              <q-item-section class="font-bold text-tagam-muted">{{ $t("Tips") }}</q-item-section>
              <q-item-section side class="font-black text-tagam-ink">{{ summary.total_tips }}</q-item-section>
            </q-item>
            <q-item class="px-4 py-3">
              <q-item-section class="font-bold text-tagam-muted">{{ $t("Incentives") }}</q-item-section>
              <q-item-section side class="font-black text-tagam-ink">{{
                summary.total_incentives
              }}</q-item-section>
            </q-item>
            <q-item class="px-4 py-3">
              <q-item-section class="font-bold text-tagam-muted">{{ $t("Adjustment") }}</q-item-section>
              <q-item-section side class="font-black text-tagam-ink">{{
                summary.total_adjustment
              }}</q-item-section>
            </q-item>
          </q-list>
          <div class="p-4">
          <q-btn
            class="h-12 w-full rounded-[8px] bg-tagam-leaf font-black text-white"
            size="lg"
            unelevated
            no-caps
            :to="{
              name: 'earning-activity',
              query: {
                start: date_start,
                end: date_end,
                chart_type: chart_type,
              },
            }"
            >{{ $t("View earnings activity") }}</q-btn
          >
          </div>
        </div>
      </template>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import VueApexCharts from "vue3-apexcharts";
import { DateTime } from "luxon";

export default {
  name: "EarningDetails",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      loading: false,
      first_loading: false,
      date_start: "",
      date_end: "",
      chart_type: "",
      summary: [],
      balance: "",
      date_range: "",
      charts_data: [],
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
        dataLabels: {
          enabled: false,
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
          categories: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        },
        yaxis: {
          show: false,
        },
      },
      series: [
        {
          name: "series-1",
          data: [1, 2, 3, 4, 5, 2, 10],
        },
      ],
    };
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    canMoveNext() {
      const dateNow = APIinterface.getDateNow();
      var d1 = DateTime.fromISO(dateNow);
      var d2 = DateTime.fromISO(this.date_end);
      if (d1.equals(d2)) {
        return false;
      } else return true;
    },
    canMovePrev() {
      const dateNow = APIinterface.getDateNow();
      var d1 = DateTime.fromISO(dateNow);
      var d2 = DateTime.fromISO(this.date_end);
      return d2 <= d1;
    },
  },
  created() {
    this.date_start = this.$route.query.start;
    this.date_end = this.$route.query.end;
    this.chart_type = this.$route.query.chart_type;
    this.getEarningDetails(null);
  },
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
      this.getEarningDetails(done);
    },
    PreviousEarnings() {
      if (this.chart_type == "daily") {
        console.log("daily");
        let dateStart = DateTime.fromISO(this.date_start);
        dateStart = dateStart.minus({ days: 1 }).toFormat("yyyy-MM-dd");
        this.date_start = dateStart;
        this.date_end = dateStart;
      } else {
        let dateStart = DateTime.fromISO(this.date_start);
        let dateEnd = DateTime.fromISO(this.date_start).toFormat("yyyy-MM-dd");
        dateStart = dateStart.minus({ days: 6 }).toFormat("yyyy-MM-dd");
        this.date_start = dateStart;
        this.date_end = dateEnd;
      }
      this.refresh(null);
    },
    NextEarnings() {
      if (this.chart_type == "daily") {
        console.log("daily");
        let dateStart = DateTime.fromISO(this.date_start);
        dateStart = dateStart.plus({ days: 1 }).toFormat("yyyy-MM-dd");
        this.date_start = dateStart;
        this.date_end = dateStart;
      } else {
        let dateStart = DateTime.fromISO(this.date_end).toFormat("yyyy-MM-dd");
        let dateEnd = DateTime.fromISO(this.date_end);
        dateEnd = dateEnd.plus({ days: 6 }).toFormat("yyyy-MM-dd");
        this.date_start = dateStart;
        this.date_end = dateEnd;
      }
      this.refresh(null);
    },
    getEarningDetails(done) {
      if (this.first_loading) {
        APIinterface.showLoadingBox("", this.$q);
      } else {
        this.loading = true;
      }
      APIinterface.fetchDataByTokenPost(
        "getEarningDetails",
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
          this.balance = data.details.balance;
          this.summary = data.details.summary;
          this.charts_data = data.details.charts_data;
          this.plotChart();
        })
        .catch((error) => {
          this.summary = [];
        })
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
    plotChart() {
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
          name: "Sale",
          data: this.charts_data.data,
        },
      ];
    },
  },
};
</script>
