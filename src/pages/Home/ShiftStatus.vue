<template>
  <q-pull-to-refresh @refresh="refreshShift">
    <q-page class="tagam-page px-4 pb-28 pt-5">
      <template v-if="Schedule.loading">
        <div class="flex min-h-[52vh] w-full items-center justify-center">
          <q-spinner color="green-8" size="2.2em" />
        </div>
      </template>
      <template v-else>
        <section class="tagam-shell">
          <div class="tagam-hero mb-4 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="tagam-eyebrow">
                  {{ $t("Status") }}
                </div>
                <h1 class="tagam-title mt-2">
                  {{ Activity.settings_data.on_demand_availability ? $t("Availability") : $t("Today Schedule") }}
                </h1>
                <p class="tagam-copy mt-2">
                  {{ $t("Manage your shift, location and current delivery status") }}.
                </p>
              </div>
              <div
                class="shrink-0 rounded-[8px] px-3 py-2 text-center"
                :class="Activity.is_online || Schedule.isWorking ? 'bg-tagam-mint text-tagam-leafDark' : 'bg-white/10 text-white'"
              >
                <div class="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  {{ $t("Status") }}
                </div>
                <div class="text-[14px] font-black">
                  {{ Activity.is_online || Schedule.isWorking ? $t("Online") : $t("Offline") }}
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="tagam-panel p-4">
              <div class="text-[12px] font-bold text-tagam-muted">{{ $t("Balance") }}</div>
              <div class="mt-1 text-[22px] font-black text-tagam-ink">
                {{ DriverappStore.hasBalance ? DriverappStore.wallet_balance.balance : "--" }}
              </div>
            </div>
            <div class="tagam-panel p-4">
              <div class="text-[12px] font-bold text-tagam-muted">{{ $t("Deliveries") }}</div>
              <div class="mt-1 text-[22px] font-black text-tagam-ink">
                {{ DriverappStore.getBalance || 0 }}
              </div>
            </div>
            <div class="tagam-panel p-4">
              <div class="text-[12px] font-bold text-tagam-muted">{{ $t("Location") }}</div>
              <div class="mt-1 text-[22px] font-black" :class="location_enabled ? 'text-tagam-leaf' : 'text-tagam-coral'">
                {{ location_enabled ? $t("Enabled") : $t("Disabled") }}
              </div>
            </div>
          </div>
        </section>

        <template v-if="Activity.settings_data.on_demand_availability">
          <section class="tagam-shell tagam-panel mt-4 p-5">
              <div class="flex flex-wrap items-center gap-3">
                <q-btn
                  :label="
                    Activity.is_online ? $t('Go offline') : $t('Go online')
                  "
                  :loading="loading_online"
                  unelevated
                  size="lg"
                  no-caps
                  class="h-12 rounded-[8px] px-7 text-[15px] font-black text-white"
                  :class="Activity.is_online ? 'tagam-action tagam-action-warn' : 'tagam-action'"
                  @click="changeOnlineStatus(Activity.is_online ? false : true)"
                />
                <q-btn
                  unelevated
                  size="lg"
                  no-caps
                  class="h-12 rounded-[8px] border border-tagam-line bg-white px-4 font-black text-tagam-ink"
                  icon="tune"
                  to="/selectzone"
                />
              </div>
              <template v-if="location_enabled === false">
                <div class="mt-4 rounded-[8px] bg-[#fff3ef] p-4">
                  <p class="m-0 text-[14px] font-bold text-tagam-coral">
                    {{ $t("Your location is disabled") }}.
                  </p>
                  <q-btn
                    to="/location/permission"
                    :label="$t('Enabled Location')"
                    unelevated
                    class="mt-3 h-11 rounded-[8px] bg-tagam-ink px-5 font-black text-white"
                    no-caps
                  />
                </div>
              </template>
          </section>
        </template>
        <template v-else>
          <template v-if="Schedule.hasData">
            <section class="tagam-shell mt-4">
              <div class="mb-3 flex items-center justify-between">
                <div
                  class="rounded-full px-4 py-2 text-[13px] font-black"
                  :class="Schedule.isWorking ? 'bg-tagam-mint text-tagam-leafDark' : 'bg-white text-tagam-muted'"
                >
                  {{ Schedule.isWorking ? $t("Working") : $t("Not Working") }}
                </div>
                <q-btn
                  v-if="Schedule.hasBreak"
                  unelevated
                  flat
                  no-caps
                  class="font-black text-tagam-leaf"
                  dense
                  @click="endBreak"
                  >{{ $t("End Break") }}</q-btn
                >
              </div>

              <template v-for="items in Schedule.data" :key="items">
                <article class="tagam-panel mb-4 p-4">
                    <div class="flex items-start gap-4">
                        <div class="flex w-[88px] shrink-0 items-center justify-center rounded-[8px] bg-tagam-canvas p-3">
                          <div class="text-center leading-tight">
                            <div class="text-[15px] font-black text-tagam-leaf">
                              {{ items.date_start_split.month }}
                            </div>
                            <div class="text-[26px] font-black text-tagam-ink">
                              {{ items.date_start_split.day }}
                            </div>
                            <div class="truncate text-[12px] font-bold text-tagam-muted">
                              {{ items.date_start_split.date_string }}
                            </div>
                          </div>
                        </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-[18px] font-black text-tagam-ink">
                          {{ items.time_start }} - {{ items.time_end }}
                        </div>
                        <div class="mt-2 flex items-center gap-2">
                          <q-badge class="bg-tagam-saffron text-tagam-ink">
                            <q-icon name="las la-car-side" size="1.3em" />
                          </q-badge>
                          <div class="truncate text-[14px] font-bold text-tagam-muted">
                            <template
                              v-if="Schedule.vehicle_data[items.vehicle_id]"
                            >
                              {{
                                Schedule.vehicle_maker[
                                  Schedule.vehicle_data[items.vehicle_id].maker
                                ]
                              }}
                              -
                              {{
                                Schedule.vehicle_data[items.vehicle_id]
                                  .plate_number
                              }}
                            </template>
                          </div>
                        </div>

                        <div class="mt-3 text-[15px] font-black text-tagam-ink">
                          {{ items.zone_name }}
                        </div>

                        <div class="mt-1 text-[13px] font-semibold leading-5 text-tagam-muted">
                          {{ items.instructions }}
                        </div>

                        <q-btn
                          v-if="Schedule.vehicle_documents[items.vehicle_id]"
                          :label="$t('View Car Documents')"
                          unelevated
                          no-caps
                          flat
                          class="mt-2 p-0 font-black text-tagam-saffron"
                          size="lg"
                          @click="
                            viewDocs(
                              Schedule.vehicle_documents[items.vehicle_id]
                            )
                          "
                        ></q-btn>

                        <template v-if="items.starting_in">
                          <div class="mt-2 text-[13px] font-black text-tagam-leaf">
                            {{ $t("Starting in") }} {{ items.starting_in }}
                          </div>
                        </template>

                        <template v-if="items.shift_status == 'started'">
                          <div class="mt-2 flex items-center">
                            <q-icon
                              name="las la-check-circle"
                              size="sm"
                              class="text-tagam-leaf"
                            />
                            <div class="ml-2 text-[14px] font-black">
                              {{ $t("Ongoing") }}
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>

                    <template
                      v-if="
                        items.shift_status == 'ready' ||
                        items.shift_status == 'late'
                      "
                    >
                      <p class="mt-4 text-[14px] font-bold text-tagam-muted">{{ $t("Are you ready") }}?</p>
                      <q-btn
                        :label="$t('Start Working Now')"
                        unelevated
                        class="h-12 w-full rounded-[8px] bg-tagam-leaf font-black text-white"
                        no-caps
                        @click="startWorking(items.schedule_uuid)"
                      />
                    </template>
                    <template v-else-if="items.shift_status == 'started'">
                      <template v-if="Schedule.hasBreak">
                        <div class="pt-4 text-center text-[14px] font-bold">
                          <template
                            v-if="Schedule.break_status == 'break_ended'"
                          >
                            <span class="text-tagam-coral">{{
                              $t("Your break is already ended")
                            }}</span>
                          </template>
                          <template v-else>
                            {{ $t("You are on break until") }}
                            <span class="font-black">{{
                              Schedule.data_break.break_until_hours
                            }}</span>
                          </template>
                        </div>
                      </template>

                      <template v-else>
                        <q-btn
                          v-if="Schedule.can_request_break"
                          :label="$t('Request Break')"
                          unelevated
                          class="mt-4 h-12 w-full rounded-[8px] bg-tagam-ink font-black text-white"
                          no-caps
                          :to="{
                            name: 'request_break',
                            query: { schedule_uuid: items.schedule_uuid },
                          }"
                        />
                      </template>
                    </template>
                    <template v-else-if="items.shift_status == 'shift_ended'">
                      <p class="mt-4 text-[14px] font-bold text-tagam-muted">{{ $t("Shift schedule already passed") }}</p>
                      <q-btn
                        :label="$t('Search Shifts')"
                        unelevated
                        class="h-12 w-full rounded-[8px] bg-tagam-leaf font-black text-white"
                        no-caps
                        to="/shift/find"
                      />
                    </template>
                    <template v-else-if="items.shift_status == 'ended'">
                      <p class="mt-4 text-[14px] font-bold text-tagam-muted">
                        {{
                          $t(
                            "Your shift is already done please click end shift"
                          )
                        }}!
                      </p>
                      <q-btn
                        :label="$t('End shift')"
                        unelevated
                        class="h-12 w-full rounded-[8px] bg-tagam-coral font-black text-white"
                        no-caps
                        @click="endShift(items.schedule_uuid)"
                      />
                    </template>

                    <template v-if="Activity.settings_data.enabled_end_shift">
                      <template
                        v-if="
                          items.shift_status == 'started' ||
                          items.shift_status == 'shift_ended'
                        "
                      >
                        <q-btn
                          :label="$t('End shift')"
                          unelevated
                          class="mt-3 h-12 w-full rounded-[8px] bg-tagam-coral font-black text-white"
                          no-caps
                          @click="endShift(items.schedule_uuid)"
                        />
                      </template>
                    </template>

                    <template v-if="location_enabled === false">
                      <p class="mb-2 mt-4 text-[14px] font-bold text-tagam-coral">
                        {{ $t("Your location is disabled") }}.
                      </p>
                      <q-btn
                        to="/location/permission"
                        :label="$t('Enabled Location')"
                        unelevated
                        class="h-11 w-full rounded-[8px] bg-tagam-ink font-black text-white"
                        no-caps
                      />
                    </template>
                </article>
              </template>
            </section>
          </template>
          <template v-else>
            <section class="tagam-shell tagam-panel mt-5 border-dashed p-6 text-center">
              <div class="text-[18px] font-black text-tagam-ink">
                <template v-if="employment_type == 'contractor'">
                  {{ $t("You don't have any shifts starting soon") }}.
                </template>
                <template v-else>
                  {{ $t("You have no work schedule for today") }}
                </template>
              </div>
              <p class="mt-2 text-[13px] font-semibold text-tagam-muted">
                <template v-if="employment_type == 'contractor'">
                  {{ $t("Search for more available shifts") }}
                </template>
                <template v-else>
                  {{ $t("Pull down the page to refresh") }}
                </template>
              </p>
              <q-btn
                v-if="employment_type == 'contractor'"
                :label="$t('Search Shifts')"
                unelevated
                class="mt-3 h-12 w-full rounded-[8px] bg-tagam-leaf font-black text-white"
                no-caps
                to="/shift/find"
              />
            </section>
          </template>
        </template>
      </template>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="eva-message-circle-outline"
          class="bg-tagam-leaf text-white"
          to="/account/chat"
        />
      </q-page-sticky>
    </q-page>
  </q-pull-to-refresh>
  <AddCarPhoto
    ref="car_photo"
    :schedule_uuid="schedule_uuid"
    @after-attachphoto="afterAttachphoto"
  />
  <PhotoCarousel ref="photo_carousel" :title="$t('Car Documents')" :data="docs_data">
  </PhotoCarousel>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import { useScheduleStore } from "stores/ScheduleStore";
import { useDriverappStore } from "stores/DriverappStore";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import AppLocation from "src/api/AppLocation";
import auth from "src/api/auth";
import { Geolocation } from "@capacitor/geolocation";

export default {
  name: "ShiftStatus",
  components: {
    AddCarPhoto: defineAsyncComponent(() =>
      import("components/AddCarPhoto.vue")
    ),
    PhotoCarousel: defineAsyncComponent(() =>
      import("components/PhotoCarousel.vue")
    ),
  },
  setup() {
    const Activity = useActivityStore();
    const Schedule = useScheduleStore();
    const DriverappStore = useDriverappStore();
    return { Activity, Schedule, DriverappStore };
  },
  data() {
    return {
      loading: false,
      schedule_uuid: "",
      location_enabled: false,
      docs_data: [],
      employment_type: "",
      loading_online: false,
    };
  },
  created() {
    if (this.Activity.settings_data.on_demand_availability) {
      if (!this.Activity.is_online) {
        this.Activity.getOnlineStatus(null);
      }
    } else {
      this.Schedule.$q = this.$q;
      this.Activity.setTitle(this.$t("Status"));
      if (!this.Schedule.hadData()) {
        this.Schedule.gettShift();
      } else {
        this.Schedule.runRemainingTime();
        this.Schedule.startTimer();
      }
    }

    let $user_data = [];
    if (($user_data = auth.getUser())) {
      this.employment_type = $user_data.employment_type;
    }

    if (this.$q.capacitor) {
      this.locationEnabled();
    } else {
      this.locationWebEnabled();
    }
    if (!this.DriverappStore.wallet_balance) {
      this.DriverappStore.getRemainingCashBalance();
    }
  },
  unmounted() {
    this.Schedule.stopTimer();
  },
  mounted() {
    if (!this.DriverappStore.total_task) {
      this.DriverappStore.getTotalTask();
    }
  },
  methods: {
    async locationWebEnabled() {
      if (APIinterface.getSession("dev_location_enabled") == 1) {
        this.location_enabled = true;
        return;
      }
      const permission = await Geolocation.checkPermissions();
      if (permission.location == "granted") {
        this.location_enabled = true;
      } else {
        this.location_enabled = false;
      }
    },
    refreshShift(done) {
      if (this.Activity.settings_data.on_demand_availability) {
        this.Activity.getOnlineStatus(done);
      } else {
        this.Schedule.refreshShift(done);
      }
      this.DriverappStore.getRemainingCashBalance();
      this.DriverappStore.getTotalTask();
    },
    startWorking(schedule_uuid) {
      this.schedule_uuid = schedule_uuid;
      let $task_take_pic = !APIinterface.empty(this.Activity.settings_data)
        ? this.Activity.settings_data.task_take_pic
        : false;
      console.log("=>" + $task_take_pic);
      if ($task_take_pic) {
        this.setPhoto();
      } else {
        this.startShift(schedule_uuid);
      }
    },
    setPhoto(schedule_uuid) {
      this.$refs.car_photo.dialog = true;
    },
    afterAttachphoto(data) {
      this.startShift(data);
    },
    startShift(schedule_uuid) {
      APIinterface.showLoadingBox("Starting", this.$q);
      APIinterface.startShift({
        schedule_uuid: schedule_uuid,
      })
        .then((data) => {
          this.Schedule.gettShift();
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
          this.Schedule.gettShift();
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    async locationEnabled() {
      try {
        const result = await AppLocation.islocationEnabled();
        if (result == "granted") {
          this.location_enabled = true;
        } else {
          this.location_enabled = false;
        }
      } catch (error) {
        this.location_enabled = false;
      } finally {
      }
    },
    viewDocs(data) {
      this.docs_data = data;
      this.$refs.photo_carousel.dialog = true;
    },
    endBreak(schedule_uuid) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost(
        "endBreak",
        "id=" + this.Schedule.data_break.id
      )
        .then((data) => {
          this.Schedule.gettShift();
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    changeOnlineStatus(data) {
      let new_data = data == true ? 1 : 0;
      this.loading_online = true;

      APIinterface.fetchDataByTokenPost(
        "changeOnlineStatus",
        "is_online=" + new_data
      )
        .then((data) => {
          this.Activity.is_online = data.details.is_online;
          if (this.Activity.is_online) {
            this.$router.push("/selectzone");
          }
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          // this.$q.loading.hide();
          this.loading_online = false;
        });
    },
  },
};
</script>
