<template>
  <div
    class="tagam-page px-4 pb-28 pt-3"
    :class="{
      'bg-mydark ': $q.dark.mode,
      '': !$q.dark.mode,
    }"
  >
    <q-card class="tagam-panel no-shadow">
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div>
            <div class="tagam-eyebrow">
              {{ $t("Customer Details") }}
            </div>
            <div class="text-sm font-semibold text-tagam-ink">#{{ data.order_id }}</div>
          </div>
          <div class="tagam-chip">
            {{ $t("Destination") }}
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <p class="no-margin text-base font-black text-tagam-ink">{{ data.full_name }}</p>
            <p class="no-margin text-xs leading-normal text-slate-500">
              <template v-if="order_meta[data.order_id]">
                <template v-if="order_meta[data.order_id].address1">{{
                  order_meta[data.order_id].address1
                }}</template>
              </template>
              {{ data.address }}
            </p>
            <p v-if="order_meta[data.order_id]" class="q-mt-xs no-margin text-xs font-semibold text-slate-700">
              {{ order_meta[data.order_id].address_label }}
            </p>
          </div>
          <div>
            <div class="grid grid-cols-3 gap-2">
              <q-btn
                no-caps
                color="amber-6"
                icon="las la-map"
                :label="$t('Map')"
                size="13px"
                unelevated
                class="h-11 rounded-[8px] font-black"
                to="/home/maps"
              />

              <q-btn
                no-caps
                color="green-6"
                icon="eva-message-circle-outline"
                :label="$t('Chat')"
                size="13px"
                unelevated
                class="h-11 rounded-[8px] font-black"
                @click="getConversation(data)"
                :loading="loading_chat"
              />
              <template v-if="order_meta[data.order_id]">
                <q-btn
                  :href="'tel:' + order_meta[data.order_id].contact_number"
                  no-caps
                  color="green-6"
                  icon="eva-phone-call-outline"
                  :label="$t('Call')"
                  size="13px"
                  unelevated
                  class="h-11 rounded-[8px] font-black"
                />
              </template>
            </div>
          </div>
        </div>
        <!-- row -->
      </q-card-section>
    </q-card>

    <q-card
      class="tagam-panel no-shadow q-mt-md"
      :class="{
        '': $q.dark.mode,
        'card-bordered': !$q.dark.mode,
      }"
    >
      <q-card-section class="q-pa-md">
        <p class="tagam-eyebrow no-margin">{{ $t("Payment") }}</p>
        <div class="row items-center">
          <div class="col text-sm font-semibold text-slate-900">{{ paymentLabel }}</div>
          <div v-if="isCash" class="col text-right text-base font-bold text-slate-950">
            {{ data.amount_due_raw > 0 ? data.amount_due : data.total }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="tagam-panel no-shadow q-mt-md">
      <q-card-section v-if="order_meta[data.order_id]" class="q-pa-md">
        <p class="tagam-eyebrow no-margin">{{ $t("Drop-off instructions") }}</p>
        <p class="q-mt-sm no-margin text-sm text-slate-700">
          <span class="text-weight-bold"
            >{{ $t("Aparment, suite or floor") }} :</span
          >
          {{ order_meta[data.order_id].location_name }}
        </p>
        <p class="no-margin text-sm text-slate-700">
          <span class="text-weight-bold">{{ $t("Delivery options") }} :</span>
          {{ order_meta[data.order_id].delivery_options }}
        </p>
        <p class="no-margin text-sm text-slate-700">
          <span class="text-weight-bold"
            >{{ $t("Delivery instructions") }} :</span
          >
          {{ order_meta[data.order_id].delivery_instructions }}
        </p>
      </q-card-section>
    </q-card>

    <q-card
      class="tagam-panel no-shadow q-mt-md"
      :class="{
        '': $q.dark.mode,
        'card-bordered': !$q.dark.mode,
      }"
    >
      <q-card-section class="q-pa-md text-center">
        <p class="no-margin q-mb-sm text-sm font-black text-tagam-ink">{{ $t("Estimated Arrival") }}</p>
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
          >
          </MapComponents>
        </div>
        <!-- map -->

        <q-space class="q-pa-sm"></q-space>

        <q-list bordered separator class="radius8 overflow-hidden">
          <q-slide-item
            @left="changeStatus"
            left-color="light-green"
            class="radius8"
          >
            <template v-slot:left>
              <q-spinner color="amber-7" size="2em" />
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
      </q-card-section>
    </q-card>
  </div>
  <!-- white -->
</template>

<script>
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { defineAsyncComponent } from "vue";
import jwtDecode from "jwt-decode";
import APIinterface from "src/api/APIinterface";
import { useLocationStore } from "stores/LocationStore";
import { useActivityStore } from "stores/ActivityStore";
import auth from "src/api/auth";

export default {
  name: "OrderCustomer",
  props: ["order_uuid", "merchants", "data", "order_meta", "payment_list"],
  components: {
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
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
      loading_chat: false,
      conversation_id: null,
      user_data: null,
    };
  },
  watch: {
    data(newdata, oldata) {
      this.getCoordinates();
    },
  },
  mounted() {
    this.user_data = auth.getUser();
    this.getCoordinates();
  },
  computed: {
    paymentLabel() {
      const payment_type = this.payment_list[this.data.payment_code]
        ? this.payment_list[this.data.payment_code]
        : 0;
      return payment_type == 1
        ? this.$t("Paid online")
        : this.$t("Collect Cash");
    },
    isCash() {
      const payment_type = this.payment_list[this.data.payment_code]
        ? this.payment_list[this.data.payment_code]
        : 0;
      return payment_type == 1 ? false : true;
    },
  },
  methods: {
    getCoordinates() {
      console.debug("getCoordinates");
      const $location = this.order_meta[this.data.order_id]
        ? this.order_meta[this.data.order_id]
        : false;

      if ($location) {
        this.center = {
          lat: parseFloat($location.latitude),
          lng: parseFloat($location.longitude),
        };
        this.markers = [
          {
            lat: parseFloat($location.latitude),
            lng: parseFloat($location.longitude),
            label: APIinterface.getIcon("customer"),
            icon: "marker_icon_destination",
          },
        ];
        if (this.LocationStore.hadData()) {
          this.markers.push({
            lat: parseFloat(this.LocationStore.coordinates.lat),
            lng: parseFloat(this.LocationStore.coordinates.lng),
            label: APIinterface.getIcon("driver"),
            icon: "marker_icon_rider",
          });
        }
      }
    },
    changeStatus(reset) {
      this.reset = reset;
      this.changeOrderStatus(this.data.delivery_steps.methods);
    },
    changeOrderStatus(methods) {
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByToken(methods, {
        order_uuid: this.order_uuid,
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
    async getConversation() {
      this.conversation_id = "ORD-" + this.data.order_uuid;
      console.log("this.conversation_id", this.conversation_id);
      this.conversation_id = "ORD-" + this.data.order_uuid;
      this.loading_chat = true;
      const docRef = doc(
        firebaseDb,
        firebaseCollectionEnum.chats,
        this.conversation_id
      );
      const docSnap = await getDoc(docRef);
      this.loading_chat = false;
      if (docSnap.exists()) {
        this.$router.push({
          path: "/chat",
          query: { conversation_id: this.conversation_id },
        });
      } else {
        this.createConversation();
      }
    },
    async createConversation() {
      const driver_uuid = this.user_data.driver_uuid;
      const user_uuid = this.data.client_uuid;

      const from_info = {
        client_uuid: this.user_data.driver_uuid,
        first_name: this.user_data.first_name,
        last_name: this.user_data.last_name,
        photo: this.user_data.avatar,
        user_type: "driver",
      };
      const to_info = {
        client_uuid: this.data.client_uuid,
        first_name: this.data.first_name,
        last_name: this.data.last_name,
        photo: this.data.avatar,
        user_type: "customer",
      };

      let data = {
        lastUpdated: serverTimestamp(),
        dateCreated: serverTimestamp(),
        orderID: this.data.order_id,
        orderUuid: this.data.order_uuid,
        participants: [driver_uuid, user_uuid],
        isTyping: {
          [`${driver_uuid}`]: false,
          [`${user_uuid}`]: false,
        },
        from_info: from_info,
        to_info: to_info,
      };

      this.loading_chat = true;
      await setDoc(
        doc(firebaseDb, firebaseCollectionEnum.chats, this.conversation_id),
        data
      );

      this.$router.push({
        path: "/chat",
        query: { conversation_id: this.conversation_id },
      });
    },
  },
};
</script>
