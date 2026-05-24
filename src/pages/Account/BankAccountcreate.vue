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
        $t("Bank account")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">Payout bank</div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">
          {{ $t("Bank account details") }}
        </h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
          {{ $t("Please enter correct bank details to avoid delayed payment") }}.
        </p>
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
        :label="$t('Bank branch')"
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
  name: "BankAccountcreate",
  data() {
    return {
      loading: false,
      data: [],
      account_name: "",
      account_number_iban: "",
      swift_code: "",
      bank_name: "",
      bank_branch: "",
    };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost2("Addbankaccount", {
        account_name: this.account_name,
        account_number_iban: this.account_number_iban,
        swift_code: this.swift_code,
        bank_name: this.bank_name,
        bank_branch: this.bank_branch,
      })
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          this.$router.push("/account/cashout");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
