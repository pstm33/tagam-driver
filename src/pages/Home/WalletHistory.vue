<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
                Wallet
              </div>
              <h1 class="m-0 mt-1 text-[28px] font-black">
                {{ loading ? "--" : balance.pretty }}
              </h1>
              <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
                {{ $t("Available balance") }}
              </p>
            </div>
            <q-btn
              v-if="!loading"
              unelevated
              no-caps
              class="h-11 rounded-[8px] bg-tagam-gold px-4 font-black text-white"
              @click="showCashin"
            >
              {{ $t("CASH IN") }}
            </q-btn>
          </div>
        </div>

        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-3 shadow-tagam-card">
          <div class="flex items-center gap-2">
            <div class="min-w-0 flex-1">
            <CalendarHalf
              ref="calendar"
              @after-selectdate="afterSelectdate"
              :today_date="date_selected"
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

        <div class="mb-3 flex items-center justify-between">
          <div class="text-[18px] font-black">{{ $t("Wallet transactions") }}</div>
          <div>
            <q-btn
              v-if="date_selected || date_start"
              round
              icon="las la-sync-alt"
              unelevated
              class="bg-white text-tagam-sky shadow-sm"
              @click="resetFilter"
            />
          </div>
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
              <template v-if="!loading_summary && !hasData">
                <div class="flex flex-center" style="min-height: calc(50vh)">
                  <div class="text-center">
                    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
                      <q-icon name="account_balance_wallet" size="28px" />
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
                      <q-avatar color="green-7" text-color="white" size="md" icon="las la-wallet" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-[15px] font-black text-tagam-ink">{{
                        items.transaction_amount
                      }}</q-item-label>
                      <q-item-label caption class="font-semibold">{{
                        items.transaction_description
                      }}</q-item-label>
                      <q-item-label caption class="text-[12px] font-semibold">{{
                        items.transaction_date
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side class="font-black text-tagam-leaf">{{
                      items.running_balance
                    }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </template>
          </q-infinite-scroll>
        </div>
      </section>
    </q-page>
    <CashinAmountselection ref="cashin"></CashinAmountselection>
  </q-pull-to-refresh>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "WalletHistory",
  data() {
    return {
      date_selected: "",
      date_start: "",
      date_end: "",
      loading: false,
      loading_summary: false,
      balance: [],
      data: [],
      page: 0,
      proxyDate: undefined,
      date_now: "",
    };
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.Activity.setTitle(this.$t("Wallet"));
    this.date_now = APIinterface.getDateNow();
    this.getWalletBalance();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  components: {
    CalendarHalf: defineAsyncComponent(() =>
      import("components/CalendarHalf.vue")
    ),
    CashinAmountselection: defineAsyncComponent(() =>
      import("components/CashinAmountselection.vue")
    ),
  },
  methods: {
    getWalletBalance(done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getWalletBalance")
        .then((data) => {
          this.balance = data.details.balance;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    afterSelectdate(data) {
      this.date_selected = data;
      this.resetPagination();
    },
    getHistory(index, done) {
      this.loading_summary = true;
      APIinterface.fetchDataByTokenPost(
        "walletHistory",
        "page=" +
          index +
          "&date=" +
          this.date_selected +
          "&date_start=" +
          this.date_start +
          "&date_end=" +
          this.date_end
      )
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
          done();
          this.loading_summary = false;
        });
    },
    refresh(done) {
      this.getWalletBalance(done);
      this.resetPagination();
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    resetFilter() {
      this.date_selected = "";
      this.date_start = "";
      this.resetPagination();
    },
    updateProxy() {
      console.log("updateProxy=>" + this.date_now);
      this.proxyDate = this.date_now;
    },
    filterByDate() {
      console.log(this.proxyDate);
      this.date_start = this.proxyDate.from;
      this.date_end = this.proxyDate.to;
      this.date_selected = "";
      this.resetPagination();
    },
    showCashin() {
      this.$refs.cashin.dialog = true;
    },
  },
};
</script>
