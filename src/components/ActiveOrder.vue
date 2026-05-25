<template>
  <div class="bg-white text-tagam-ink">
    <div class="p-4">
      <div class="flex items-center justify-between">
        <div class="tagam-eyebrow">{{ $t("Restaurant Details") }}</div>
        <div class="tagam-chip">#{{ data.order_id }}</div>
      </div>
      <div class="mt-3 flex items-center gap-3">
        <div v-if="merchants[data.merchant_id]" class="min-w-0 flex-1 text-[18px] font-black">
          {{ merchants[data.merchant_id].restaurant_name }}
        </div>
        <div class="shrink-0">
          <div class="flex items-center justify-end">
            <q-btn
              round
              icon="las la-map"
              size="sm"
              unelevated
              class="tagam-icon-btn mr-2"
              to="/home/maps"
            />

            <q-btn
              :href="'tel:' + merchants[data.merchant_id].contact_phone"
              round
              icon="las la-phone-volume"
              size="sm"
              unelevated
              class="bg-tagam-mint text-tagam-leaf"
            />
          </div>
        </div>
      </div>
      <!-- row -->

      <div class="mt-3 flex items-start gap-2">
        <div class="shrink-0">
          <q-icon name="las la-map-marker-alt" size="18px" />
        </div>
        <div class="min-w-0 flex-1">
          <p
            v-if="merchants[data.merchant_id]"
            class="m-0 text-[13px] font-semibold leading-5 text-tagam-muted"
          >
            {{ merchants[data.merchant_id].address }}
          </p>
        </div>
      </div>
      <!-- flex -->
    </div>
    <!-- q-pa-md -->

    <q-card class="no-shadow border-t border-tagam-line">
      <q-card-section>
        <div class="text-[16px] font-black">
          {{ $t("Restaurant time preparation") }}
        </div>

        <div class="text-center">
          <PreparationCircularprogress
            :order_accepted_at="data.order_accepted_at"
            :preparation_starts="data.preparation_starts"
            :timezone="
              order_meta[data.order_id]
                ? order_meta[data.order_id]['timezone']
                : ''
            "
            :total_time="data.preparation_time_estimation"
            :label="{
              hour: $t('hour'),
              hours: $t('hours'),
              min: $t('min'),
              mins: $t('mins'),
              order_overdue: $t('Order is Overdue!'),
            }"
          >
          </PreparationCircularprogress>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="no-shadow border-t border-tagam-line">
      <q-card-section class="text-center">
        <!-- <template v-if="data.delivery_steps.steps == 2"> -->
        <p class="font12">{{ $t("Estimated Arrival") }}</p>
        <!-- </template> -->

        <!-- map -->
        <div class="map medium tagam-map relative-position">
          <div
            class="q-mr-sm absolute-bottom-right q-ma-md"
            style="z-index: 99"
          >
            <launchNavigation :location="center"> </launchNavigation>
          </div>
          <MapComponents
            class="maps"
            :keys="Activity.maps_config.key"
            :provider="Activity.maps_config.provider"
            :zoom="Activity.maps_config.zoom"
            :center="center"
            :markers="markers"
          ></MapComponents>
        </div>
        <!-- map -->
      </q-card-section>
    </q-card>

    <div class="p-4">
      <q-list bordered separator class="overflow-hidden rounded-[8px]">
        <q-slide-item
          @left="changeStatus"
          left-color="light-green-4"
          class="radius8"
        >
          <template v-slot:left>
            <q-spinner color="primary" size="2em" />
          </template>
          <q-item
            class="tagam-action text-white text-weight-bold btn-11"
          >
            <q-item-section class="text-center font17">{{
              $t(data.delivery_steps.label)
            }}</q-item-section>
            <q-item-section avatar>
              <q-avatar
                text-color="white"
                icon="las la-angle-double-right"
              />
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import jwtDecode from "jwt-decode";
import APIinterface from "src/api/APIinterface";
import { useLocationStore } from "stores/LocationStore";
import { useActivityStore } from "stores/ActivityStore";

export default {
  name: "ActiveOrder",
  props: ["data", "merchants", "order_meta"],
  components: {
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
    ),
    launchNavigation: defineAsyncComponent(() =>
      import("components/launchNavigation.vue")
    ),
    PreparationCircularprogress: defineAsyncComponent(() =>
      import("components/PreparationCircularprogress.vue")
    ),
  },
  setup() {
    const LocationStore = useLocationStore();
    const Activity = useActivityStore();
    return { LocationStore, Activity };
  },
  data() {
    return {
      loading: false,
      center: [],
      markers: {},
      reset: undefined,
    };
  },
  watch: {
    data(newdata, oldata) {
      this.getLocation();
    },
  },
  created() {
    this.getLocation();
  },
  methods: {
    getLocation() {
      if (this.merchants[this.data.merchant_id]) {
        const $merchant = this.merchants[this.data.merchant_id];
        const $order_meta = this.order_meta[this.data.order_id];

        let $icon = "";
        this.center = {
          lat: parseFloat($merchant.latitude),
          lng: parseFloat($merchant.lontitude),
        };
        //LocationStore.coordinates
        this.markers = [
          {
            lat: parseFloat($merchant.latitude),
            lng: parseFloat($merchant.lontitude),
            label: APIinterface.getIcon("merchant"),
            icon: "marker_icon_merchant",
          },
        ];

        if (this.LocationStore.hadData()) {
          console.log("driver data");
          this.markers.push({
            lat: parseFloat(this.LocationStore.coordinates.lat),
            lng: parseFloat(this.LocationStore.coordinates.lng),
            label: APIinterface.getIcon("driver"),
            icon: "marker_icon_rider",
          });
        } else {
          console.log("no driver data");
        }
      }
    },
    changeStatus(reset) {
      this.reset = reset;
      this.changeOrderStatus(this.data.delivery_steps.methods);
      //reset.reset();
    },
    changeOrderStatus(methods) {
      console.debug("changeOrderStatus=>" + methods);
      console.debug(this.data.order_uuid);

      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);

      APIinterface.fetchDataByToken(methods, {
        order_uuid: this.data.order_uuid,
      })
        .then((result) => {
          this.reset.reset();
          this.$emit("afterChangestatus", result.details);
        })
        .catch((error) => {
          console.debug(error);
          this.reset.reset();
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
          this.loading = false;
        });
    },
  },
};
</script>
