<template>
  <q-page class="tagam-page px-4 pb-28 pt-5">
    <q-pull-to-refresh @refresh="refreshDelivery" class="tagam-shell">
      <template v-if="!loading">
        <section class="tagam-hero mb-4 p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="tagam-eyebrow">
                {{ $t("Deliveries") }}
              </div>
              <h1 class="tagam-title mt-1">
                {{ hasOrder ? $t(data.delivery_steps.instructions) : $t("Deliveries") }}
              </h1>
              <p class="tagam-copy mt-2">
                {{ $t("Pull down the page to refresh") }}
              </p>
            </div>
            <div class="rounded-[8px] bg-white/12 px-3 py-2 text-center text-white">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.08em]">{{ $t("Orders") }}</div>
              <div class="text-[18px] font-black">{{ Object.keys(list).length || 0 }}</div>
            </div>
          </div>
        </section>

        <template v-if="hasOrder">
          <div
            v-if="hasManyOrder"
            class="tagam-panel mb-4 p-3"
          >
            <swiper :slidesPerView="3.5" :spaceBetween="10" @swiper="onSwiper">
              <swiper-slide v-for="items in list" :key="items" class="row">
                <q-btn
                  unelevated
                  no-caps
                  size="md"
                  class="rounded-[8px] px-4 font-black"
                  :class="active_order == items.order_id ? 'bg-tagam-night text-white' : 'bg-tagam-cream text-tagam-ink'"
                  @click="setActiveOrder(items.order_id)"
                  >#{{ items.order_id }}</q-btn
                >
              </swiper-slide>
            </swiper>
          </div>

          <div class="tagam-panel overflow-hidden">
            <template
              v-if="
                data.delivery_steps.steps === 2 || data.delivery_steps.steps === 3
              "
            >
              <ActiveOrder
                :data="data"
                :merchants="merchants"
                :order_meta="order_meta"
                @after-changestatus="afterChangestatus"
              >
              </ActiveOrder>
            </template>

            <template v-else-if="data.delivery_steps.steps === 4">
              <OrderPickup
                ref="order_pickup"
                :order_uuid="data.order_uuid"
                :data="data"
                :merchants="merchants"
                :order_meta="order_meta"
                @after-changestatus="afterChangestatus"
              >
              </OrderPickup>
            </template>

            <template
              v-else-if="
                data.delivery_steps.steps === 5 || data.delivery_steps.steps === 6
              "
            >
              <OrderCustomer
                :order_uuid="data.order_uuid"
                :data="data"
                :merchants="merchants"
                :order_meta="order_meta"
                :payment_list="payment_list"
                @after-changestatus="afterChangestatus"
              >
              </OrderCustomer>
            </template>

            <template v-else-if="data.delivery_steps.steps === 7">
              <OrderDropoff
                :order_uuid="data.order_uuid"
                :data="data"
                :merchants="merchants"
                :order_meta="order_meta"
                :payment_list="payment_list"
                @after-changestatus="afterChangestatus"
              >
              </OrderDropoff>
            </template>
          </div>
        </template>
        <template v-else>
          <section class="tagam-panel flex min-h-[45vh] items-center justify-center border-dashed p-7 text-center">
            <div>
              <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-tagam-mint text-2xl text-tagam-leaf">
                <q-icon name="las la-biking" />
              </div>
              <div class="text-[18px] font-black text-tagam-ink">
                {{ $t("You have no pending deliveries") }}
              </div>
              <p class="mt-2 text-[13px] font-semibold text-tagam-muted">
                {{ $t("Make sure your internet is always connected") }}
              </p>
            </div>
          </section>
        </template>
      </template>
      <template v-else>
        <div class="flex min-h-[45vh] items-center justify-center">
          <q-spinner color="green-8" size="2.2em" />
        </div>
      </template>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "DeliveriesPage",
  components: {
    Swiper,
    SwiperSlide,
    ActiveOrder: defineAsyncComponent(() =>
      import("components/ActiveOrder.vue")
    ),
    OrderPickup: defineAsyncComponent(() =>
      import("components/OrderPickup.vue")
    ),
    OrderCustomer: defineAsyncComponent(() =>
      import("components/OrderCustomer.vue")
    ),
    OrderDropoff: defineAsyncComponent(() =>
      import("components/OrderDropoff.vue")
    ),
  },
  data() {
    return {
      loading: false,
      list: [],
      data: [],
      merchants: [],
      order_meta: [],
      payment_list: [],
      active_order: undefined,
    };
  },
  computed: {
    hasOrder() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasManyOrder() {
      if (Object.keys(this.list).length > 1) {
        return true;
      }
      return false;
    },
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  mounted() {
    this.Activity.setTitle(this.$t("Deliveries"));
    this.getDelivery();
  },
  watch: {
    data(newval, oldval) {
      if (newval.delivery_steps) {
        if (newval.delivery_steps.instructions) {
          this.Activity.setTitle(this.$t(newval.delivery_steps.instructions));
        }
      }
    },
  },
  methods: {
    getDelivery() {
      APIinterface.showLoadingBox("", this.$q);
      this.loading = true;
      const date_now = APIinterface.getDateNow();
      APIinterface.fetchDataByToken("getorderlist", {
        date: date_now,
      })
        .then((result) => {
          this.list = result.details.data;

          const $list_keys = Object.keys(this.list);

          this.data = this.list[$list_keys[0]];
          this.active_order = this.data.order_id;

          // CHECK IF STEPS = 1 MEANS NEED TO ACCEPT
          if (this.data.delivery_steps.steps == 1) {
            this.$router.push({
              path: "/order/new",
              query: { order_uuid: this.data.order_uuid },
            });
          }

          //this.Activity.setTitle(this.data.delivery_steps.instructions);
          this.merchants = result.details.merchant;
          this.order_meta = result.details.order_meta;
          this.payment_list = result.details.payment_list;
        })
        .catch((error) => {
          this.Activity.setTitle(this.$t("Deliveries"));
          this.data = [];
          this.active_order = undefined;
          this.merchants = [];
          this.order_meta = [];
          this.payment_list = [];
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
          this.loading = false;
        });
    },
    afterChangestatus(data) {
      console.debug("afterChangestatus=>");
      console.debug(data);
      if (Object.keys(data).length > 0) {
        const $steps = data.delivery_steps.steps;
        console.debug($steps);
        this.data.delivery_steps = data.delivery_steps;
        if (APIinterface.empty($steps)) {
          this.getDelivery();
        } else {
          this.Activity.setTitle(this.$t(this.data.delivery_steps.instructions));
        }
      } else {
        this.getDelivery();
      }
    },
    setActiveOrder(data) {
      this.active_order = data;
      if (this.list[data]) {
        this.data = this.list[data];
        if (this.data.delivery_steps.steps === 1) {
          this.$router.push({
            path: "/order/new",
            query: { order_uuid: this.data.order_uuid },
          });
        }
      }
    },
    refreshDelivery(done) {
      this.loading = true;
      const date_now = APIinterface.getDateNow();
      APIinterface.fetchDataByToken("getorderlist", {
        date: date_now,
      })
        .then((result) => {
          this.list = result.details.data;

          const $list_keys = Object.keys(this.list);

          this.data = this.list[$list_keys[0]];
          this.active_order = this.data.order_id;

          // CHECK IF STEPS = 1 MEANS NEED TO ACCEPT
          if (this.data.delivery_steps.steps == 1) {
            this.$router.push({
              path: "/order/new",
              query: { order_uuid: this.data.order_uuid },
            });
          }

          //this.Activity.setTitle("Go to merchant");
          this.merchants = result.details.merchant;
          this.order_meta = result.details.order_meta;
          this.payment_list = result.details.payment_list;
        })
        .catch((error) => {
          console.debug(error);
          this.data = [];
          this.active_order = undefined;
          this.merchants = [];
          this.order_meta = [];
          this.payment_list = [];
        })
        .then((data) => {
          done();
          this.loading = false;
        });
    },
    isActive(order_id) {
      if (this.active_order == order_id) {
        return "primary";
      }
      return "grey-5";
    },
  },
};
</script>
