<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="w-full max-w-[500px] rounded-[8px] bg-white shadow-xl">
      <q-toolbar class="px-4 pt-3 text-tagam-ink" dense>
        <div class="text-[12px] font-black uppercase tracking-[0.12em] text-tagam-gold">Stripe</div>
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

      <q-form @submit="onSubmit">
        <q-card-section class="px-5 pb-0 pt-2">
          <h5 class="m-0 text-[22px] font-black text-tagam-ink">{{ title }}</h5>
          <div class="mt-2">
            <p class="text-[13px] font-semibold leading-5 text-tagam-muted">{{ label.notes }}</p>
          </div>

          <q-input
            dense
            color="amber-7"
            outlined
            v-model="cardholder_name"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('this field is required'),
            ]"
            label="Cardholder name"
          />
          <div class="mb-4 rounded-[8px] border border-[#ece7dd] bg-[#faf9f6] p-4" ref="card_element"></div>

          <p class="text-[11px] leading-5 text-tagam-muted">
            {{
              $t(
                "I authorise to send instructions to the financial institution that"
              )
            }}
            {{
              $t(
                "issued my card to take payments from my card account in accordance"
              )
            }}
            {{ $t("with the terms of my agreement") }}.
          </p>

          <q-inner-loading :showing="visible" label-style="font-size: 1.1em" />
        </q-card-section>

        <q-card-actions class="px-5 pb-5 pt-3">
          <q-btn
            type="submit"
            :label="label.submit"
            :loading="loading"
            unelevated
            no-caps
            color="amber-6"
            text-color="black"
            class="full-width rounded-[8px] font-black"
            size="lg"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "StripeComponents",
  props: ["title", "label", "payment_code", "payment_credentials", "reference"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      visible: false,
      client_secret: "",
      customer_id: "",
      publish_key: "",
      stripe: undefined,
      cardElement: undefined,
      cardholder_name: "",
      merchant_id: "",
      merchant_type: "",
    };
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
      this.createCustomer();
    },
    close() {
      this.show_modal = false;
    },
    createCustomer() {
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        this.merchant_id =
          this.payment_credentials[this.payment_code].merchant_id;
        this.merchant_type =
          this.payment_credentials[this.payment_code].merchant_type;
      }
      const $params = {
        merchant_id: this.merchant_id,
        payment_code: this.payment_code,
        merchant_type: this.merchant_type,
        reference: this.reference,
      };
      this.loading = true;
      this.visible = true;
      APIinterface.PaymentPost("StripeCreateDriver", $params)
        .then((data) => {
          this.client_secret = data.details.client_secret;
          this.customer_id = data.details.customer_id;
          this.initStripe();
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
          this.visible = false;
        });
    },
    initStripe() {
      if (window.Stripe == null) {
        new Promise((resolve) => {
          const doc = window.document;
          const scriptId = "stripe-script";
          const scriptTag = doc.createElement("script");
          scriptTag.id = scriptId;
          scriptTag.setAttribute("src", "https://js.stripe.com/v3/");
          doc.head.appendChild(scriptTag);
          scriptTag.onload = () => {
            resolve();
          };
        }).then(() => {
          this.renderCard();
        });
      } else {
        this.renderCard();
      }
    },
    renderCard() {
      const style = {
        base: {
          color: "#141922",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#8d95a3",
          },
        },
        invalid: {
          color: "#dc2626",
          iconColor: "#dc2626",
        },
      };

      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        this.publish_key = this.payment_credentials[this.payment_code].attr2;

        // eslint-disable-next-line
        this.stripe = Stripe(this.publish_key);
        const elements = this.stripe.elements();
        this.cardElement = elements.create("card", { style });
        setTimeout(() => {
          this.cardElement.mount(this.$refs.card_element);
        }, 500);
      } else {
        APIinterface.notify(
          "dark",
          this.$t("invalid payment credentials"),
          "warning",
          this.$q
        );
      }
    },
    onSubmit() {
      this.loading = true;
      this.visible = true;
      this.stripe
        .confirmCardSetup(this.client_secret, {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.cardholder_name,
            },
          },
        })
        .then((result) => {
          this.loading = false;
          this.visible = false;
          if (result.error) {
            if (result.error.code === "setup_intent_unexpected_state") {
              this.createIntent();
            }
          } else {
            this.savePayment(result.setupIntent.payment_method);
          }
        });
    },
    savePayment(paymentMethodId) {
      this.loading = true;
      const $params = {
        payment_method_id: paymentMethodId,
        merchant_id: this.merchant_id,
        payment_code: this.payment_code,
        merchant_type: this.merchant_type,
        reference: this.reference,
      };
      APIinterface.PaymentPost("StripeSavePayment", $params)
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
    createIntent() {
      const $params = {
        customer_id: this.customer_id,
        merchant_id: this.merchant_id,
        payment_code: this.payment_code,
        merchant_type: this.merchant_type,
      };
      APIinterface.PaymentPost("StripeCreateIntent", $params)
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
      const params = {
        payment_uuid: data.payment_uuid,
        payment_code: data.payment_code,
        amount: data.amount,
        reference: this.reference,
      };
      APIinterface.showLoadingBox(
        //"Processing payment..<br/>don't close this window",
        this.$t("Processing payment..") +
          "<br/>" +
          this.$t("don't close this window"),
        this.$q
      );
      APIinterface.PaymentPost("StripePaymentIntent", params)
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
