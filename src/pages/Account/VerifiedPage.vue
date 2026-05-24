<template>
  <q-page class="flex min-h-screen items-center bg-tagam-canvas px-4 py-8 text-tagam-ink">
    <div class="mx-auto w-full max-w-[480px] rounded-[8px] border border-tagam-line bg-white p-6 text-center shadow-tagam-card">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-tagam-mint text-tagam-leaf">
        <q-icon name="verified" size="34px" />
      </div>
      <div class="text-[24px] font-black leading-tight text-tagam-ink">
        {{ $t("Thank you for signing up") }}!
      </div>
      <div class="mt-3 text-[14px] font-semibold leading-6 text-tagam-muted">
        {{
          $t(
            "Your registration is now complete. allow us to review your account 1 to 2 business day"
          )
        }},
        {{
          $t("you will receive email from us after your account is activated")
        }}.
      </div>
    </div>

    <q-footer class="bg-white/90 p-4 text-center shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <q-btn
        unelevated
        :label="$t('Close Application')"
        no-caps
        class="h-13 rounded-[8px] bg-tagam-leaf px-7 text-[17px] font-black text-white"
        size="lg"
        @click="closeApp"
      />
      <q-space class="q-pa-sm"></q-space>

      <q-btn dense no-caps flat class="font-bold text-tagam-ink" to="/user/login">
        {{ $t("Already have an account") }}?
        <span class="q-ml-sm text-weight-bold">{{ $t("SIGN IN") }}</span>
      </q-btn>
    </q-footer>
  </q-page>
</template>

<script>
import { App } from "@capacitor/app";

export default {
  name: "VerifiedPage",
  methods: {
    closeApp() {
      App.exitApp();
    },
  },
};
</script>
