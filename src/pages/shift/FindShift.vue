<template>
  <q-header
    v-if="!is_home"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-tagam-ink shadow-sm': !$q.dark.mode,
    }"
  >
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="las la-angle-left"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-toolbar-title class="text-[18px] font-black"
        >{{ $t("Shifts") }} - {{ month_label }}</q-toolbar-title
      >
      <q-btn
        flat
        round
        dense
        icon="las la-filter"
        color="grey-10"
        @click="showFilter"
      />
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-tagam-canvas text-tagam-ink': !$q.dark.mode,
      }"
    >
      <q-infinite-scroll ref="nscroll" @load="getAvailableShift" :offset="250">
        <template v-slot:default>
          <div class="mx-auto max-w-4xl px-4 pt-3">
            <CalendarHalf
              ref="calendar"
              @after-selectdate="afterSelectdate"
              :today_date="today_date"
            ></CalendarHalf>
          </div>

          <template v-if="loading_myshift">
            <div class="flex flex-center full-width">
              <q-spinner color="amber-7" size="2em" />
            </div>
          </template>
          <template v-if="hasShift && !loading_myshift">
            <div
              class="mx-auto mt-4 max-w-4xl px-4"
              :class="{
                'bg-mydark text-white': $q.dark.mode,
                'text-tagam-ink': !$q.dark.mode,
              }"
            >
              <div class="rounded-[8px] bg-tagam-ink px-4 py-3 text-sm font-black text-white">
                {{ $t("Current shift") }} ({{ total_shift }})
              </div>
            </div>

            <!-- <pre>{{ current_shift_data }}</pre> -->

            <q-list class="mx-auto max-w-4xl space-y-3 px-4 pt-3">
              <q-item v-for="item in current_shift_data" :key="item" class="rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
                <q-item-section>
                  <q-item-label class="font-black text-tagam-ink">{{ item.zone_name }}</q-item-label>
                  <q-item-label caption lines="2" class="font-semibold">
                    {{ item.time_start }} - {{ item.time_end }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <template v-if="item.shift_status == 'on_going'">
                    <div class="font-bold text-green-600">{{ $t("Ongoing") }}</div>
                  </template>
                  <template v-else-if="item.shift_status == 'ended'">
                    <div class="font-bold text-slate-500">{{ $t("shift ended ") }}</div>
                  </template>
                  <template v-else>
                    <q-btn
                      @click="deleteShift(item.schedule_id)"
                      :label="$t('Delete')"
                      unelevated
                      color="red"
                      class="rounded-[8px] text-weight-bold"
                      no-caps
                      style="min-width: 95px"
                    />
                  </template>

                  <template v-if="item.can_end_shift">
                    <q-btn
                      @click="endShift(item.schedule_id)"
                      :label="$t('End shift')"
                      unelevated
                      color="red"
                      class="rounded-[8px] text-weight-bold"
                      no-caps
                      style="min-width: 95px"
                    />
                  </template>
                </q-item-section>
              </q-item>
            </q-list>
          </template>

          <div
            class="mx-auto mt-4 max-w-4xl px-4"
            :class="{
              'bg-mydark text-white': $q.dark.mode,
              'text-tagam-ink': !$q.dark.mode,
            }"
          >
            <div class="rounded-[8px] bg-white px-4 py-3 text-sm font-black text-tagam-ink shadow-tagam-card">
              {{ $t("Available shift") }} ({{ total }})
            </div>
          </div>

          <template v-if="!hasData && !loading">
            <div
              class="text-center flex flex-center"
              style="min-height: calc(50vh)"
            >
              <div class="fit">
                <div class="text-[16px] font-black text-tagam-ink">
                  {{ $t("No available shift") }}
                </div>
                <p class="text-xs font-semibold text-tagam-muted">{{ $t("Pull down the page to refresh") }}</p>
              </div>
            </div>
          </template>

          <q-list v-else class="mx-auto max-w-4xl space-y-3 px-4 pt-3">
            <template v-for="items in data" :key="items">
              <q-item v-for="item in items" :key="item" class="rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
                <q-item-section>
                  <q-item-label class="font-black text-tagam-ink">{{ item.zone_name }}</q-item-label>
                  <q-item-label caption lines="2" class="font-semibold">
                    {{ item.time_start }} - {{ item.time_end }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    @click="shiftDetails(item)"
                    :label="$t('Take Shift')"
                    unelevated
                    color="amber-7"
                    class="rounded-[8px] text-weight-bold"
                    no-caps
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>

        <template v-slot:loading>
          <template v-if="page <= 0">
            <div
              class="flex flex-center full-width q-pa-xl"
              style="min-height: calc(30vh)"
            >
              <q-spinner color="amber-7" size="2em" />
            </div>
          </template>
          <template v-else>
            <div class="text-center q-mt-md">
              <q-spinner color="amber-7" size="2em" />
            </div>
          </template>
        </template>
      </q-infinite-scroll>
    </q-page>
  </q-pull-to-refresh>
  <FilterByzone
    ref="filter_zone"
    @after-applyfilter="afterApplyfilter"
  ></FilterByzone>

  <ConfirmDialog
    ref="confirm_dialog"
    :data="data_dialog"
    @after-confirm="afterConfirm"
  ></ConfirmDialog>

  <q-dialog
    v-model="shift_modal"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="rounded-[8px]" style="width: 700px; max-width: 90vw">
      <q-toolbar class="text-tagam-ink bg-white q-pl-md" dense>
        <q-toolbar-title class="text-tagam-ink text-weight-bold">
          {{ $t("Take shift") }}
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn
          @click="shift_modal = !true"
          color="white"
          square
          unelevated
          text-color="grey"
          icon="las la-times"
          dense
          no-caps
          size="sm"
          class="border-grey radius8"
        />
      </q-toolbar>
      <q-list dense>
        <q-item>
          <q-item-section>{{ $t("Date") }} :</q-item-section>
          <q-item-section side> {{ shift_data.date_shift }} </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>{{ $t("Area") }} :</q-item-section>
          <q-item-section side> {{ shift_data.zone_name }} </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>{{ $t("Time") }} :</q-item-section>
          <q-item-section side>
            {{ shift_data.time_start }} - {{ shift_data.time_end }}
          </q-item-section>
        </q-item>
      </q-list>
      <q-space class="q-pa-sm"></q-space>
      <q-card-actions class="row items-center q-pt-sm q-pb-sm">
        <q-btn
          :label="$t('Cancel')"
          outline
          :color="$q.dark.mode ? 'grey600' : 'grey'"
          :text-color="$q.dark.mode ? 'grey300' : 'dark'"
          no-caps
          class="radius8 col"
          @click="shift_modal = false"
        />
        <q-btn
          :label="$t('Create')"
          color="amber-7"
          text-color="white"
          no-caps
          class="radius8 col"
          unelevated
          @click="takeShift"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import { useScheduleStore } from "stores/ScheduleStore";
// import { Swiper, SwiperSlide } from "swiper/vue";
// import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "FindShift",
  components: {
    // Swiper,
    // SwiperSlide,
    CalendarHalf: defineAsyncComponent(() =>
      import("components/CalendarHalf.vue")
    ),
    FilterByzone: defineAsyncComponent(() =>
      import("components/FilterByzone.vue")
    ),
    ConfirmDialog: defineAsyncComponent(() =>
      import("components/ConfirmDialog.vue")
    ),
  },
  setup() {
    const Activity = useActivityStore();
    const Schedule = useScheduleStore();
    return { Activity, Schedule };
  },
  data() {
    return {
      data: [],
      loading: false,
      loading_myshift: false,
      page: 0,
      today_date: "",
      total: 0,
      month_label: "",
      zone_ids: [],
      shift_modal: false,
      shift_data: [],
      current_shift_data: [],
      total_shift: 0,
      data_dialog: {
        title: this.$t("Delete Confirmation"),
        subtitle: this.$t(
          "Are you sure you want to permanently delete the selected item?"
        ),
        cancel: this.$t("Cancel"),
        confirm: this.$t("Delete"),
      },
      schedule_id: "",
      is_home: false,
      is_refresh: undefined,
    };
  },
  created() {
    if (this.$route.fullPath == "/home/find_schedule") {
      this.is_home = true;
      this.Activity.setTitle(this.$t("Shifts"));
    } else {
      this.is_home = false;
    }

    this.today_date = APIinterface.getDateNow(this.Activity.timezone);
    this.currentShift();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasShift() {
      if (Object.keys(this.current_shift_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    currentShift() {
      this.loading_myshift = true;
      APIinterface.fetchDataByTokenPost(
        "currentShift",
        "date=" + this.today_date
      )
        .then((data) => {
          this.current_shift_data = data.details.data;
          this.total_shift = data.details.total_shift;
        })
        .catch((error) => {
          this.current_shift_data = [];
        })
        .then((data) => {
          this.loading_myshift = false;
        });
    },
    showFilter() {
      this.$refs.filter_zone.showModal(true);
    },
    afterApplyfilter(data) {
      console.log("afterApply");
      console.log(data);
      this.zone_ids = data;
      this.resetPagination();
    },
    afterSelectdate(data) {
      console.log("afterSelectdate=>" + data);
      this.setAvailableShift(data);
    },
    setAvailableShift(data) {
      this.today_date = data;
      this.refresh();
    },
    getAvailableShift(index, done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost2("getAvailableShift", {
        page: index,
        date: this.today_date,
        zone_ids: this.zone_ids,
      })
        .then((data) => {
          this.page = index;

          this.total = data.details.count;
          this.month_label = data.details.month_label;
          this.data.push(data.details.data);

          if (this.is_home) {
            this.Activity.setTitle(this.$t("Shifts - ") + this.month_label);
          }
        })
        .catch((error) => {
          console.log(error);
          if (Object.keys(error).length > 0) {
            //this.month_label = error.details.month_label;
            if (this.is_home) {
              this.Activity.setTitle(this.$t("Shifts - ") + this.month_label);
            }
          }
          if (!APIinterface.empty(this.$refs.nscroll)) {
            this.$refs.nscroll.stop();
          }
        })
        .then((data) => {
          if (done) {
            done();
          }
          if (!APIinterface.empty(this.is_refresh)) {
            this.is_refresh();
          }
          this.loading = false;
        });
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.total = 0;
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    refresh(done) {
      this.resetPagination();
      this.is_refresh = done;
      this.currentShift();
    },
    shiftDetails(data) {
      this.shift_data = data;
      this.shift_modal = true;
    },
    takeShift() {
      this.shift_modal = false;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost(
        "takeShift",
        "shift_uuid=" + this.shift_data.shift_uuid
      )
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          this.currentShift();
          this.resetPagination();
          this.Schedule.data = [];
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    deleteShift(schedule_id) {
      this.schedule_id = schedule_id;
      this.$refs.confirm_dialog.dialog = true;
      //
    },
    afterConfirm() {
      this.$refs.confirm_dialog.dialog = false;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost(
        "deleteSchedule",
        "schedule_id=" + this.schedule_id
      )
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          this.currentShift();
          this.resetPagination();
          this.Schedule.data = [];
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    endShift(schedule_uuid) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.endShift({
        schedule_uuid: schedule_uuid,
      })
        .then((data) => {
          this.currentShift();
          this.resetPagination();
          this.Schedule.data = [];
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
