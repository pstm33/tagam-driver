<template>
  <q-header class="bg-white text-tagam-ink shadow-sm" reveal reveal-offset="50">
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        unelevated
        round
        dense
        icon="arrow_back"
        class="bg-tagam-canvas text-tagam-ink"
      />
    </q-toolbar>
  </q-header>
  <q-page class="flex min-h-screen items-center bg-tagam-canvas px-4 py-8 text-tagam-ink">
    <div class="mx-auto w-full max-w-[440px] rounded-[8px] border border-tagam-line bg-white p-6 text-center shadow-tagam-card">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#fff3ef] text-tagam-coral">
        <q-icon name="receipt_long" size="34px" />
      </div>
      <div class="text-[22px] font-black leading-tight">
        {{ $t("Opps order details not available") }}
      </div>
      <p class="mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">
        {{ $t("The order your viewing is not available anymore") }}.
      </p>
    </div>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
};
</script>
