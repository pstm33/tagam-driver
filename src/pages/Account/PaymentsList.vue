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
        $t("Payments")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
            Payment methods
          </div>
          <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">
            {{ $t("Payments") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
            Saved cards and wallets for courier balance top-ups.
          </p>
        </div>

        <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white p-2 shadow-tagam-card">
          <SavedPaymentlist
            ref="saved_payment"
            @set-paymentuuid="setPaymentuuid"
            @after-getpayment="afterGetpayment"
            @set-loading="setLoading"
          ></SavedPaymentlist>
        </div>

      <template v-if="!loading && !has_data">
        <div class="mt-4 flex min-h-[34vh] items-center justify-center rounded-[8px] border border-dashed border-tagam-line bg-white p-7 text-center shadow-tagam-card">
          <div>
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
              <q-icon name="credit_card" size="28px" />
            </div>
            <div class="text-[18px] font-black text-tagam-ink">
              {{ $t("No Payment available") }}
            </div>
            <p class="mt-2 text-[13px] font-semibold text-tagam-muted">
              {{ $t("you have not added payment yet") }}
            </p>
          </div>
        </div>
      </template>
      </section>
      <q-footer class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <q-btn
          :label="$t('Add new payment')"
          unelevated
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          size="lg"
          no-caps
          :loading="loading"
          to="/account/payment-add"
        />
      </q-footer>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
export default {
  name: "PaymentsList",
  data() {
    return {
      has_data: false,
      loading: false,
    };
  },
  components: {
    SavedPaymentlist: defineAsyncComponent(() =>
      import("components/SavedPaymentlist.vue")
    ),
  },
  methods: {
    refresh(done) {
      this.$refs.saved_payment.refreshList(done);
    },
    afterGetpayment(data) {
      this.has_data = data;
    },
    setLoading(data) {
      this.loading = data;
    },
  },
};
</script>
