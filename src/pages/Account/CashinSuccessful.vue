<template>
  <q-header class="bg-white text-tagam-ink shadow-sm">
    <q-toolbar class="mx-auto max-w-4xl">
      <q-toolbar-title class="text-[18px] font-black">{{
        $t("Cash In")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="flex min-h-screen items-center bg-tagam-canvas px-4 py-8 text-tagam-ink">
    <template v-if="loading">
      <q-spinner color="primary" size="2em" />
    </template>

    <template v-else>
      <div class="mx-auto w-full max-w-[460px] rounded-[8px] border border-tagam-line bg-white p-6 text-center shadow-tagam-card">
        <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-tagam-mint text-tagam-leaf">
          <q-icon name="check" size="34px" />
        </div>
        <div class="text-[24px] font-black text-tagam-ink">{{ $t("Cash in Successful") }}</div>
        <div class="mt-3 text-[14px] font-semibold leading-6 text-tagam-muted">
          {{ data.message }}
        </div>
        <div class="mt-4 text-[13px] font-bold text-tagam-muted">
          {{ data.cashout_left }}
        </div>
      </div>

      <q-footer class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <q-btn
          type="submit"
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          unelevated
          :label="$t('Done')"
          no-caps
          size="lg"
          to="/home/wallet"
        />
      </q-footer>
    </template>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "CashinSuccessful",
  data() {
    return {
      data: [],
      loading: "",
      transaction_id: "",
    };
  },
  created() {
    this.transaction_id = this.$route.query.id;
    this.getCashinTransaction();
  },
  methods: {
    getCashinTransaction() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "getCashinTransaction",
        "transaction_id=" + this.transaction_id
      )
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.$router.push("/404");
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
