<template>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">{{ $t("Support") }}</div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">{{ $t("Support") }}</h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">{{ $t("Courier help desk and operational contact points") }}.</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <a href="tel:+99365449779" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card no-underline">
          <q-icon name="call" size="28px" class="text-tagam-leaf" />
          <div class="mt-3 text-[16px] font-black text-tagam-ink">{{ $t("Call Support") }}</div>
          <div class="mt-1 text-[13px] font-semibold text-tagam-muted">+993 65 449779</div>
        </a>
        <a href="mailto:sheremetyev.p@gmail.com" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card no-underline">
          <q-icon name="mail" size="28px" class="text-tagam-sky" />
          <div class="mt-3 text-[16px] font-black text-tagam-ink">{{ $t("Email support") }}</div>
          <div class="mt-1 text-[13px] font-semibold text-tagam-muted">sheremetyev.p@gmail.com</div>
        </a>
      </div>
    </section>
  </q-page>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
export default {
  name: "SupportPage",
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.Activity.setTitle(this.$t("Support"));
  },
};
</script>
