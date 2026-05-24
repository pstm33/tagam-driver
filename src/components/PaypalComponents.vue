<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="w-full max-w-[500px] rounded-[8px] bg-white shadow-xl">
      <q-toolbar class="px-4 pt-3 text-tagam-ink" dense>
        <div class="text-[12px] font-black uppercase tracking-[0.12em] text-tagam-gold">PayPal</div>
        <q-space></q-space>
        <q-btn
          @click="show_modal = !true"
          flat
          round
          unelevated
          text-color="grey-7"
          icon="las la-times"
          dense
          no-caps
          size="md"
        />
      </q-toolbar>

      <q-card-section class="px-5 pb-3 pt-2">
        <h5 class="m-0 text-[22px] font-black text-tagam-ink">{{ title }}</h5>
        <div class="mt-2">
          <p class="text-[13px] font-semibold leading-5 text-tagam-muted">{{ label.notes }}</p>
        </div>
      </q-card-section>

      <q-card-actions class="px-5 pb-5 pt-2">
        <q-btn
          :label="label.submit"
          :loading="loading"
          @click="onSubmit()"
          unelevated
          no-caps
          color="amber-6"
          text-color="black"
          class="full-width rounded-[8px] font-black"
          size="lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="payment_modal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="w-full max-w-[500px] rounded-[8px] bg-white shadow-xl">
      <q-card-section class="row items-center px-4 pb-0 pt-3">
        <div class="text-[12px] font-black uppercase tracking-[0.12em] text-tagam-gold">Checkout</div>
        <q-space />
        <q-btn icon="eva-close-outline" flat round dense text-color="grey-7" v-close-popup />
      </q-card-section>

      <q-card-section class="px-5 py-3">
        <h5 class="m-0 text-[22px] font-black text-tagam-ink">{{ label.payment_title }}</h5>
        <div class="mt-2">
          <p class="text-[13px] font-semibold leading-5 text-tagam-muted">{{ label.payment_subtitle }}</p>
        </div>
      </q-card-section>

      <q-card-actions class="px-5 pb-5 pt-2">
        <div ref="paypal_button" class="margin-auto full-width" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { loadScript } from "vue-plugin-load-script";

let paypalHandle;
export default {
  name: "PaypalComponents",
  props: ["title", "label", "payment_code", "payment_credentials", "reference"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      payment_modal: false,
      client_id: "",
    };
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
    },
    close() {
      this.show_modal = false;
    },
    onSubmit() {
      let merchantId = 0;
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        merchantId = this.payment_credentials[this.payment_code].merchant_id;
      }
      const $data = {
        merchant_id: merchantId,
        payment_code: this.payment_code,
        reference: this.reference,
      };
      this.loading = true;
      APIinterface.fetchDataByTokenPost("SavedPaymentProvider", $data)
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    PaymentRender(data) {
      this.data = data;
      this.payment_modal = true;
      if (
        typeof this.payment_credentials[data.payment_code] !== "undefined" &&
        this.payment_credentials[data.payment_code] !== null
      ) {
        this.client_id = this.payment_credentials[data.payment_code].attr1;
      }
      this.initPaypal();
    },
    initPaypal() {
      loadScript(
        "https://www.paypal.com/sdk/js?client-id=" +
          this.client_id +
          "&currency=" +
          this.data.currency +
          "&disable-funding=credit,card"
      )
        .then(() => {
          this.renderPaypal();
        })
        .catch(() => {
          APIinterface.notify(
            "negative",
            "failed loading script",
            "error_outline",
            this.$q
          );
        });
    },
    renderPaypal() {
      /* eslint-disable */
      paypalHandle = paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: this.data.amount,
                },
              },
            ],
          });
        },
        onCancel: (data) => {
          //
        },
        onError: (error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((orderData) => {
            const transaction =
              orderData.purchase_units[0].payments.captures[0];
            this.CompletePaymentRequest(
              transaction.status,
              transaction.id,
              orderData.id
            );
          });
        },
      });
      paypalHandle.render(this.$refs.paypal_button);
    },
    CompletePaymentRequest(status, transaction_id, order_id) {
      let $params = {
        transaction_id: transaction_id,
        order_id: order_id,
        reference: this.reference,
      };
      APIinterface.showLoadingBox(
        "Processing payment..<br/>don't close this window",
        this.$q
      );
      APIinterface.PaymentPost("PaypalVerifyPayment", $params)
        .then((data) => {
          this.$emit("afterPayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
