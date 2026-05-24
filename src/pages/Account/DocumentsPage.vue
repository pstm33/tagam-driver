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
        $t("Documents")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <template v-if="loading">
      <div
        class="flex flex-center full-width q-pa-xl"
        style="min-height: calc(50vh)"
      >
        <q-spinner color="primary" size="2em" />
      </div>
    </template>
    <template v-else>
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
            {{ $t("Verification") }}
          </div>
          <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">
            {{ $t("Documents") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
            {{ $t("Keep courier identity and license data ready for dispatch approval") }}.
          </p>
        </div>

        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
          <div class="flex items-start gap-4">
            <div class="flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
              <q-icon name="badge" size="46px" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[16px] font-black text-tagam-ink">
                {{ $t("License number") }}
              </div>
              <div class="mt-1 text-[13px] font-semibold text-tagam-muted">
                {{ license_number || $t("N/A") }}
              </div>
              <div class="mt-4 text-[16px] font-black text-tagam-ink">
                {{ $t("Expiration date") }}
              </div>
              <div class="mt-1 text-[13px] font-semibold text-tagam-muted">
                {{ license_expiration || $t("N/A") }}
              </div>
            </div>
          </div>

          <q-btn
            no-caps
            unelevated
            class="mt-4 h-12 w-full rounded-[8px] bg-tagam-canvas font-black text-tagam-ink"
            to="/account/license-photo"
            size="lg"
          >
            {{ $t("Update Photo") }}
          </q-btn>
        </div>

      <q-form @submit="onSubmit" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
        <q-input
          v-model="license_number"
          :label="$t('License number')"
          outlined
          color="grey-5"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
        </q-input>

        <q-input
          v-model="license_expiration"
          :label="$t('Expiration date')"
          outlined
          color="grey-5"
          mask="####/##/##"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
        </q-input>

        <q-footer class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <q-btn
            type="submit"
            :label="$t('Update')"
            unelevated
            class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
            size="lg"
            no-caps
            :loading="loading"
          />
        </q-footer>
      </q-form>
      </section>
    </template>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  // name: 'PageName',
  data() {
    return {
      license_number: "",
      license_expiration: "",
      loading: false,
    };
  },
  created() {
    this.getLicense();
  },
  methods: {
    getLicense() {
      this.loading = true;
      APIinterface.fetchDataByToken("getlicense", {})
        .then((data) => {
          this.license_number = data.details.license_number;
          this.license_expiration = data.details.license_expiration;
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByToken("updatelicense", {
        license_number: this.license_number,
        license_expiration: this.license_expiration,
      })
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
  },
};
</script>
