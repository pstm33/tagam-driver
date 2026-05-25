<template>
  <q-header class="tw-header">
    <q-toolbar class="mx-auto h-16 max-w-4xl px-4">
      <q-toolbar-title>
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-leaf">
          {{ $t("New assignment") }}
        </div>
        <div class="text-[16px] font-black text-tagam-ink">
          {{ $t("New Order #") }}{{ data.order_id }}
        </div>
      </q-toolbar-title>
      <q-btn
        @click="dialog_confirm = true"
        unelevated
        dense
        :label="$t('Decline')"
        no-caps
        class="rounded-[8px] bg-[#fff3ef] px-4 font-black text-tagam-coral"
      />
    </q-toolbar>
  </q-header>

  <q-page class="tagam-page pb-64">
    <template v-if="!loading">
      <template v-if="hasData">
        <div class="h-[34vh] min-h-[260px] overflow-hidden border-b border-tagam-line bg-white">
          <MapComponents
            class="maps"
            :keys="Activity.maps_config.key"
            :provider="Activity.maps_config.provider"
            :zoom="Activity.maps_config.zoom"
            :center="map_center"
            :markers="map_markers"
          ></MapComponents>
        </div>

        <section class="tagam-shell px-4 pt-4">
          <div class="tagam-panel p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="tagam-eyebrow">
                  {{ $t("Delivery Details") }}
                </div>
                <h1 class="tagam-title mt-1">
                  #{{ data.order_id }}
                </h1>
              </div>
              <div class="rounded-[8px] bg-tagam-cream px-3 py-2 text-right">
                <div class="text-[11px] font-bold text-tagam-muted">{{ $t("Total") }}</div>
                <div class="text-[18px] font-black text-tagam-leafDark">
                  {{ data.total }}
                </div>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div class="rounded-[8px] border border-tagam-line bg-tagam-canvas p-4">
                <div class="mb-2 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.08em] text-tagam-muted">
                  <q-icon name="las la-warehouse" class="text-tagam-leaf" />
                  {{ $t("Pickup") }}
                </div>
                <div class="text-[16px] font-black text-tagam-ink">
                  {{ data.pickup.restaurant_name }}
                </div>
                <p class="mb-0 mt-1 text-[13px] font-semibold leading-5 text-tagam-muted">
                  {{ data.pickup.address }}
                </p>
              </div>
              <div class="rounded-[8px] border border-tagam-line bg-white p-4">
                <div class="mb-2 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.08em] text-tagam-muted">
                  <q-icon name="las la-user-circle" class="text-tagam-leaf" />
                  {{ $t("Drop-off") }}
                </div>
                <div class="text-[16px] font-black text-tagam-ink">
                  {{ data.dropoff.customer_name }}
                </div>
                <p class="mb-0 mt-1 text-[13px] font-semibold leading-5 text-tagam-muted">
                  {{ data.dropoff.address }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div class="fixed inset-x-0 bottom-[76px] z-[2500] border-t border-tagam-line bg-white/95 px-4 py-3 backdrop-blur">
          <div class="tagam-shell">
          <template v-if="Activity.settings_data.enabled_acceptance">
            <q-linear-progress
              :value="progress"
              class="mb-3 rounded-full"
              color="green-8"
            />
          </template>

          <q-list bordered separator class="radius8">
            <q-slide-item
              @left="onLeft"
              left-color="green-8"
              class="overflow-hidden rounded-[8px] shadow-tagam-card"
            >
              <template v-slot:left>
                <div class="flex items-center gap-2 text-[14px] font-black">
                  <q-spinner color="white" size="1.6em" />
                  {{ $t("Release to accept") }}
                </div>
              </template>
              <q-item
                class="tagam-action h-20 text-tagam-ink"
              >
                <q-item-section avatar class="pr-3">
                  <q-avatar
                    size="52px"
                    class="bg-black/10 shadow-sm"
                    text-color="dark"
                    icon="las la-angle-double-right"
                  />
                </q-item-section>
                <q-item-section>
                  <div class="text-[20px] font-black leading-tight">
                    {{ $t("Slide right to accept") }}
                  </div>
                  <div class="mt-1 text-[13px] font-semibold text-white/70">
                    {{ $t("Drag the handle") }}
                  </div>
                </q-item-section>
              </q-item>
            </q-slide-item>
          </q-list>
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="flex min-h-[60vh] items-center justify-center">
        <q-spinner color="green-8" size="2.2em" />
      </div>
    </template>

    <q-dialog v-model="dialog_confirm" persistent>
      <q-card class="rounded-[8px] p-1">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-[20px] font-black text-tagam-ink">{{ $t("Decline") }}</div>
          <q-space />
          <q-btn icon="close" size="sm" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p class="text-[14px] font-semibold text-tagam-muted">
            {{ $t("Are you sure you want to decline this order") }}?
          </p>
        </q-card-section>
        <q-card-section>
          <q-btn
            @click="showDeclineReason"
            :label="$t('Decline')"
            unelevated
            class="h-11 w-full rounded-[8px] bg-tagam-coral font-black text-white"
            no-caps
          ></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>

  <DeclineReason
    ref="decline_reason"
    @after-submit="afterSubmit"
  ></DeclineReason>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useActivityStore } from "stores/ActivityStore";
import { useDriverappStore } from "stores/DriverappStore";

export default {
  name: "NewOrder",
  components: {
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
    ),
    DeclineReason: defineAsyncComponent(() =>
      import("components/DeclineReason.vue")
    ),
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const mapRef = ref(null);
    const cmapsMarker = ref([]);
    const order_uuid = ref("");
    const loading = ref(false);
    const accept_loading = ref(false);
    const data = ref([]);
    const maps_config = ref([]);
    const dialog_confirm = ref(false);
    const title = config.title;
    const map_center = ref([]);
    const map_markers = ref({});
    const $q = useQuasar();
    const reason = ref("");
    const decline_reason = ref(null);
    const status_data = ref([]);
    const remaining = ref(45);
    const progress = ref(1);
    const timer = ref(undefined);

    order_uuid.value = route.query.order_uuid;
    const Activity = useActivityStore();
    const DriverappStore = useDriverappStore();

    const getMapKeys = () => {
      try {
        if (!APIinterface.empty(Activity.maps_config)) {
          map_center.value = {
            lat: parseFloat(Activity.maps_config.default_lat),
            lng: parseFloat(Activity.maps_config.default_lng),
          };
        }
        // const $storage = APIinterface.getStorage("driver_maps_config");
        // maps_config.value = jwtDecode($storage);
        // map_center.value = {
        //   lat: parseFloat(maps_config.value.default_lat),
        //   lng: parseFloat(maps_config.value.default_lng),
        // };
      } catch (err) {
        console.debug(err);
      }
    };

    getMapKeys();

    const orderPreview = () => {
      APIinterface.showLoadingBox("", $q);
      loading.value = true;
      APIinterface.orderPreview({
        order_uuid: order_uuid.value,
      })
        .then((result) => {
          data.value = result.details;
          status_data.value = data.value.status_data;
          map_markers.value = [
            {
              id: 0,
              lat: parseFloat(data.value.pickup.latitude),
              lng: parseFloat(data.value.pickup.longitude),
              label: APIinterface.getIcon("merchant"),
              icon: "marker_icon_merchant",
              draggable: false,
            },
            {
              id: 1,
              lat: parseFloat(data.value.dropoff.latitude),
              lng: parseFloat(data.value.dropoff.longitude),
              label: APIinterface.getIcon("customer"),
              icon: "marker_icon_destination",
              draggable: false,
            },
          ];

          map_center.value = {
            lat: parseFloat(data.value.pickup.latitude),
            lng: parseFloat(data.value.pickup.longitude),
          };
        })
        .catch((error) => {
          console.debug(error);
          router.replace("/order/404");
        })
        .then((data) => {
          loading.value = false;
          APIinterface.hideLoadingBox($q);
        });
    };

    orderPreview();

    const hasData = computed(() =>
      Object.keys(data.value).length ? true : false
    );

    const acceptOrder = (reset) => {
      APIinterface.showLoadingBox("", $q);
      accept_loading.value = true;
      APIinterface.acceptOrder({
        order_uuid: order_uuid.value,
      })
        .then((data) => {
          console.debug(data);
          router.replace("/home/deliveries");
        })
        .catch((error) => {
          console.log("here error");
          reset.reset();
          APIinterface.notify("red-5", error, "error_outline", $q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox($q);
          accept_loading.value = false;
        });
    };

    const onLeft = (reset) => {
      acceptOrder(reset);
    };

    const showDeclineReason = () => {
      dialog_confirm.value = false;
      decline_reason.value.reason = "";
      decline_reason.value.dialog = true;
    };

    const afterSubmit = (data) => {
      reason.value = data;
      declineOrder();
    };

    const declineOrder = () => {
      APIinterface.showLoadingBox("", $q);
      APIinterface.declineOrder({
        order_uuid: order_uuid.value,
        reason: reason.value,
      })
        .then((data) => {
          console.debug(data);
          DriverappStore.getTotalTask();
          router.replace("/home/deliveries");
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", $q);
        })
        .then(() => {
          APIinterface.hideLoadingBox($q);
        });
    };

    onMounted(() => {
      if (Activity.settings_data.enabled_acceptance) {
        remaining.value = parseInt(Activity.settings_data.time_acceptance) * 60;
        startTimer();
      }
    });

    onUnmounted(() => {
      stopTimer();
    });

    watch(remaining, (newValue, oldValue) => {
      //console.log("watch" + remaining.value);
      if (remaining.value < 0) {
        stopTimer();
        timeoutAcceptOrder();
      }
    });

    const startTimer = () => {
      stopTimer();
      timer.value = setInterval(() => {
        remaining.value = remaining.value - 1;
        progress.value = remaining.value / 100;
      }, 1000);
    };
    const stopTimer = () => {
      clearInterval(timer.value);
    };

    const timeoutAcceptOrder = () => {
      APIinterface.showLoadingBox("", $q);
      APIinterface.fetchDataByTokenPost(
        "timeoutAcceptOrder",
        "order_uuid=" + order_uuid.value
      )
        .then((data) => {
          router.replace("/home");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", $q);
        })
        .then(() => {
          APIinterface.hideLoadingBox($q);
        });
    };

    return {
      mapRef,
      hasData,
      loading,
      data,
      maps_config,
      dialog_confirm,
      title,
      map_center,
      map_markers,
      cmapsMarker,
      acceptOrder,
      onLeft,
      accept_loading,
      showDeclineReason,
      decline_reason,
      afterSubmit,
      status_data,
      Activity,
      remaining,
      progress,
    };
  },
  //
};
</script>
