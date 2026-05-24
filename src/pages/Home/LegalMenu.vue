<template>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">Policies</div>
        <h1 class="m-0 mt-1 text-[28px] font-black text-tagam-ink">{{ $t("Legal") }}</h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">Terms, privacy and operating documents.</p>
      </div>
      <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
      <q-list separator>
        <template v-for="(items, index) in Activity.legal_menu" :key="items">
          <q-item
            clickable
            class="px-4 py-3"
            :to="{
              name: 'page',
              params: {
                page_id: index,
              },
            }"
          >
            <q-item-section>
              <q-item-label class="text-[15px] font-black text-tagam-ink">{{ items }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" class="text-tagam-muted" />
            </q-item-section>
          </q-item>
        </template>
      </q-list>
      </div>
    </section>
  </q-page>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
export default {
  name: "LegalMenu",
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.Activity.setTitle(this.$t("Legal"));
  },
};
</script>
