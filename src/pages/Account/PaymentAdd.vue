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
        $t("Add payment")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">Payment method</div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">{{ $t("Add payment") }}</h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">Choose a provider to add a saved payment method.</p>
      </div>
      <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white p-2 shadow-tagam-card">
        <PaymentList
          ref="payment"
          @after-selectpayment="afterSelectpayment"
          @set-credentials="setCredentials"
        ></PaymentList>
      </div>
    </section>
  </q-page>

  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Add Stripe')"
    :label="{
      submit: this.$t('Add Stripe'),
      notes: this.$t('Add your card account'),
    }"
    :payment_credentials="credentials"
    :reference="driver_id"
    @after-addpayment="afterAddpayment"
    @after-payment="afterPayment"
  />

  <PaypalComponents
    ref="paypal"
    payment_code="paypal"
    :title="$t('Add Paypal')"
    :label="{
      submit: this.$t('Add Paypal'),
      notes: this.$t('Pay using your paypal account'),
      payment_title: this.$t('Pay using Paypal'),
      payment_subtitle: this.$t(
        'You will re-direct to paypal account to login to your account.'
      ),
    }"
    :payment_credentials="credentials"
    :reference="driver_id"
    @after-addpayment="afterAddpayment"
    @after-payment="afterPayment"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "PaymentAdd",
  components: {
    PaymentList: defineAsyncComponent(() =>
      import("components/PaymentList.vue")
    ),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    PaypalComponents: defineAsyncComponent(() =>
      import("components/PaypalComponents.vue")
    ),
  },
  data() {
    return {
      credentials: [],
      driver_id: 0,
    };
  },
  created() {
    let $data = auth.getUser();
    this.driver_id = $data.driver_id;
  },
  methods: {
    setCredentials(credentials) {
      this.credentials = credentials;
    },
    afterSelectpayment(data, credentials) {
      try {
        this.$refs[data.payment_code].showPaymentForm();
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    afterAddpayment() {
      this.$router.replace("/account/payments");
    },
  },
};
</script>
