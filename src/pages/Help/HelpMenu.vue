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
        $t("Help")
      }}</q-toolbar-title>
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-page
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-tagam-canvas text-tagam-ink': !$q.dark.mode,
    }"
    class="px-4 pt-5"
  >
    <q-list class="mx-auto max-w-4xl">
      <q-item clickable @click="notice" class="mb-3 rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
        <q-item-section avatar>
          <q-avatar class="bg-amber-50 text-amber-700" icon="las la-headset" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="font-black">{{ $t("Chat Support") }}</q-item-label>
          <q-item-label caption class="font-semibold">Support channel</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="grey-6" />
        </q-item-section>
      </q-item>
      <template v-if="Schedule.hasData">
        <q-item @click="confirmEndShift" clickable class="mb-3 rounded-[8px] border border-tagam-line bg-white shadow-tagam-card">
          <q-item-section avatar>
            <q-avatar class="bg-red-50 text-red-600" icon="las la-clock" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="font-black">{{ $t("End Shift") }}</q-item-label>
            <q-item-label caption class="font-semibold">Finish active schedule</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-6" />
          </q-item-section>
        </q-item>
      </template>
    </q-list>

    <ConfirmDialog
      ref="confirm_dialog"
      :data="data_dialog"
      @after-confirm="afterConfirm"
    ></ConfirmDialog>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useScheduleStore } from "stores/ScheduleStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "HelpMenu",
  components: {
    ConfirmDialog: defineAsyncComponent(() =>
      import("components/ConfirmDialog.vue")
    ),
  },
  data() {
    return {
      data_dialog: {
        title: "Confirmation",
        subtitle: "Are you sure you want to end your shift?",
        cancel: "Cancel",
        confirm: "Yes",
      },
    };
  },
  setup() {
    const Schedule = useScheduleStore();
    return { Schedule };
  },
  methods: {
    confirmEndShift() {
      this.$refs.confirm_dialog.dialog = true;
    },
    afterConfirm() {
      this.$refs.confirm_dialog.dialog = false;
      this.endShift(this.Schedule.data[0].schedule_uuid);
    },
    endShift(schedule_uuid) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.endShift({
        schedule_uuid: schedule_uuid,
      })
        .then((data) => {
          this.Schedule.gettShift();
          this.$router.push("/home");
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    notice() {
      APIinterface.showAlert(
        "Chat",
        "Chat support available in future updates",
        this.$q
      );
    },
  },
};
</script>
