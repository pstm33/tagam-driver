<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
            Shift records
          </div>
          <h1 class="m-0 mt-1 text-[28px] font-black text-tagam-ink">
            {{ $t("My Schedule") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">
            Past and assigned shift windows, vehicles and delivery counts.
          </p>
        </div>
        <q-infinite-scroll ref="nscroll" @load="getHistory" :offset="300">
          <template v-slot:default>
            <template v-if="!hasData && !loading">
              <div class="flex min-h-[45vh] items-center justify-center rounded-[8px] border border-dashed border-tagam-line bg-white p-7 text-center shadow-tagam-card">
                <div>
                  <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
                    <q-icon name="event_available" size="28px" />
                  </div>
                  <div class="text-[18px] font-black text-tagam-ink">
                    {{ $t("No available data") }}
                  </div>
                  <p class="mt-2 text-[13px] font-semibold text-tagam-muted">{{ $t("Pull down the page to refresh") }}</p>
                </div>
              </div>
            </template>

            <template v-for="itemdata in data" :key="itemdata">
              <article
                v-for="items in itemdata"
                :key="items"
                class="mb-4 overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card"
              >
                <q-list separator>
                  <q-item class="px-4 py-4">
                    <q-item-section>
                      <q-item-label class="text-[16px] font-black text-tagam-ink">{{
                        $t("Schedule")
                      }}</q-item-label>
                      <q-item-label lines="2" class="text-[13px] font-semibold text-tagam-muted" caption>
                        {{ items.time_start }} - {{ items.time_end }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-[12px] font-black text-tagam-ink">{{
                        $t("Start/Finish at")
                      }}</q-item-label>
                      <q-item-label lines="2" class="text-[12px] font-semibold" caption>
                        <template v-if="items.shift_time_ended">
                          {{ items.shift_time_started }} -
                          {{ items.shift_time_ended }}
                        </template>
                        <template v-else> {{ $t("N/A") }} </template>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item class="px-4 py-3">
                    <q-item-section>
                      <q-item-label caption class="font-bold">{{
                        $t("Vehicle Type")
                      }}</q-item-label>
                      <q-item-label lines="2" class="text-[13px] font-black text-tagam-ink">
                        {{ items.maker }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="font-bold text-tagam-muted">{{
                        $t("Deliveries")
                      }}</q-item-label>
                      <q-item-label lines="2" class="text-[18px] font-black text-tagam-leaf" caption>
                        {{ items.total_delivered }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item class="px-4 py-3">
                    <q-item-section>
                      <q-item-label caption class="font-bold">{{ $t("Plate #") }}</q-item-label>
                      <q-item-label lines="2" class="text-[13px] font-black text-tagam-ink">{{
                        items.vehicle.plate_number
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item class="px-4 py-3">
                    <q-item-section>
                      <q-item-label caption class="font-bold">{{ $t("Notes") }}</q-item-label>
                      <q-item-label lines="2" class="text-[13px] font-semibold text-tagam-muted">{{
                        items.instructions
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </article>
            </template>
          </template>
          <!-- end defualt -->
          <template v-slot:loading>
            <div
              class="flex flex-center full-width q-pa-xl"
              style="min-height: calc(40vh)"
            >
              <q-spinner color="primary" size="2em" />
            </div>
          </template>
        </q-infinite-scroll>
      </section>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import { ShiftHistoryStore } from "stores/MyScheduleStore";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "ScheduleList",
  components: {
    // LoaderOrder: defineAsyncComponent(() =>
    //   import("components/LoaderOrder.vue")
    // ),
  },
  setup() {
    const Activity = useActivityStore();
    const history = ShiftHistoryStore();
    return { Activity, history };
  },
  data() {
    return {
      loading: false,
      data: [],
      loading_count: 2,
      page: 0,
    };
  },
  created() {
    this.Activity.setTitle(this.$t("My Schedule"));
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  watch: {
    page(newval, oldval) {
      if (this.page > 0) {
        this.loading_count = 1;
      } else this.loading_count = 2;
    },
  },
  methods: {
    getHistory(index, done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("shifthistory", "page=" + index)
        .then((data) => {
          this.page = index;
          this.data.push(data.details.data);
        })
        .catch((error) => {
          this.$refs.nscroll.stop();
        })
        .then((data) => {
          done();
          this.loading = false;
        });
    },
    resetPagination() {
      this.data = [];
      this.page = 0;
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    refresh(done) {
      this.resetPagination();
      if (!APIinterface.empty(done)) {
        done();
      }
    },
  },
};
</script>
