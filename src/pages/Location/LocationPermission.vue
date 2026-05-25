<template>
  <q-page class="min-h-screen bg-[#f7f8fb] px-5 py-8">
    <div class="mx-auto flex min-h-[calc(100vh-64px)] max-w-[520px] flex-col justify-center">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-tagam-amber/15 text-tagam-amber shadow-sm">
          <q-icon name="my_location" size="34px" />
        </div>
        <div class="text-[28px] font-black leading-tight text-tagam-ink">
          {{ $t("Enabled Your Location") }}
        </div>
        <div class="mx-auto mt-3 max-w-[360px] text-[15px] leading-6 text-slate-500">
          {{ $t("In order to continue we need your location enabled") }}
        </div>
      </div>

      <div class="space-y-3">
        <q-btn
          @click="requestPermission"
          unelevated
          no-caps
          :loading="loading"
          class="h-14 w-full rounded-xl bg-tagam-amber text-[17px] font-black text-white shadow-lg shadow-tagam-amber/25"
        >
          <q-icon name="gps_fixed" size="20px" class="mr-2" />
          {{ $t("Enabled Your Location") }}
        </q-btn>

        <q-btn
          @click="skipLocation"
          unelevated
          flat
          no-caps
          class="h-12 w-full rounded-xl text-[16px] font-bold text-tagam-amber"
        >
          {{ $t("Skip For Now") }}
        </q-btn>
      </div>

      <div class="mt-8 rounded-2xl border border-white bg-white/80 p-4 text-sm leading-6 text-slate-500 shadow-sm">
        <div class="flex gap-3">
          <q-icon name="info" size="20px" class="mt-0.5 text-tagam-sky" />
          <div>
            {{ $t("Browser location can be blocked during local testing. Skipping keeps the courier dashboard available; mobile tracking will still request GPS on the real app") }}.
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import AppLocation from "src/api/AppLocation";
import { App } from "@capacitor/app";
import { AppLauncher } from "@capacitor/app-launcher";
import { Capacitor } from "@capacitor/core";

export default {
  name: "LocationPermission",
  data() {
    return {
      redirect: "",
      loading: false,
    };
  },
  created() {
    this.redirect = !APIinterface.empty(this.$route.query.page)
      ? this.$route.query.page
      : "/home";
  },
  methods: {
    enableBrowserTestLocation() {
      APIinterface.setSession("skip_location", "");
      APIinterface.setSession("dev_location_enabled", 1);
      APIinterface.setSession("dev_location_lat", "39.992068");
      APIinterface.setSession("dev_location_lng", "52.977486");
      APIinterface.notify(
        "green-6",
        "Test location enabled for this browser.",
        "my_location",
        this.$q
      );
      this.$router.push(this.redirect);
    },
    skipLocation() {
      APIinterface.setSession("skip_location", 1);
      this.$router.push(this.redirect);
    },
    async requestPermission() {
      if (!this.$q.capacitor) {
        if (navigator.geolocation) {
          this.loading = true;
          APIinterface.showLoadingBox("", this.$q);
          navigator.geolocation.getCurrentPosition(
            (data) => {
              this.loading = false;
              APIinterface.hideLoadingBox(this.$q);
              this.$router.push(this.redirect);
            },
            (error) => {
              this.loading = false;
              APIinterface.hideLoadingBox(this.$q);
              console.debug(error);
              this.enableBrowserTestLocation();
            }
          );
        } else {
          this.enableBrowserTestLocation();
        }
      } else {
        try {
          this.loading = true;
          APIinterface.showLoadingBox("", this.$q);
          const result = await AppLocation.islocationEnabled();
          if (result == "granted") {
            AppLocation.checkAccuracy()
              .then((data) => {
                this.$router.push(this.redirect);
              })
              .catch((error) => {
                APIinterface.notify("red-5", error, "error_outline", this.$q);
              })
              .then((data) => {
                APIinterface.hideLoadingBox(this.$q);
              });
          } else {
            if (Capacitor.getPlatform() === "ios") {
              await App.openUrl({ url: "app-settings:" });
            } else if (Capacitor.getPlatform() === "android") {
              APIinterface.showAlert(
                "Location Permission Needed",
                "Location access is required for this feature. Please enable it manually in your device settings.",
                this.$q
              );
            }
          }
        } catch (error) {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        } finally {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        }
      }
    },
    //
  },
};
</script>
