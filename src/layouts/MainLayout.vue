<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="tw-header">
      <q-toolbar class="mx-auto h-16 max-w-4xl px-4">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="text-tagam-ink"
          @click="drawerLeft = !drawerLeft"
        />
        <q-toolbar-title>
          <div class="leading-tight">
            <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
              TAGAM Driver
            </div>
            <div class="text-[15px] font-black text-tagam-ink">
              {{ $t(Activity.title) }}
            </div>
          </div>
        </q-toolbar-title>
        <NotiButton ref="noti_button"></NotiButton>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="drawerLeft" :width="292" class="tagam-page">
      <div class="px-4 pb-4 pt-5">
        <div class="tagam-hero p-4">
          <div class="flex items-center gap-3">
            <q-avatar size="48px">
                <q-img :src="data.avatar" fit="cover" spinner-size="20px">
                  <template v-slot:error>
                    <img src="~assets/user@2x.png" />
                  </template>
                </q-img>
              </q-avatar>
            <div class="min-w-0">
              <div class="truncate text-[15px] font-black text-white">
                {{ data.first_name }} {{ data.last_name }}
              </div>
              <div class="truncate text-[12px] font-bold text-white/65">
                {{ data.email_address }}
              </div>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-[8px] bg-white/10 px-3 py-2">
              <div class="text-[11px] font-bold text-white/60">Mode</div>
              <div class="text-[13px] font-black text-tagam-leaf">
                {{ Activity.is_online ? "Online" : "Ready" }}
              </div>
            </div>
            <div class="rounded-[8px] bg-white/10 px-3 py-2">
              <div class="text-[11px] font-bold text-white/60">Role</div>
              <div class="truncate text-[13px] font-black text-white">
                {{ data.employment_type || "driver" }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-scroll-area class="fit border-r border-tagam-line" style="padding-top: 190px">
        <q-list padding class="left-menu modern-left-menu px-3">
          <q-item
            clickable
            @click="drawerLeft = !drawerLeft"
            v-ripple
            to="/home"
          >
            <q-item-section avatar>
              <q-icon name="las la-home" />
            </q-item-section>
            <q-item-section class="font-bold">{{
              $t("Home")
            }}</q-item-section>
          </q-item>

          <template v-if="!Activity.settings_data.on_demand_availability">
            <template v-if="data.employment_type == 'contractor'">
              <q-item
                clickable
                v-ripple
                to="/home/find_schedule"
                @click="drawerLeft = !drawerLeft"
              >
                <q-item-section avatar>
                  <q-icon name="las la-calendar" />
                </q-item-section>
                <q-item-section class="font-bold">{{
                  $t("Schedule")
                }}</q-item-section>
              </q-item>
            </template>

            <template v-else>
              <q-item
                clickable
                v-ripple
                to="/home/schedule"
                @click="drawerLeft = !drawerLeft"
              >
                <q-item-section avatar>
                  <q-icon name="las la-calendar" />
                </q-item-section>
                <q-item-section class="font-bold">{{
                  $t("My Schedule")
                }}</q-item-section>
              </q-item>
            </template>
          </template>

          <q-item
            clickable
            v-ripple
            to="/home/earning"
            @click="drawerLeft = !drawerLeft"
          >
            <q-item-section avatar>
              <q-icon name="las la-hand-holding-usd" />
            </q-item-section>
            <q-item-section class="font-bold">{{
              $t("Earnings")
            }}</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            @click="drawerLeft = !drawerLeft"
            to="/home/settings"
          >
            <q-item-section avatar>
              <q-icon name="las la-user" />
            </q-item-section>
            <q-item-section class="font-bold">{{
              $t("Account")
            }}</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/home/legal"
            @click="drawerLeft = !drawerLeft"
          >
            <q-item-section avatar>
              <q-icon name="las la-balance-scale" />
            </q-item-section>
            <q-item-section class="font-bold">{{
              $t("Legal")
            }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="confirmLogout">
            <q-item-section avatar>
              <q-icon name="las la-sign-out-alt" />
            </q-item-section>
            <q-item-section class="font-bold">{{
              $t("Logout")
            }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-footer bordered class="bg-white/95 text-tagam-ink modified-footer backdrop-blur">
      <TabMenu ref="tabmenu"> </TabMenu>
    </q-footer>

    <q-page-container class="tagam-page text-tagam-ink">
      <LocationTracker ref="location_tracker"></LocationTracker>
      <router-view />
    </q-page-container>

    <ConfirmDialog
      ref="confirm_dialog"
      :data="data_dialog"
      @after-confirm="afterConfirm"
    ></ConfirmDialog>
  </q-layout>
</template>

<script>
import { Device } from "@capacitor/device";
import { defineComponent } from "vue";
import { defineAsyncComponent } from "vue";
import { useActivityStore } from "stores/ActivityStore";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { useScheduleStore } from "stores/ScheduleStore";
import { DeliveryOverviewStore } from "stores/DeliveryOverviewStore";
import { ReviewOverviewStore } from "stores/ReviewOverviewStore";
import { FCM } from "@capacitor-community/fcm";
import { KeepAwake } from "@capacitor-community/keep-awake";

export default defineComponent({
  name: "MainLayout",
  components: {
    TabMenu: defineAsyncComponent(() => import("components/TabMenu.vue")),
    NotiButton: defineAsyncComponent(() => import("components/NotiButton.vue")),
    LocationTracker: defineAsyncComponent(() =>
      import("components/LocationTracker.vue")
    ),
    ConfirmDialog: defineAsyncComponent(() =>
      import("components/ConfirmDialog.vue")
    ),
  },
  setup() {
    const Activity = useActivityStore();
    const Schedule = useScheduleStore();
    const DeliveryOverview = DeliveryOverviewStore();
    const ReviewOverview = ReviewOverviewStore();
    return { Activity, Schedule, DeliveryOverview, ReviewOverview };
  },
  data() {
    return {
      drawerLeft: false,
      data: [],

      data_dialog: {
        title: this.$t("Sign Out"),
        subtitle: this.$t("Do you want to logout?"),
        cancel: this.$t("Cancel"),
        confirm: this.$t("Log out"),
      },
    };
  },
  created() {
    this.data = auth.getUser();
    if (this.$q.capacitor) {
      this.DeviceInit();
      this.setAwake();
    }
    this.$q.dark.set(this.Activity.dark_mode);
  },
  methods: {
    confirmLogout() {
      this.drawerLeft = false;
      this.$refs.confirm_dialog.dialog = true;
    },
    afterConfirm() {
      this.$refs.confirm_dialog.dialog = false;
      this.logout();
    },
    logout() {
      if (this.$q.capacitor) {
        this.$refs.location_tracker.stopWacthers();
      } else {
        this.$refs.location_tracker.clearWatch();
      }

      this.Schedule.clearData();
      this.DeliveryOverview.clearData();
      this.ReviewOverview.clearData();
      APIinterface.setSession("skip_location", "");

      let $user_data = auth.getUser();
      if ($user_data && this.$q.capacitor) {
        this.unsubscribeToTopic($user_data.driver_uuid);
      }

      auth.logout();
      this.$router.replace("/user/login");
    },
    DeviceInit() {
      const $deviceToken = APIinterface.getSession("device_token");
      const $isRegistered = APIinterface.getSession("device_registered");
      const $isRegisteredAuth = APIinterface.getSession(
        "device_registered_auth"
      );

      if (auth.authenticated()) {
        if ($isRegisteredAuth !== 1) {
          Device.getId().then((data) => {
            Device.getInfo().then((Info) => {
              this.updateDevice($deviceToken, data.identifier, Info.platform);
            });
          });
        }
      } else {
        if ($isRegistered !== 1) {
          Device.getId().then((data) => {
            Device.getInfo().then((Info) => {
              this.registerDevice($deviceToken, data.identifier, Info.platform);
            });
          });
        }
      }

      this.subsribeDevice();
      //
    },
    registerDevice(token, deviceUuid, platform) {
      APIinterface.fetchDataByBearer("registerDevice", {
        token: token,
        device_uiid: deviceUuid,
        platform: platform,
      }).then((data) => {
        APIinterface.setSession("device_registered", 1);
        //alert(JSON.stringify(data));
      });
    },
    updateDevice(token, deviceUuid, platform) {
      APIinterface.fetchDataByToken("updateDevice", {
        token: token,
        device_uiid: deviceUuid,
        platform: platform,
      })
        .then((data) => {
          APIinterface.setSession("device_registered_auth", 1);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        });
    },
    subsribeDevice() {
      let $user_data = auth.getUser();
      if ($user_data && !this.Activity.push_off) {
        FCM.subscribeTo({ topic: $user_data.driver_uuid })
          .then((r) => {
            this.Activity.push_notifications = true;
          })
          .catch((error) => {
            this.Activity.push_notifications = false;
            APIinterface.notify(
              "dark",
              "Error subscribing topics" + JSON.stringify(error),
              "warning",
              this.$q
            );
          });
      }
    },
    unsubscribeToTopic(data) {
      FCM.unsubscribeFrom({ topic: data })
        .then(() => {
          this.DataStore.push_notifications = false;
        })
        .catch((err) => {});
    },
    async setAwake() {
      if (this.Activity.keep_awake) {
        const result = await KeepAwake.keepAwake();
      } else {
        const result = await KeepAwake.allowSleep();
      }
    },
    //
  },
});
</script>
