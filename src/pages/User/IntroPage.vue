<template>
  <q-page class="flex min-h-screen items-center justify-center bg-tagam-canvas px-4 text-tagam-ink">
    <div class="text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[8px] bg-tagam-ink text-tagam-lime shadow-tagam-soft">
        <q-icon name="delivery_dining" size="34px" />
      </div>
      <div class="text-[24px] font-black">TAGAM Driver</div>
    </div>
    <q-inner-loading
      :showing="ActivityStore.settings_loading"
      color="green-8"
    ></q-inner-loading>
  </q-page>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";

export default {
  name: "IntroPage",
  setup() {
    const ActivityStore = useActivityStore();
    return { ActivityStore };
  },
  watch: {
    ActivityStore: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        console.log(newValue.settings_loading);
        if (newValue.settings_loading == false) {
          if (
            newValue.settings_data.enabled_language == true &&
            newValue.choose_language == false
          ) {
            this.$router.replace("/select-language");
          } else {
            this.$router.replace("/user/login");
          }
        }
      },
    },
  },
};
</script>
