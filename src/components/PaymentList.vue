<template>
  <template v-if="loading">
    <div class="flex min-h-[220px] w-full items-center justify-center">
      <q-spinner color="amber-6" size="2em" />
    </div>
  </template>
  <q-list v-else class="space-y-3">
    <transition
      v-for="items in data"
      :key="items.payment_code"
      appear
      leave-active-class="animated fadeOut"
    >
      <q-item
        @click="onchoosePayment(items)"
        clickable
        v-ripple
        class="rounded-[8px] border border-[#ece7dd] bg-white px-3 py-3 shadow-sm"
      >
        <q-item-section avatar>
          <template v-if="items.logo_type === 'icon'">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7df] text-tagam-gold">
              <q-icon name="credit_card" size="22px" />
            </div>
          </template>
          <template v-else>
            <q-img
              :src="items.logo_image"
              fit="contain"
              class="h-10 max-w-[40px]"
            />
          </template>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-[15px] font-black text-tagam-ink">{{ items.payment_name }}</q-item-label>
          <q-item-label class="text-[12px] font-semibold text-tagam-muted">{{ $t("Available balance top-up method") }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="text-tagam-muted" />
        </q-item-section>
      </q-item>
    </transition>
  </q-list>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PaymentList",
  data() {
    return {
      loading: false,
      data: [],
      credentials: [],
    };
  },
  created() {
    this.PaymentMethod();
  },
  methods: {
    PaymentMethod() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("PaymentMethod")
        .then((data) => {
          this.data = data.details.data;
          this.credentials = data.details.credentials;
          this.$emit("setCredentials", this.credentials);
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
    onchoosePayment(data) {
      this.$emit("afterSelectpayment", data, this.credentials);
    },
  },
};
</script>
