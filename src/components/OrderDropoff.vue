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
            <p class="tagam-eyebrow no-margin">
              {{ $t("Customer Details") }}
            </p>
            <div class="text-sm font-semibold text-tagam-ink">#{{ data.order_id }}</div>
          </div>
          <div class="tagam-chip">
            {{ $t("Drop-off") }}
          </div>
        </div>
        <div class="row items-center q-col-gutter-md">
          <div class="col text-base font-black text-tagam-ink">
            {{ data.full_name }}
          </div>
          <div class="col-5 text-right">
            <div class="flex items-center justify-end">
              <q-btn
                round
                color="amber-7"
                icon="las la-exclamation-triangle"
                size="sm"
                unelevated
                class="q-mr-xs"
                @click="showHelp"
              />
              <q-btn
                round
                color="amber-6"
                icon="las la-map"
                size="sm"
                unelevated
                class="q-mr-xs"
                to="/home/maps"
              />
              <template v-if="order_meta[data.order_id]">
                <q-btn
                  :href="'tel:' + order_meta[data.order_id].contact_number"
                  round
                  color="green-6"
                  icon="las la-phone-volume"
                  size="sm"
                  unelevated
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
        <p class="tagam-eyebrow no-margin">{{ $t("Order Details") }}</p>
        <div class="q-mt-xs text-sm font-bold text-slate-950">{{ $t("Order#") }}{{ data.order_id }}</div>
        <div class="text-sm font-medium leading-normal text-slate-600">
          <template v-if="order_meta[data.order_id]">
            <template v-if="order_meta[data.order_id].address1">{{
              order_meta[data.order_id].address1
            }}</template>
          </template>
          {{ data.address }}
        </div>
        <div class="q-pa-sm"></div>

        <!-- order details -->
        <OrderDetails :order_uuid="order_uuid" />
        <!-- end order details -->
      </q-card-section>
    </q-card>

    <q-card class="tagam-panel no-shadow q-mt-md">
      <q-card-section class="q-pa-md">
        <p class="tagam-eyebrow no-margin">{{ $t("Payment") }}</p>
        <div class="row items-center">
          <div class="col text-sm font-semibold text-slate-900">{{ paymentLabel }}</div>
          <div
            v-if="data.payment_code == 'cod'"
            class="col text-right text-base font-bold text-slate-950"
          >
            {{ data.amount_due_raw > 0 ? data.amount_due : data.total }}
          </div>
        </div>

        <div v-if="data.payment_code == 'cod'" class="row items-center q-mt-xs">
          <div class="col text-sm text-slate-600">{{ $t("Payment change") }}</div>
          <div class="col text-right text-sm font-bold text-slate-900">
            {{ data?.payment_change }}
          </div>
        </div>

        <q-space class="q-pa-lg"></q-space>
        <q-space class="q-pa-md"></q-space>
        <q-btn
          :label="$t('Mark as delivered')"
          @click="confirm_dialog = !confirm_dialog"
          unelevated
          class="tagam-action fit text-weight-bold"
          size="lg"
          no-caps
        ></q-btn>
      </q-card-section>
    </q-card>
  </div>
  <!-- white -->

  <q-dialog v-model="confirm_dialog" position="bottom">
    <q-card class="rounded-t-xl">
      <q-card-section class="q-pa-lg">
        <div class="text-center">
          <div class="text-base font-bold text-slate-900">
            {{ $t("Do you confirm order#") }}{{ data.order_id }}?
          </div>
        </div>
      </q-card-section>
      <q-card-actions class="q-gutter-md q-pa-lg pt-0">
        <q-btn
          color="primary"
          no-caps
          :label="$t('Confirm delivery')"
          unelevated
          class="fit rounded-md text-weight-bold"
          size="lg"
          @click="confirm_dialog_drop = true"
        />
        <q-btn
          color="grey-7"
          no-caps
          :label="$t('Cancel')"
          unelevated
          flat
          class="fit rounded-md text-weight-bold"
          size="lg"
          @click="confirm_dialog = !confirm_dialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="confirm_dialog_drop"
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
    @show="hideDialog"
  >
    <q-card class="tagam-page">
      <q-bar class="bg-white q-pa-md shadow-sm" style="height: auto">
        <div class="col text-center">
          <div class="text-base font-bold text-slate-900">{{ $t("Confirm delivery") }}</div>
          <div class="text-xs font-semibold text-slate-500">{{ $t("Order#") }}{{ data.order_id }}</div>
        </div>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t("Close") }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-space
        class="q-pa-xs"
        :class="{
          '': $q.dark.mode,
          'bg-slate-50': !$q.dark.mode,
        }"
      ></q-space>
      <q-card-section class="q-pa-md">
        <template v-if="isCash">
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div class="row items-center">
            <div class="col text-base font-bold text-slate-900">
              {{ $t("Total Payment") }}
            </div>
            <div class="col text-right"></div>
          </div>
          <div class="q-mt-xs text-2xl font-bold text-slate-950">
            {{ data.amount_due_raw > 0 ? data.amount_due : data.total }}
          </div>
          <p class="q-mb-none q-mt-xs text-sm text-slate-600">{{ $t("Collect cash from customer") }}</p>
          </div>
        </template>

        <div
          class="q-mt-md rounded-lg border border-slate-200 bg-white p-4"
          :class="{ 'border-top': isCash, 'border-bottom': !isCash }"
        >
          <div
            class="row items-center"
            v-if="Activity.settings_data.add_proof_photo"
          >
            <div class="col">
              <div class="text-base font-bold text-slate-900">
                {{ $t("Proof of Drop-off") }}
              </div>
              <p class="q-mb-none q-mt-xs text-sm leading-normal text-slate-500">
                {{ $t("Add a photo as proof of Drop-off") }}
              </p>
            </div>
            <div class="col text-right">
              <div>
                <template v-if="has_photo">
                  <q-btn
                    flat
                    :label="$t('Delete')"
                    color="red-6"
                    no-caps
                    class="q-pr-none font17"
                    @click="clearPhoto"
                  />
                </template>
                <template v-else>
                  <q-btn
                    :label="$t('Add photo')"
                    flat
                    color="amber-7"
                    no-caps
                    class="q-pl-none q-pr-none"
                    @click="takePhoto"
                  ></q-btn>
                </template>
              </div>

              <template v-if="hasPhoto">
                <q-img
                  :src="featured_url"
                  spinner-color="primary"
                  spinner-size="sm"
                  fit="cover"
                  style="height: 50px; max-width: 50px"
                  class="radius8 border border-slate-200"
                />
              </template>
              <template v-else-if="hasPhotoData">
                <q-img
                  :src="photo_data.path"
                  spinner-color="primary"
                  spinner-size="sm"
                  fit="cover"
                  style="height: 50px; max-width: 50px"
                  class="radius8 border border-slate-200"
                />
              </template>
            </div>
          </div>
        </div>
        <!-- border-top -->

        <template v-if="upload_enabled">
          <q-space class="q-pa-xs"></q-space>
          <UploaderFile
            ref="uploader_file"
            path="upload/order_proof"
            @after-uploadfile="afterUploadfile"
          ></UploaderFile>
        </template>

        <div v-if="Activity.settings_data.enabled_delivery_otp" class="q-mt-md rounded-lg border border-slate-200 bg-white p-4">
          <div class="q-mb-xs text-base font-bold text-slate-900">
            {{ $t("Enter order OTP code") }}
          </div>
          <q-input
            v-model="otp_code"
            type="number"
            :label="$t('OTP Code')"
            outlined
            color="amber-7"
            mask="#######"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>
        </div>
        <!-- OPT  -->
      </q-card-section>
      <q-card-actions class="fixed-bottom bg-white q-pa-md shadow-up">
        <q-btn
          :label="$t('Confirm delivery')"
          :loading="loading"
          :disabled="!hasAddedProof"
          @click="changeOrderStatus('orderdelivered')"
          unelevated
          class="tagam-action fit text-weight-bold"
          size="lg"
          no-caps
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <OrderHelp
    ref="order_help"
    list_type="orderhelplist"
    :title="$t('Report an issue')"
    @after-submit="afterSubmit"
  >
  </OrderHelp>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import AppCamera from "src/api/AppCamera";
import { defineAsyncComponent } from "vue";
import { useActivityStore } from "stores/ActivityStore";
import { useDriverappStore } from "stores/DriverappStore";

export default {
  name: "OrderDropoff",
  props: ["order_uuid", "merchants", "data", "order_meta", "payment_list"],
  components: {
    OrderDetails: defineAsyncComponent(() =>
      import("components/OrderDetails.vue")
    ),
    OrderHelp: defineAsyncComponent(() => import("components/OrderHelp.vue")),
    UploaderFile: defineAsyncComponent(() =>
      import("components/UploaderFile.vue")
    ),
  },
  setup() {
    const Activity = useActivityStore();
    const DriverappStore = useDriverappStore();
    return { Activity, DriverappStore };
  },
  data() {
    return {
      loading: false,
      confirm_dialog: false,
      confirm_dialog_drop: false,
      photo_data: [],
      upload_enabled: false,
      has_photo: false,
      upload_path: "",
      featured_filename: "",
      featured_url: "",
      otp_code: "",
    };
  },
  mounted() {},
  computed: {
    hasAddedProof() {
      if (this.Activity.settings_data.add_proof_photo) {
        if (this.has_photo) {
          return true;
        }
      } else {
        return true;
      }
      return false;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
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
    hasPhoto() {
      if (!APIinterface.empty(this.featured_url)) {
        return true;
      }
      return false;
    },
    hasPhotoData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    hideDialog() {
      this.confirm_dialog = false;
    },
    showHelp() {
      this.$refs.order_help.show();
    },
    changeOrderStatus(methods) {
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByToken(methods, {
        order_uuid: this.order_uuid,
        featured_filename: this.featured_filename,
        upload_path: this.upload_path,
        file_data: this.hadData() ? this.photo_data.data : "",
        image_type: this.hadData() ? this.photo_data.format : "",
        otp_code: this.otp_code,
      })
        .then((result) => {
          this.confirm_dialog_drop = false;
          this.DriverappStore.getTotalTask();
          this.$emit("afterChangestatus", result.details);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
          this.loading = false;
        });
    },
    takePhoto() {
      if (this.$q.capacitor) {
        AppCamera.isCameraEnabled()
          .then((data) => {
            AppCamera.isFileAccessEnabled()
              .then((data) => {
                AppCamera.getPhoto(1)
                  .then((data) => {
                    this.photo_data = data;
                    this.has_photo = true;
                  })
                  .catch((error) => {
                    this.photo_data = [];
                  });
                //
              })
              .catch((error) => {
                APIinterface.notify("dark", error, "error", this.$q);
              });
            //
          })
          .catch((error) => {
            APIinterface.notify("dark", error, "error", this.$q);
          });
      } else {
        this.upload_enabled = !this.upload_enabled;
      }
    },
    afterSubmit(data) {
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByToken("deliveryfailed", {
        order_uuid: this.order_uuid,
        reason: data,
      })
        .then((result) => {
          this.DriverappStore.getTotalTask();
          this.$refs.order_help.hide();
          this.$emit("afterChangestatus", []);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
          this.loading = false;
        });
    },
    afterUploadfile(data) {
      this.featured_filename = data.filename;
      this.featured_url = data.url_image;
      this.upload_path = data.upload_path;
      this.has_photo = true;
    },
    clearPhoto() {
      this.upload_enabled = false;
      this.has_photo = false;
      this.featured_filename = "";
      this.featured_url = "";
      this.upload_path = "";
      this.photo_data = [];
    },
    hadData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
    //
  },
};
</script>
