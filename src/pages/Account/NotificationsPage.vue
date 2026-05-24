<template>
  <q-header class="bg-white text-tagam-ink shadow-sm" reveal reveal-offset="50">
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        v-if="hold"
        @click="resetHold"
        round
        dense
        unelevated
        icon="close"
        class="bg-red-50 text-red-6"
      />
      <q-btn
        v-else
        @click="$router.back()"
        unelevated
        round
        dense
        icon="arrow_back"
        class="bg-tagam-canvas text-tagam-ink"
      />
      <q-toolbar-title class="text-[18px] font-black">
        <template v-if="hold">
          {{ itemToDelete }} {{ $t("selected") }}
        </template>
        <template v-else> {{ $t("Notifications") }} </template>
      </q-toolbar-title>
      <q-btn
        v-if="hold"
        @click="deleteNotification"
        flat
        round
        dense
        icon="las la-trash-alt"
        color="red-5"
      />
    </q-toolbar>
  </q-header>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
      <section class="mx-auto max-w-4xl">
        <div class="mb-4 rounded-[8px] bg-white p-5 shadow-tagam-card">
          <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
            {{ $t("Inbox") }}
          </div>
          <h1 class="m-0 mt-1 text-[28px] font-black text-tagam-ink">
            {{ $t("Notifications") }}
          </h1>
          <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-tagam-muted">
            {{ $t("Dispatch messages, account updates and delivery alerts") }}.
          </p>
        </div>
      <q-infinite-scroll ref="nscroll" @load="getNotifications" :offset="250">
        <template v-slot:default>
          <template v-if="!hasData && !loading">
            <div class="flex min-h-[45vh] items-center justify-center rounded-[8px] border border-dashed border-tagam-line bg-white p-7 text-center shadow-tagam-card">
              <div>
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-tagam-leaf">
                  <q-icon name="notifications_none" size="28px" />
                </div>
                <div class="text-[18px] font-black text-tagam-ink">
                  {{ $t("No available data") }}
                </div>
                <p class="mt-2 text-[13px] font-semibold text-tagam-muted">{{ $t("Pull down the page to refresh") }}</p>
              </div>
            </div>
          </template>
          <q-list separator class="overflow-hidden rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
            <template v-for="itemdata in data" :key="itemdata">
              <q-item
                clickable
                v-for="items in itemdata"
                :key="items"
                v-touch-hold.mouse="handleHold"
                tag="label"
                class="px-4 py-3"
              >
                <q-item-section avatar>
                  <template v-if="hold">
                    <q-checkbox
                      v-model="notification_uuids"
                      :val="items.notification_uuid"
                    />
                  </template>
                  <template v-else>
                    <template v-if="items.image_type === 'image'">
                      <q-avatar>
                        <q-img
                          :src="items.image"
                          style="height: 80px; width: 80px"
                          lazy
                          fit="cover"
                        />
                      </q-avatar>
                    </template>
                    <template v-else>
                      <q-avatar
                        size="md"
                        color="amber-7"
                        text-color="white"
                        icon="las la-bell"
                      />
                    </template>
                  </template>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-black text-tagam-ink" lines="1">
                    {{ items.date }}
                  </q-item-label>
                  <q-item-label caption lines="2" class="text-[13px] font-semibold">
                    {{ items.message }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>

        <template v-slot:loading>
          <div
            class="flex flex-center full-width q-pa-xl"
            style="min-height: calc(50vh)"
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
import APIinterface from "src/api/APIinterface";

export default {
  name: "NotificationsPage",
  data() {
    return {
      loading: true,
      data: [],
      page: 0,
      data_done: false,
      hold: false,
      notification_uuids: [],
    };
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    itemToDelete() {
      return Object.keys(this.notification_uuids).length;
    },
  },
  methods: {
    getNotifications(index, done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getNotification", "page=" + index)
        .then((data) => {
          this.page = index;
          this.data.push(data.details.data);
        })
        .catch((error) => {
          this.data_done = true;
          this.$refs.nscroll.stop();
        })
        .then((data) => {
          done();
          this.loading = false;
        });
    },
    // deleteNotification(index, data) {
    //   this.data.splice(index, 1);
    // },
    deleteNotification() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByToken("deleteNotifications", {
        data: this.notification_uuids,
      })
        .then((data) => {
          this.resetHold();
          this.resetPagination();
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    handleHold(event) {
      this.hold = true;
    },
    resetHold() {
      this.hold = false;
      this.notification_uuids = [];
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    refresh(done) {
      this.resetPagination();
      this.page = 0;
      done();
    },
    //
  },
};
</script>
