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
        $t("Forgot Password")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-page class="min-h-screen bg-tagam-canvas px-4 py-8 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
          Account recovery
        </div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">
          {{ $t("Let's Get your account back") }}!
        </h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
          {{
            $t(
              "Enter your email to receive instructions for resetting your password"
            )
          }}
        </p>
      </div>

      <q-form @submit="onSubmit" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">

        <template v-if="steps == 2">
          <div class="mb-4 rounded-[8px] bg-tagam-mint p-4 text-[13px] font-bold text-tagam-leafDark">
            {{ data.msg }}
          </div>
        </template>

        <template v-else>
          <q-input
            v-model="email_address"
            :label="$t('Email address')"
            outlined
            color="green-8"
            lazy-rules
            :rules="[
              (val, rules) =>
                rules.email(val) ||
                this.$t('Please enter a valid email address'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon
                name="las la-envelope"
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
        </template>
        <q-space class="q-pa-xs"></q-space>

        <template v-if="steps == 1">
          <q-btn
            :loading="loading"
            type="submit"
            :label="$t('Reset Password')"
            unelevated
            no-caps
            class="h-13 w-full rounded-[8px] bg-tagam-leaf text-[17px] font-black text-white"
            size="lg"
          />
        </template>
        <template v-else>
          <template v-if="counter === 0">
            <div class="row items-center">
              <q-btn
                @click="resendEmail"
                :disable="loading"
                flat
                dense
                no-caps
                class="q-ma-none col text-tagam-ink"
                size="md"
                ><u>{{ $t("Resend reset email") }}</u>
              </q-btn>
              <q-btn
                @click="steps = 1"
                :disable="loading"
                flat
                dense
                no-caps
                class="q-ma-none col text-tagam-ink"
                size="md"
                ><u>{{ $t("Enter email again") }}</u>
              </q-btn>
            </div>
          </template>
          <template v-else>
            <p class="m-0 text-[12px] font-bold text-tagam-muted">
              <u>{{ $t("Resend Code in") }} {{ counter }}</u>
            </p>
          </template>
        </template>
      </q-form>
    </section>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useActivityStore } from "stores/ActivityStore";

export default {
  name: "ForgotPassword",
  data() {
    return {
      loading: false,
      email_address: "",
      steps: 1,
      data: [],
      maxCounter: 10,
      counter: this.maxCounter,
      timer: undefined,
    };
  },
  setup() {
    const ActivityStore = useActivityStore();
    return { ActivityStore };
  },
  watch: {
    counter(newval, oldval) {
      if (newval <= 0) {
        this.stopTimer();
      }
    },
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.requestResetPassword({
        email_address: this.email_address,
      })
        .then((data) => {
          this.steps = 2;
          this.counter = this.ActivityStore.settings_data.sendcode_interval;
          this.startTimer();
          this.data = data;
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    stopTimer() {
      clearInterval(this.timer);
    },
    startTimer() {
      this.stopTimer();
      //this.counter = this.maxCounter;
      this.timer = setInterval(() => {
        this.counter--;
      }, 1000);
    },
    resendEmail() {
      this.loading = true;
      APIinterface.resendResetPassword(this.data.details.uuid)
        .then((data) => {
          this.steps = 2;
          this.counter = this.ActivityStore.settings_data.sendcode_interval;
          this.startTimer();
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
