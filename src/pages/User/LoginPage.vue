<template>
  <q-header
    class="tw-header"
  >
    <q-toolbar class="mx-auto h-16 max-w-5xl px-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-tagam-leaf text-lg font-black text-white">
          T
        </div>
        <div class="leading-tight">
          <div class="text-[13px] font-extrabold tracking-[0.16em] text-tagam-leaf">
            TAGAM
          </div>
          <div class="text-[11px] font-semibold text-tagam-muted">
            Driver workspace
          </div>
        </div>
      </div>
      <q-space></q-space>
      <div class="flex items-center gap-2">
        <q-btn
          dense
          flat
          round
          :icon="getDarkMode"
          class="text-tagam-muted"
          @click="dark_mode = !dark_mode"
        />

        <q-btn
          v-if="Activity.settings_data.enabled_language"
          to="/settings/language"
          flat
          round
          dense
          icon="las la-globe"
          class="text-tagam-muted"
        />
      </div>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-5 pb-10 pt-24 text-tagam-ink">
    <section class="mx-auto grid min-h-[calc(100vh-8.5rem)] max-w-5xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
      <div class="hidden md:block">
        <div class="max-w-xl">
          <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-tagam-line bg-white px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-tagam-leaf shadow-tagam-card">
            Live courier operations
          </div>
          <h1 class="m-0 text-[46px] font-black leading-[1.02] text-tagam-ink">
            Быстрый рабочий экран курьера TAGAM.
          </h1>
          <p class="mt-5 max-w-md text-[17px] font-semibold leading-7 text-tagam-muted">
            Коробочная KMRS-логика остается внутри, а интерфейс постепенно переезжает на чистый современный Tailwind-слой.
          </p>
          <div class="mt-8 grid max-w-lg grid-cols-3 gap-3">
            <div class="rounded-[8px] bg-white p-4 shadow-tagam-card">
              <div class="text-2xl font-black text-tagam-leaf">01</div>
              <div class="mt-2 text-[12px] font-bold text-tagam-muted">Orders</div>
            </div>
            <div class="rounded-[8px] bg-white p-4 shadow-tagam-card">
              <div class="text-2xl font-black text-tagam-leaf">GPS</div>
              <div class="mt-2 text-[12px] font-bold text-tagam-muted">Tracking</div>
            </div>
            <div class="rounded-[8px] bg-white p-4 shadow-tagam-card">
              <div class="text-2xl font-black text-tagam-leaf">₼</div>
              <div class="mt-2 text-[12px] font-bold text-tagam-muted">Wallet</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-[430px] rounded-[8px] border border-tagam-line bg-white p-5 shadow-tagam-soft sm:p-7">
        <div>
          <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-[8px] bg-tagam-mint text-xl font-black text-tagam-leaf">
            T
          </div>
          <h2 class="m-0 text-[28px] font-black leading-tight text-tagam-ink">
            {{ $t("Let's Sign You In") }}
          </h2>
          <p class="mb-0 mt-2 text-[14px] font-semibold leading-6 text-tagam-muted">
            {{ $t("Enter your username and password to sign in") }}
          </p>
        </div>

        <q-form @submit="onSubmit" class="mt-7">
          <q-input
            v-model="username"
            :label="$t('Email address')"
            outlined
            color="green-8"
            class="tagam-input"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon
                name="las la-user-alt"
                color="grey"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('This field is required'),
                ]"
              />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :label="$t('Password')"
            outlined
            color="green-8"
            class="tagam-input"
            :type="field_type"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon
                name="las la-lock"
                color="grey"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('This field is required'),
                ]"
              />
            </template>
            <template v-slot:append>
              <q-icon
                @click="
                  field_type = field_type == 'password' ? 'text' : 'password'
                "
                :name="FieldIcon"
                color="grey"
                class="cursor-pointer"
              />
            </template>
          </q-input>

          <div class="mb-3 mt-[-8px] flex justify-end">
            <div></div>
            <q-btn unelevated flat no-caps class="text-tagam-leaf" to="/user/forgotpass"
              >{{ $t("Forgot Password") }}?</q-btn
            >
          </div>

          <q-btn
            :loading="loading"
            type="submit"
            :label="$t('Sign In')"
            unelevated
            no-caps
            class="h-12 w-full rounded-[8px] bg-tagam-leaf text-[15px] font-extrabold text-white shadow-none"
            size="lg"
          />

          <div class="mt-4 flex items-center justify-center gap-1 text-[14px]">
            <span class="font-semibold text-tagam-muted">{{ $t("Don't have an account") }}</span>
            <q-btn to="/user/signup" unelevated flat no-caps class="font-extrabold text-tagam-leaf">{{
              $t("Signup")
            }}</q-btn>
          </div>
        </q-form>
      </div>
    </section>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useActivityStore } from "stores/ActivityStore";

export default defineComponent({
  name: "LoginPage",
  data() {
    return {
      loading: false,
      field_type: "password",
      username: "",
      password: "",
      dark_mode: false,
      rtl: false,
    };
  },
  created() {
    this.dark_mode = this.Activity.dark_mode;
    this.rtl = this.Activity.rtl;
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  watch: {
    dark_mode(newval, oldval) {
      this.$q.dark.set(newval);
      this.Activity.dark_mode = newval;
    },
    rtl(newval, oldval) {
      this.Activity.rtl = newval;
      this.$q.lang.set({ rtl: newval });
    },
  },
  computed: {
    FieldIcon() {
      return this.field_type === "password"
        ? "eva-eye-outline"
        : "eva-eye-off-outline";
    },
    getDarkMode() {
      if (this.dark_mode) {
        return "las la-adjust";
      }
      return "las la-moon";
    },
    getRTLMode() {
      if (this.rtl) {
        return "format_textdirection_l_to_r";
      }
      return "format_textdirection_r_to_l";
    },
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.userLogin({
        username: this.username,
        password: this.password,
      })
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          this.$router.replace("/home");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
});
</script>
