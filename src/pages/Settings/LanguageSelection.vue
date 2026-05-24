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
        $t("Language")
      }}</q-toolbar-title>
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <q-list class="mx-auto max-w-4xl">
      <q-item
        v-for="items in Activity.lang_data.data"
        :key="items"
        tag="label"
        clickable
        v-ripple
        class="q-mb-sm rounded-[8px] border border-tagam-line shadow-tagam-card"
        :class="{
          'bg-dark text-white': $q.dark.mode,
          'bg-white text-tagam-ink': !$q.dark.mode,
        }"
      >
        <q-item-section avatar>
          <q-avatar square>
            <q-img
              :src="items.flag"
              spinner-color="amber-7"
              style="height: 25px; max-width: 40px"
              spinner-size="sm"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1" class="font-black">{{ items.title }}</q-item-label>
          <q-item-label lines="1" caption class="font-semibold">{{ items.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-radio
            v-model="language"
            :val="items.code"
            color="amber-7"
            @click="setData(items)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <q-footer
      class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur"
      :class="{
        'bg-mydark ': $q.dark.mode,
        'bg-white ': !$q.dark.mode,
      }"
    >
      <q-btn
        type="submit"
        :label="$t('Save')"
        unelevated
        class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
        size="lg"
        no-caps
        :loading="loading"
        @click="setLanguage"
      />
    </q-footer>
  </q-page>
</template>

<script>
import { useActivityStore } from "stores/ActivityStore";
import { api } from "boot/axios";
import APIinterface from "src/api/APIinterface";

export default {
  name: "LanguageSelection",
  data() {
    return {
      language: "",
      selected_lang_data: [],
    };
  },
  created() {
    this.language = this.Activity.app_language;
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  methods: {
    setData(data) {
      this.selected_lang_data = data;
    },
    async setLanguage() {
      let RTL = false;
      if (Object.keys(this.selected_lang_data).length > 0) {
        RTL = !APIinterface.empty(this.selected_lang_data.rtl)
          ? this.selected_lang_data.rtl
          : false;
      }

      this.Activity.rtl = RTL;
      this.$q.lang.set({ rtl: RTL });

      this.Activity.app_language = this.language;
      this.$i18n.locale = this.language;
      api.defaults.params = {};
      api.defaults.params["language"] = this.$i18n.locale;

      this.Activity.getSettings();
      this.$router.back();
    },
  },
};
</script>
