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
              {{ $t("Restaurant Details") }}
            </div>
            <div class="text-sm font-semibold text-tagam-ink">
              {{ $t("Order#") }}{{ data.order_id }}
            </div>
          </div>
          <div class="tagam-chip">
            {{ $t("Pickup") }}
          </div>
        </div>
        <div class="row items-center q-col-gutter-md">
          <div
            v-if="merchants[data.merchant_id]"
            class="col text-base font-black leading-tight text-tagam-ink"
          >
            {{ merchants[data.merchant_id].restaurant_name }}
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
                class="q-mr-sm"
                to="/home/maps"
              />
              <q-btn
                :href="'tel:' + merchants[data.merchant_id].contact_phone"
                round
                color="green-6"
                icon="las la-phone-volume"
                size="sm"
                unelevated
              />
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
        <div class="text-sm font-black text-tagam-ink">
          {{ $t("Restaurant time preparation") }}
        </div>

        <div class="q-mt-md text-center">
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

    <q-card
      class="tagam-panel no-shadow q-mt-md"
      :class="{
        '': $q.dark.mode,
        'card-bordered': !$q.dark.mode,
      }"
    >
      <q-card-section class="q-pa-md">
        <div class="text-sm font-black text-tagam-ink">{{ $t("Order Details") }}</div>
        <div class="q-mt-xs text-xs font-semibold text-slate-500">
          {{ $t("Order#") }}{{ data.order_id }}
        </div>
        <div class="text-sm font-semibold text-slate-800">{{ data.full_name }}</div>
        <div class="q-pa-sm"></div>

        <!-- order details -->
        <OrderDetails :order_uuid="order_uuid" />
        <!-- end order details -->
      </q-card-section>

      <q-card-actions class="q-pa-md pt-0">
        <q-btn
          :label="$t(data.delivery_steps.label)"
          @click="confirm_dialog = !confirm_dialog"
          :loading="loading"
          unelevated
          no-caps
          size="lg"
          class="tagam-action fit text-weight-bold"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </div>
  <!-- white -->

  <q-dialog v-model="confirm_dialog" position="bottom">
    <q-card class="rounded-t-xl">
      <q-card-section class="q-pa-lg">
        <div class="text-center">
          <div class="text-base font-bold text-slate-900">
            {{ $t("Do you confirm order#") }}{{ data.order_id }}
            {{ $t("Pickup") }}?
          </div>
        </div>
      </q-card-section>
      <q-card-actions class="q-gutter-md q-pa-lg pt-0">
        <q-btn
          no-caps
          :label="$t('Confirm Pickup')"
          unelevated
          class="tagam-action fit text-weight-bold"
          size="lg"
          @click="changeOrderStatus(data.delivery_steps.methods)"
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

  <OrderHelp
    ref="order_help"
    list_type="orderhelppickup"
    :title="$t('Report an issue')"
    @after-submit="afterSubmit"
  >
  </OrderHelp>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "OrderPickup",
  props: ["order_uuid", "merchants", "data", "order_meta"],
  components: {
    OrderDetails: defineAsyncComponent(() =>
      import("components/OrderDetails.vue")
    ),
    OrderHelp: defineAsyncComponent(() => import("components/OrderHelp.vue")),
    PreparationCircularprogress: defineAsyncComponent(() =>
      import("components/PreparationCircularprogress.vue")
    ),
  },
  data() {
    return {
      expanded: false,
      loading: false,
      confirm_dialog: false,
    };
  },
  methods: {
    showHelp() {
      this.$refs.order_help.show();
    },
    changeOrderStatus(methods) {
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);

      APIinterface.fetchDataByToken(methods, {
        order_uuid: this.order_uuid,
      })
        .then((result) => {
          this.$emit("afterChangestatus", result.details);
        })
        .catch((error) => {
          console.debug(error);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
          this.loading = false;
        });
    },
    afterSubmit() {
      console.debug("afterSubmit");
    },
  },
};
</script>
