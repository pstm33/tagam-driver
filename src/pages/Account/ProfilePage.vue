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
      <q-toolbar-title class="text-[18px] font-black"></q-toolbar-title>
      <q-btn
        unelevated
        :label="$t('Edit')"
        no-caps
        class="rounded-[8px] bg-tagam-amber px-4 font-black text-white"
        to="/account/edit-profile"
      />
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
          <div class="flex items-center gap-4">
            <q-avatar size="74px" class="ring-4 ring-white/15">
              <q-img
                :src="data.avatar"
                style="height: 74px; max-width: 74px"
                fit="cover"
                spinner-size="20px"
                spinner-color="primary"
              >
                <template v-slot:error>
                  <div
                    class="absolute-full flex flex-center bg-amber-5 text-white"
                  ></div>
                </template>
              </q-img>
            </q-avatar>
            <div class="min-w-0 flex-1">
              <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
                Courier profile
              </div>
              <h1 class="m-0 mt-1 truncate text-[27px] font-black leading-tight">
                {{ data.first_name }} {{ data.last_name }}
              </h1>
              <p class="m-0 mt-1 truncate text-[13px] font-semibold text-white/70">
                {{ data.email_address }}
              </p>
            </div>
          </div>
        </div>

        <div class="mb-4 rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
          <ReviewOverview :overview="true" :refresh="is_refresh" />
        </div>

        <div class="mb-4 overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <DeliveriesOverview :refresh="is_refresh"></DeliveriesOverview>
        </div>

        <div class="mb-3 text-[18px] font-black">
          {{ $t("Information") }}
        </div>
        <q-list dense separator class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <q-item class="px-4 py-3">
            <q-item-section>
              <q-item-label class="font-bold text-tagam-muted">{{ $t("Email Address") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption class="font-black text-tagam-ink">{{ data.email_address }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="px-4 py-3">
            <q-item-section>
              <q-item-label class="font-bold text-tagam-muted">{{ $t("Mobile Number") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption class="font-black text-tagam-ink"
                >+{{ data.phone_prefix }} {{ data.phone }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import auth from "src/api/auth";
import { defineAsyncComponent } from "vue";

export default {
  // name: 'PageName',
  components: {
    ReviewOverview: defineAsyncComponent(() =>
      import("components/ReviewOverview.vue")
    ),
    DeliveriesOverview: defineAsyncComponent(() =>
      import("components/DeliveriesOverview.vue")
    ),
  },
  data() {
    return {
      data: [],
      is_refresh: false,
    };
  },
  created() {
    this.getProfile();
  },
  methods: {
    getProfile() {
      this.data = auth.getUser();
    },
    refresh(done) {
      this.is_refresh = true;
      setTimeout(() => {
        done();
        this.is_refresh = false;
      }, 1000);
    },
  },
};
</script>
