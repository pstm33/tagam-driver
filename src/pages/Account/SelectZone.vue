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
        $t("Select Zone")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <template v-if="loading">
      <div class="flex min-h-[55vh] items-center justify-center">
        <q-spinner color="green-8" size="2.2em" />
      </div>
    </template>
    <template v-else>
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
            Dispatch area
          </div>
          <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">
            {{ $t("Select Zone") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">
            {{
              $t(
                "Before you start receiving orders, please choose your preferred zone. Select a zone to get started and receive orders from your desired location"
              )
            }}.
          </p>
        </div>

        <div class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <q-list separator>
            <q-item tag="label" v-ripple v-for="items in getZone" :key="items" class="px-4 py-3">
              <q-item-section avatar>
                <q-checkbox v-model="zone_id" :val="items.zone_id" color="green-8" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-[15px] font-black text-tagam-ink">{{ items.zone_name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="map" class="text-tagam-muted" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </section>
      <q-footer class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <q-btn
          label="Submit"
          size="lg"
          unelevated
          no-caps
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          @click="onSubmit"
        ></q-btn>
      </q-footer>
    </template>
  </q-page>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "SelectZone",
  data() {
    return {
      zone_id: [],
      loading: false,
      data: [],
    };
  },
  setup(props) {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.getZoneList();
  },
  computed: {
    getZone() {
      return this.data;
    },
  },
  methods: {
    getZoneList() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getOndemanzone")
        .then((data) => {
          this.data = data.details.data;
          this.zone_id = data.details.driver_zone;
        })
        .catch((error) => {
          this.data = [];
          this.zone_id = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost2("setZone", {
        zone_id: this.zone_id,
      })
        .then((data) => {
          this.$router.push("/home");
          APIinterface.notify("light-green", data.msg, "check_circle", this.$q);
        })
        .catch((error) => {
          console.log(error);
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
