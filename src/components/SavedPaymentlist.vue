<template>
  <template v-if="loading">
    <div class="flex min-h-[220px] w-full items-center justify-center p-8">
      <q-spinner color="amber-6" size="2em" />
    </div>
  </template>
  <template v-else>
    <template v-if="!hasData">
      <div class="rounded-[8px] border border-dashed border-[#d9d2c5] bg-white p-5 text-center">
        <q-icon name="credit_card_off" size="30px" class="text-tagam-muted" />
        <div class="mt-2 text-[14px] font-black text-tagam-ink">{{ $t("No saved payments") }}</div>
        <div class="mt-1 text-[12px] font-semibold text-tagam-muted">{{ $t("Add a card or wallet to top up faster") }}.</div>
      </div>
    </template>
    <template v-else>
      <q-list class="space-y-3">
        <transition
          v-for="items in data"
          :key="items"
          appear
          leave-active-class="animated fadeOut"
        >
          <q-slide-item
            @action="deletePayment(index, items)"
            right-color="white"
          >
            <template v-slot:right>
              <q-btn
                unelevated
                round
                color="red-6"
                text-color="white"
                icon="eva-trash-outline"
                dense
              />
            </template>
            <q-item
              @click.stop="setDefault(items.payment_uuid)"
              tag="label"
              clickable
              v-ripple
              class="rounded-[8px] border border-[#ece7dd] bg-white px-3 py-3 text-tagam-ink shadow-sm"
            >
              <q-item-section>
                <q-item-label class="text-[15px] font-black">{{ items.payment_name }}</q-item-label>
                <q-item-label class="mt-1 text-[12px] font-semibold text-tagam-muted">{{ items.attr2 }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio
                  v-model="payment_uuid"
                  :val="items.payment_uuid"
                  color="amber-6"
                />
              </q-item-section>
            </q-item>
          </q-slide-item>
        </transition>
      </q-list>
    </template>
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
export default {
  name: "SavedPaymentlist",
  data() {
    return {
      payment_uuid: "",
      data: [],
      loading: false,
    };
  },
  created() {
    this.getPaymentSaved();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  watch: {
    payment_uuid(newval, oldval) {
      this.$emit("setPaymentuuid", newval);
    },
  },
  methods: {
    refreshList(done) {
      this.getPaymentSaved(done);
    },
    getPaymentSaved(done) {
      this.loading = true;
      this.$emit("setLoading", true);
      APIinterface.fetchDataByTokenPost("getPaymentSaved")
        .then((data) => {
          this.data = data.details.data;
          this.payment_uuid = data.details.default_payment_uuid.payment_uuid;
          this.$emit("afterGetpayment", true);
        })
        .catch((error) => {
          this.data = [];
          this.payment_uuid = "";
          this.$emit("afterGetpayment", false);
        })
        .then((data) => {
          this.loading = false;
          this.$emit("setLoading", false);
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    deletePayment(index, data) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost(
        "deletePayment",
        "payment_uuid=" + data.payment_uuid
      )
        .then((data) => {
          this.getPaymentSaved(null);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    setDefault(payment_uuid) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost(
        "setDefaultPayment",
        "payment_uuid=" + payment_uuid
      )
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
    //
  },
};
</script>
