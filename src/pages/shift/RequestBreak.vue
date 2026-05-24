<template>
  <q-header
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-tagam-ink shadow-sm': !$q.dark.mode,
    }"
  >
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="las la-angle-left"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-toolbar-title class="text-[18px] font-black">{{
        $t("Request Break")
      }}</q-toolbar-title>
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <q-form @submit="onSubmit" class="mx-auto max-w-4xl rounded-[8px] border border-tagam-line bg-white p-5 shadow-tagam-card">
      <h6 class="m-0 text-[20px] font-black">
        {{ $t("Break duration") }}
      </h6>
      <p class="m-0 mt-1 text-sm font-semibold text-tagam-muted">
        {{ $t("Select your duration for break") }}
      </p>
      <q-space class="q-pa-sm"></q-space>
      <q-select
        v-model="duration"
        :options="Activity.break_duration"
        :label="$t('Select duration')"
        behavior="dialog"
        input-debounce="700"
        outlined
        color="amber-7"
        lazy-rules
        :rules="[myRule]"
        map-options
        emit-value
      />

      <q-footer
        class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur"
        :class="{
          'bg-mydark ': $q.dark.mode,
          'bg-white ': !$q.dark.mode,
        }"
      >
        <q-btn
          type="submit"
          :label="$t('Submit')"
          unelevated
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          size="lg"
          no-caps
          :loading="loading"
        />
      </q-footer>
    </q-form>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useActivityStore } from "stores/ActivityStore";
import { useScheduleStore } from "stores/ScheduleStore";

export default {
  name: "RequestBreak",
  data() {
    return {
      loading: false,
      duration: "",
      schedule_uuid: "",
    };
  },
  created() {
    this.schedule_uuid = this.$route.query.schedule_uuid;
  },
  setup() {
    const Activity = useActivityStore();
    const Schedule = useScheduleStore();
    return { Activity, Schedule };
  },
  methods: {
    myRule(val) {
      if (APIinterface.empty(val)) {
        return "Duration is required";
      }
    },
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "requestBreak",
        "schedule_uuid=" + this.schedule_uuid + "&duration=" + this.duration
      )
        .then((data) => {
          this.Schedule.gettShift();
          APIinterface.notify(
            this.$q.dark.mode ? "grey600" : "light-green",
            data.msg,
            "check_circle",
            this.$q
          );
          this.$router.replace("/home");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
