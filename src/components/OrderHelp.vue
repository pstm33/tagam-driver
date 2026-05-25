<template>
  <q-dialog
    v-model="dialog"
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-tagam-canvas text-tagam-ink">
      <q-bar class="bg-white p-3 shadow-sm" style="height: auto">
        <div class="col text-center">
          <div class="text-[17px] font-black">{{ title }}</div>
        </div>

        <template v-if="reason == 'others'">
          <q-btn dense flat icon="las la-undo" @click="reason = ''"> </q-btn>
        </template>
        <template v-else>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{
              $t("Close")
            }}</q-tooltip>
          </q-btn>
        </template>
      </q-bar>
      <q-card-section class="p-4">
        <div v-if="reason == 'others'">
          <p class="font-bold text-tagam-muted">{{ $t("Please specify the reason") }}</p>

          <q-input
            v-model="reason_others"
            autogrow
            dense
            stack-label
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>
        </div>

        <q-list v-else separator class="overflow-hidden rounded-[8px] border border-tagam-line bg-white">
          <q-item-label header class="text-[12px] font-black uppercase tracking-[0.1em] text-tagam-muted"
            >{{ $t("Need help") }}?</q-item-label
          >
          <q-item v-ripple clickable>
            <q-item-section avatar>
              <q-icon name="las la-phone" size="sm" color="blue" />
            </q-item-section>
            <q-item-section avatar>{{ $t("Call Support") }} </q-item-section>
          </q-item>

          <q-item v-ripple clickable>
            <q-item-section avatar>
              <q-icon name="las la-comment" size="sm" color="cyan" />
            </q-item-section>
            <q-item-section avatar>{{ $t("Chat Support") }} </q-item-section>
          </q-item>

          <q-item-label header class="text-[12px] font-black uppercase tracking-[0.1em] text-tagam-muted"
            >{{ $t("What is the issue") }}?</q-item-label
          >

          <q-item v-for="item in data" :key="item" tag="label" v-ripple>
            <q-item-section avatar class="hidden">
              <q-radio v-model="reason" :val="item" color="primary" dense />
            </q-item-section>
            <q-item-section>
              <q-item-label
                class="font-bold text-tagam-ink"
                :class="{ 'rounded-[8px] bg-tagam-cream px-2 py-1': reason == item }"
              >{{
                $t(item)
              }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="reason == item">
              <q-icon name="check" color="amber-8" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar class="hidden">
              <q-radio v-model="reason" val="others" color="primary" dense />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("Others") }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-space class="q-pa-lg"> </q-space>
      </q-card-section>
      <q-card-actions class="fixed-bottom bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <q-btn
          :label="$t('Submit')"
          unelevated
          class="h-13 w-full rounded-[8px] bg-tagam-leaf text-[17px] font-black text-white"
          no-caps
          :disable="!hasData"
          @click="submit"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "OrderHelp",
  props: ["list_type", "title"],
  data() {
    return {
      loading: false,
      dialog: false,
      data: [],
      reason: "",
      reason_others: "",
    };
  },
  created() {
    this.getList();
  },
  computed: {
    hasData() {
      if (Object.keys(this.reason).length > 0) {
        if (this.reason == "others") {
          if (APIinterface.empty(this.reason_others)) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
  },
  methods: {
    show() {
      this.dialog = true;
      this.reason = "";
      this.reason_others = "";
    },
    hide() {
      this.dialog = false;
      this.reason = "";
      this.reason_others = "";
    },
    getList() {
      APIinterface.fetchData(this.list_type, "")
        .then((result) => {
          this.data = result.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {});
    },
    submit() {
      let data = this.reason == "others" ? this.reason_others : this.reason;
      this.$emit("afterSubmit", data);
    },
  },
};
</script>
