<template>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
        <div class="flex items-center gap-4">
          <q-avatar size="58px">
            <q-img :src="data.avatar" fit="cover" spinner-size="20px">
              <template v-slot:error>
                <img src="~assets/user@2x.png" />
              </template>
            </q-img>
          </q-avatar>
          <div class="min-w-0">
            <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
              {{ $t("Account Settings") }}
            </div>
            <h1 class="m-0 truncate text-[26px] font-black text-tagam-ink">
              {{ data.first_name }} {{ data.last_name }}
            </h1>
            <p class="m-0 truncate text-[13px] font-semibold text-tagam-muted">
              {{ data.email_address }}
            </p>
          </div>
        </div>
      </div>

      <q-list class="modern-settings-list rounded-[8px] bg-white p-2 shadow-tagam-card">
        <q-item clickable v-ripple to="/account/edit-profile">
          <q-item-section avatar>
            <q-avatar icon="las la-user-alt" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Manage Profile") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/account/change-password">
          <q-item-section avatar>
            <q-avatar icon="las la-lock" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Change Password") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/account/documents">
          <q-item-section avatar>
            <q-avatar icon="las la-id-card" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Documents") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>

        <template v-if="data.employment_type == 'contractor'">
          <q-item clickable v-ripple to="/account/vehicle">
            <q-item-section avatar>
              <q-avatar icon="las la-car" size="md" />
            </q-item-section>
            <q-item-section class="font-black">{{ $t("Vehicle") }}</q-item-section>
            <q-item-section side>
              <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
            </q-item-section>
          </q-item>
        </template>

        <q-item clickable v-ripple to="/account/bankinfo">
          <q-item-section avatar>
            <q-avatar icon="las la-university" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Bank information") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/account/payments">
          <q-item-section avatar>
            <q-avatar icon="las la-credit-card" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Payment Options") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-avatar icon="las la-bell" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Push Notifications") }} </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="Activity.push_notifications"
              @update:model-value="setNotifications"
              color="primary"
              dense
            />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple v-if="is_awake_supported">
          <q-item-section avatar>
            <q-avatar icon="las la-bell" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Keep Awake") }} </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="Activity.keep_awake"
              @update:model-value="setAwake"
              color="primary"
              dense
            />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-avatar icon="las la-adjust" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Dark Mode") }}</q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="dark_mode"
              @update:model-value="setDarkmode"
              color="primary"
              dense
            />
          </q-item-section>
        </q-item>

        <q-item
          v-if="Activity.settings_data.enabled_language"
          clickable
          v-ripple
          to="/settings/language"
        >
          <q-item-section avatar>
            <q-avatar icon="las la-globe" size="md" />
          </q-item-section>
          <q-item-section class="font-black"> {{ $t("Language") }} </q-item-section>
          <q-item-section side v-if="Activity.lang_data">
            <template v-for="lang in Activity.lang_data.data" :key="lang">
              <q-btn
                v-if="lang.code == this.Activity.app_language"
                no-caps
                :label="lang.title"
                unelevated
                text-color="dark"
                :icon-right="
                  Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'
                "
                dense
                class="text-grey-5 font13"
              />
            </template>
          </q-item-section>
        </q-item>

        <q-item
          v-if="Activity.settings_data.enabled_language"
          clickable
          v-ripple
          @click="rtl = !rtl"
        >
          <q-item-section avatar>
            <q-avatar icon="format_textdirection_l_to_r" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Direction") }}</q-item-section>
          <q-item-section side>
            <q-btn
              no-caps
              :label="Activity.rtl ? $t('LRT') : $t('RTL')"
              unelevated
              text-color="dark"
              :icon-right="
                Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'
              "
              dense
              class="text-grey-5 font13"
            />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/account/delete">
          <q-item-section avatar>
            <q-avatar icon="las la-user-slash" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Delete Account") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>

        <q-item to="/settings/legal" clickable v-ripple>
          <q-item-section avatar>
            <q-avatar icon="las la-balance-scale" size="md" />
          </q-item-section>
          <q-item-section class="font-black">{{ $t("Legal") }}</q-item-section>
          <q-item-section side>
            <q-icon :name="Activity.rtl ? 'las la-angle-left' : 'las la-angle-right'" />
          </q-item-section>
        </q-item>
      </q-list>
    </section>
  </q-page>
</template>

<script>
import { KeepAwake } from "@capacitor-community/keep-awake";
import { useActivityStore } from "stores/ActivityStore";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { FCM } from "@capacitor-community/fcm";
import config from "src/api/config";

export default {
  name: "SettingsPage",
  data() {
    return {
      data: [],
      dark_mode: false,
      enabled_notifications: false,
      rtl: false,
      is_awake_supported: false,
    };
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.Activity.setTitle(this.$t("Settings"));
    this.dark_mode = this.Activity.dark_mode;
    this.getProfile();
    this.getKeepAwake();
  },
  watch: {
    dark_mode(newval, oldval) {
      this.$q.dark.set(newval);
      this.Activity.dark_mode = newval;
    },
    rtl(newval, oldval) {
      this.Activity.rtl = newval;
      this.$q.lang.set({ rtl: newval });
    },
  },
  methods: {
    getProfile() {
      this.data = auth.getUser();
      this.enabled_notifications = this.data.notification ? true : false;
    },
    setNotifications(value) {
      if (this.$q.capacitor) {
        let $user_data = auth.getUser();
        if (value) {
          if ($user_data) {
            this.subsribeDevice($user_data.driver_uuid);
            setTimeout(() => {
              this.subscribeTopics();
            }, 2000);
          }
        } else {
          if ($user_data) {
            this.unsubscribeToTopic($user_data.driver_uuid);
            setTimeout(() => {
              this.unsubscribeToTopic(config.topic);
            }, 2000);
          }
        }
      } else {
        APIinterface.showLoadingBox("", this.$q);
        this.loading = true;
        APIinterface.fetchDataByToken("setNotifications", {
          enabled: value ? 1 : 0,
        })
          .then((data) => {
            auth.setUser(data.details.user_data);
          })
          .catch((error) => {
            APIinterface.notify("red-5", error, "error_outline", this.$q);
          })
          .then((data) => {
            APIinterface.hideLoadingBox(this.$q);
          });
      }
    },
    setDarkmode() {
      auth.setDarkmode(this.dark_mode);
    },
    subsribeDevice(data) {
      FCM.subscribeTo({ topic: data })
        .then((r) => {
          this.Activity.push_notifications = true;
          this.Activity.push_off = false;
          // APIinterface.notify(
          //   "light-green",
          //   "Succesful subscribe to " + data,
          //   "check_circle",
          //   this.$q
          // );
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
    },
    unsubscribeToTopic(data) {
      FCM.unsubscribeFrom({ topic: data })
        .then(() => {
          this.Activity.push_notifications = false;
          this.Activity.push_off = true;
          //alert("unsubscribed from topic =>" + data);
        })
        .catch((err) => {
          //alert(JSON.stringify(err));
        });
    },
    async getKeepAwake() {
      const result = await KeepAwake.isSupported();
      console.log(result);
      this.is_awake_supported = result.isSupported;
    },
    async setAwake(data) {
      console.log(data);
      if (this.is_awake_supported) {
        if (data) {
          const result = await KeepAwake.keepAwake();
          //alert(JSON.stringify(result));
        } else {
          const result = await KeepAwake.allowSleep();
          //alert(JSON.stringify(result));
        }
      }
    },
    subscribeTopics() {
      FCM.subscribeTo({ topic: config.topic })
        .then((r) => {
          //alert("subscribe susccess=>" + config.topic);
        })
        .catch((error) => {
          //alert(JSON.stringify(err));
        });
    },
  },
};
</script>
