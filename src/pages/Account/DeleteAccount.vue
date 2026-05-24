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
        $t("Delete account")
      }}</q-toolbar-title>
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <template v-if="loading">
      <div
        class="flex flex-center full-width q-pa-xl"
        style="min-height: calc(50vh)"
      >
        <q-spinner color="amber-7" size="2em" />
      </div>
    </template>
    <template v-else>
      <div class="mx-auto w-full max-w-4xl">
        <div class="rounded-[8px] border border-red-100 bg-white p-5 shadow-tagam-card">
          <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-red-50 text-red-600">
            <q-icon name="las la-exclamation-triangle" size="32px" />
          </div>
          <div class="text-[18px] font-black leading-tight text-tagam-ink">
            {{
              $t(
                "You are requesting to have your account deleted and personal information removed"
              )
            }}.
          </div>
          <p class="m-0 mt-3 text-sm font-semibold leading-6 text-tagam-muted">
            {{
              $t(
                "You will permanently lose all your orders, reviews,favorites and profile information, there is no turning back"
              )
            }}.
          </p>
        </div>
      </div>

      <q-footer
          class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur"
        :class="{
          'bg-mydark ': $q.dark.mode,
          'bg-white ': !$q.dark.mode,
        }"
      >
        <q-btn
          type="submit"
          :label="$t('Confirm Deletion')"
          unelevated
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-red-600 font-black text-white"
          size="lg"
          no-caps
          :loading="loading"
          @click="confirmDeletion"
        />
      </q-footer>
    </template>
    <StepsVerification
      ref="steps_verify"
      :sent_message="sent_message"
      @after-verifycode="afterVerifycode"
    ></StepsVerification>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  // name: 'PageName',
  data() {
    return {
      loading: false,
      sent_message: "",
    };
  },
  components: {
    StepsVerification: defineAsyncComponent(() =>
      import("components/StepsVerification.vue")
    ),
  },
  created() {
    this.requestCode();
  },
  methods: {
    requestCode() {
      this.loading = true;
      APIinterface.fetchDataByToken("requestcode2", {})
        .then((data) => {
          this.sent_message = data.msg;
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    confirmDeletion() {
      this.$refs.steps_verify.show_modal = true;
    },
    afterVerifycode(data) {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost("deleteaccount", "code=" + data)
        .then((data) => {
          this.sent_message = data.msg;
          this.$refs.steps_verify.show_modal = false;
          this.$router.replace("/account/deletety");
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
