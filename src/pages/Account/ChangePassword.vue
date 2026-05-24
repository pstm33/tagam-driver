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
        $t("Change password")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">Security</div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">{{ $t("Change password") }}</h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">Update courier account credentials.</p>
      </div>
      <q-form @submit="onSubmit" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
        <q-input
          v-model="old_password"
          :label="$t('Old password')"
          outlined
          color="green-8"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
        </q-input>

        <q-input
          v-model="new_password"
          :label="$t('New password')"
          outlined
          color="green-8"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
        </q-input>

        <q-input
          v-model="confirm_password"
          :label="$t('Confirm password')"
          outlined
          color="green-8"
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
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  // name: 'PageName',
  data() {
    return {
      field_type: "password",
      old_password: "",
      new_password: "",
      confirm_password: "",
    };
  },
  computed: {
    FieldIcon() {
      return this.field_type === "password"
        ? "eva-eye-outline"
        : "eva-eye-off-outline";
    },
  },
  methods: {
    onSubmit() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByToken("changepassword", {
        old_password: this.old_password,
        new_password: this.new_password,
        confirm_password: this.confirm_password,
      })
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          this.$router.replace({ path: "/home/settings" });
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
