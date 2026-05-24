<template>
  <q-page class="flex min-h-screen items-center bg-tagam-canvas px-4 py-8 text-tagam-ink">
    <div class="mx-auto w-full max-w-[440px] rounded-[8px] border border-tagam-line bg-white p-6 text-center shadow-tagam-card">
      <q-img
        src="network-error.png"
        fit="fill"
        spinner-color="primary"
        class="mx-auto"
        style="max-width: 130px"
      />
      <div class="mt-5 text-[24px] font-black leading-tight text-tagam-ink">
        {{ $t("We're having trouble loading") }}
      </div>
      <div class="mt-2 text-[14px] font-semibold leading-6 text-tagam-muted">
        {{ $t("Please check your Network connectivity and try again") }}
      </div>
      <q-btn
        @click="CheckNetwork"
        unelevated
        class="mt-5 h-12 rounded-[8px] bg-tagam-leaf px-7 font-black text-white"
        :label="$t('Try Again')"
        no-caps
      />
    </div>
  </q-page>
</template>

<script>
import { Network } from "@capacitor/network";
import APIinterface from "src/api/APIinterface";

export default {
  name: "NetworkError",
  methods: {
    async CheckNetwork() {
      APIinterface.showLoadingBox("", this.$q);
      const status = await Network.getStatus();
      if (status.connected === true) {
        APIinterface.hideLoadingBox(this.$q);
        this.$router.push("/home");
      } else {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>
