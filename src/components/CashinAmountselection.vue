<template>
  <q-dialog
    v-model="dialog"
    position="standard"
    @before-show="beforeShow"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="w-full max-w-[460px] rounded-[8px] bg-white shadow-xl">
      <q-toolbar class="px-4 pt-3 text-tagam-ink" dense>
        <q-toolbar-title
          class="text-[18px] font-black"
        >
          {{ $t("Add to your balance") }}
        </q-toolbar-title>
        <q-btn
          @click="dialog = !true"
          flat
          round
          unelevated
          text-color="grey-7"
          icon="las la-times"
          dense
          no-caps
          size="md"
        />
      </q-toolbar>
      <q-form @submit="onSubmit">
        <q-card-section class="px-5 pb-5 pt-2">
          <p class="mb-4 text-[13px] font-semibold text-tagam-muted">
            {{ $t("how much do you want to add to your account") }}?
          </p>

          <q-btn-toggle
            v-model="amount"
            unelevated
            toggle-color="amber-6"
            toggle-text-color="black"
            no-caps
            :options="data"
            class="mb-4 flex flex-wrap gap-2"
          />
          <q-input
            v-model="amount"
            type="number"
            :label="$t('Enter top up amount')"
            outlined
            color="amber-7"
            lazy-rules
            step="any"
            :rules="[
              (val) =>
                (val !== null && val !== '') ||
                this.$t('Please enter  valid amount'),
            ]"
          >
          </q-input>

          <q-card-actions class="row items-center gap-3 px-0 pb-0 pt-3">
            <q-btn
              :label="$t('Cancel')"
              outline
              color="grey-7"
              text-color="dark"
              no-caps
              class="col rounded-[8px]"
              @click="dialog = false"
            />
            <q-btn
              type="submit"
              :label="$t('Continue')"
              color="amber-6"
              text-color="black"
              no-caps
              class="col rounded-[8px] font-black"
              unelevated
            />
          </q-card-actions>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "CashinAmountselection",
  data() {
    return {
      dialog: false,
      data: [],
      loading: false,
      amount: 10,
    };
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.getCashDomination();
  },
  methods: {
    getCashDomination(done) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getCashDomination")
        .then((data) => {
          this.data = data.details.data;
          this.Activity.money_config = data.details.money_config;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      if (parseFloat(this.amount) > 0) {
        this.$router.push({
          path: "/account/cashin",
          query: { amount: this.amount },
        });
      }
    },
  },
};
</script>
