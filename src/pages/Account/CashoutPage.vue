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
        $t("Cash out")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-32 pt-5 text-tagam-ink">
      <template v-if="loading">
        <div
          class="flex flex-center full-width q-pa-xl"
          style="min-height: calc(20vh)"
        >
          <q-spinner color="primary" size="2em" />
        </div>
      </template>
      <template v-else>
        <section class="mx-auto max-w-4xl">
          <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
                  Payout
                </div>
                <h1 class="m-0 mt-1 text-[30px] font-black">
                  {{ balance.pretty }}
                </h1>
                <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
                  {{ $t("Total earnings") }}
                </p>
              </div>
              <div class="rounded-[8px] bg-white/10 px-3 py-2 text-right">
                <div class="text-[11px] font-bold text-white/65">{{ $t("Cashout") }}</div>
                <div class="text-[17px] font-black">
                  <NumberFormat :amount="totalCashout"></NumberFormat>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
            <div class="mb-3 flex items-center justify-between">
              <div class="text-[16px] font-black">{{ $t("Edit amount") }}</div>
              <q-btn flat dense no-caps class="font-black text-tagam-sky">
                {{ $t("Edit amount") }}
                <q-popup-edit
                  v-model="totalCashout"
                  auto-save
                  v-slot="scope"
                  :validate="validateCashout"
                >
                  <q-input
                    v-model="scope.value"
                    dense
                    autofocus
                    counter
                    @keyup.enter="scope.set"
                  />
                </q-popup-edit>
              </q-btn>
            </div>

            <q-list separator>
              <q-item class="px-0 py-3">
                <q-item-section class="font-bold text-tagam-muted">{{ $t("Cashout") }}</q-item-section>
                <q-item-section side class="font-black text-tagam-ink">
                  <NumberFormat :amount="totalCashout"></NumberFormat>
                </q-item-section>
              </q-item>

              <q-item class="px-0 py-3">
                <q-item-section class="font-bold text-tagam-muted">{{ $t("Processing fee") }}</q-item-section>
                <q-item-section side class="font-black text-tagam-ink">{{ cashout_fee.pretty }}</q-item-section>
              </q-item>
              <q-item v-if="!hasBankaccount" class="px-0 py-3">
                <q-item-section>
                  <q-btn class="h-11 rounded-[8px] bg-tagam-canvas font-black text-tagam-ink" unelevated no-caps to="/account/add-bank">{{
                    $t("Add Bank Account")
                  }}</q-btn>
                </q-item-section>
              </q-item>
              <q-item v-else class="px-0 py-3">
                <q-item-section class="font-bold text-tagam-muted">{{ $t("Bank Account") }}</q-item-section>
                <q-item-section side class="font-black text-tagam-ink">
                  {{ bank_account.account_type }} -
                  {{ bank_account.account_number }}</q-item-section
                >
              </q-item>
            </q-list>

            <p class="mb-0 mt-4 text-[13px] font-semibold leading-6 text-tagam-muted">
              {{
                $t(
                  "After confirming money will be transfered to you bank account"
                )
              }}.
              {{
                $t(
                  "It usually takes 2-4 business days for transfers like this to go through"
                )
              }}.
            </p>
          </div>
        </section>

        <q-footer class="bg-white/90 p-4 text-tagam-ink shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div class="mx-auto mb-3 flex max-w-4xl items-center justify-between">
            <div class="font-bold text-tagam-muted">{{ $t("You receive") }}</div>
            <div class="text-[18px] font-black">
              <NumberFormat
                :amount="totalCashout - cashout_fee.value"
              ></NumberFormat>
            </div>
          </div>

          <template v-if="can_cashout && hasBankaccount">
            <q-list bordered separator class="mx-auto max-w-4xl overflow-hidden rounded-[8px]">
              <q-slide-item
                @left="confirmCashout"
                left-color="green-4"
              >
                <template v-slot:left>
                  <q-spinner color="primary" size="2em" />
                </template>
                <q-item
                  class="h-14 bg-tagam-amber text-white"
                >
                  <q-item-section class="text-center text-[17px] font-black">{{
                    $t("Confirm Transfer")
                  }}</q-item-section>
                  <q-item-section avatar>
                    <q-avatar
                      text-color="white"
                      class="bg-white/15"
                      icon="las la-arrow-right"
                    />
                  </q-item-section>
                </q-item>
              </q-slide-item>
            </q-list>
          </template>
          <template v-else>
            <q-btn
              size="lg"
              :label="$t('Confirm Transfer')"
              unelevated
              class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-slate-300 font-black text-white"
              no-caps
              disable
            />
          </template>
        </q-footer>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useActivityStore } from "stores/ActivityStore";

export default {
  name: "CashoutPage",
  components: {
    NumberFormat: defineAsyncComponent(() =>
      import("components/NumberFormat.vue")
    ),
  },
  data() {
    return {
      loading: false,
      first_loading: false,
      balance: [],
      can_cashout: false,
      payload: ["processing_fee", "get_bank_account", "max_cashout"],
      bank_account: [],
      cashout_fee: [],
      totalCashout: 0,
      label: this.$t("Edit amount"),
      //total_cashout: [],
    };
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.getWalletBalance();
  },
  computed: {
    hasBankaccount() {
      if (Object.keys(this.bank_account).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    refresh(done) {
      this.getWalletBalance(done);
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
          this.first_loading = true;
          this.balance = data.details.balance;
          this.bank_account = data.details.bank_accout;
          this.cashout_fee = data.details.cashout_fee;

          this.Activity.money_config = data.details.money_config;

          // this.totalCashout =
          //   parseFloat(this.balance.raw) - parseFloat(this.cashout_fee.value);
          this.totalCashout = parseFloat(this.balance.raw);

          //this.total_cashout = data.details.total_cashout;

          if (this.totalCashout > 0) {
            this.can_cashout = true;
          } else {
            this.can_cashout = false;
          }
        })
        .catch((error) => {
          this.bank_account = [];
          this.balance = [];
          this.cashout_fee = [];
          //this.total_cashout = [];
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    confirmCashout(done) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost(
        "RequestPayout",
        "amount=" + this.totalCashout
      )
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          this.$router.replace({
            path: "/account/cashout-succesful",
            query: { id: data.details },
          });
        })
        .catch((error) => {
          done.reset();
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    validateCashout(data) {
      if (parseFloat(data) > parseFloat(this.balance.raw)) {
        APIinterface.notify(
          "dark",
          this.$t("Cash out amount should not be greater than earnings"),
          "error_outline",
          this.$q
        );
        return false;
      }
      return true;
    },
  },
};
</script>
