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
        $t("Bank information")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <template v-if="loading">
      <div
        class="flex flex-center full-width q-pa-xl"
        style="min-height: calc(50vh)"
      >
        <q-spinner color="primary" size="2em" />
      </div>
    </template>

    <section v-else class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">{{ $t("Payout bank") }}</div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">{{ $t("Bank information") }}</h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">{{ $t("Review and update payout bank details") }}.</p>
      </div>
    <q-form @submit="onSubmit" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
      <q-input
        v-model="account_name"
        :label="$t('Bank account holders name')"
        outlined
        color="green-8"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
      </q-input>

      <q-input
        v-model="account_number_iban"
        :label="$t('Bank account number/IBAN')"
        outlined
        color="green-8"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
      </q-input>

      <q-input
        v-model="swift_code"
        :label="$t('Swift Code')"
        outlined
        color="green-8"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
      </q-input>

      <q-input
        v-model="bank_name"
        :label="$t('Bank name in full')"
        outlined
        color="green-8"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
      </q-input>

      <q-input
        v-model="bank_branch"
        :label="$t('Bank branch city')"
        outlined
        color="green-8"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
      </q-input>

      <q-footer class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <q-btn
          type="submit"
          :label="$t('Submit')"
          unelevated
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          size="lg"
          no-caps
          :loading="loading"
        />
      </q-footer>
    </q-form>
    </section>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  // name: 'Bankinfo',
  data() {
    return {
      loading: false,
      account_name: "",
      account_number_iban: "",
      swift_code: "",
      bank_name: "",
      bank_branch: "",
    };
  },
  created() {
    this.getBankinfo();
  },
  methods: {
    getBankinfo() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getBankinfo")
        .then((data) => {
          this.account_name = data.details.account_name;
          this.account_number_iban = data.details.account_number_iban;
          this.swift_code = data.details.swift_code;
          this.bank_name = data.details.bank_name;
          this.bank_branch = data.details.bank_branch;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost("updateBankInfo", {
        account_name: this.account_name,
        account_number_iban: this.account_number_iban,
        swift_code: this.swift_code,
        bank_name: this.bank_name,
        bank_branch: this.bank_branch,
      })
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
