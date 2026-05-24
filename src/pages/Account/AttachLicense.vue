<template>
  <q-header
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-tagam-ink shadow-sm': !$q.dark.mode,
    }"
  >
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="las la-angle-left"
        :color="$q.dark.mode ? 'white' : 'grey-10'"
      />
      <q-toolbar-title class="text-[18px] font-black">{{
        $t("Driving License")
      }}</q-toolbar-title>
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-6 text-tagam-ink">
    <div class="mx-auto max-w-4xl">
      <q-form @submit="onSubmit">
        <div class="rounded-[8px] border border-tagam-line bg-white p-5 shadow-tagam-card">
          <div class="mb-5 rounded-[8px] bg-tagam-ink p-5 text-white">
            <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
              Verification
            </div>
            <h1 class="m-0 mt-2 text-[26px] font-black leading-tight">
              {{ $t("We need your driving license information") }}
            </h1>
            <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
              {{ $t("Enter your license correctly") }}
            </p>
          </div>

          <q-input
            :label="$t('License number')"
            stack-label
            v-model="license_number"
            outlined
            color="amber-7"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          />

          <q-input
            :label="$t('Expiration date')"
            stack-label
            v-model="license_expiration"
            outlined
            color="amber-7"
            mask="####/##/##"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            placeholder="YYYY/MM/DD"
          />
        </div>

        <q-footer
          class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur"
          :class="{
            'bg-mydark ': $q.dark.mode,
            'bg-white ': !$q.dark.mode,
          }"
        >
          <q-btn
            type="submit"
            class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
            unelevated
            :label="$t('Continue')"
            no-caps
            size="lg"
          />
        </q-footer>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "DrivingLicense",
  data() {
    return {
      driver_uuid: "",
      license_number: "",
      license_expiration: "",
    };
  },
  created() {
    this.driver_uuid = this.$route.query.uuid;
  },
  methods: {
    onSubmit() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.addLicense({
        driver_uuid: this.driver_uuid,
        license_number: this.license_number,
        license_expiration: this.license_expiration,
      })
        .then((data) => {
          this.$router.push({
            path: "/account/attach_license_photo",
            query: { uuid: this.driver_uuid },
          });
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
