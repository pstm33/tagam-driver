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
        $t("License")
      }}</q-toolbar-title>
    </q-toolbar>
    <q-separator></q-separator>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink" :class="{ 'flex flex-center': loading }">
    <template v-if="loading">
      <div class="fit text-center">
        <q-spinner color="amber-7" size="2em" />
      </div>
    </template>
    <template v-else>
      <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">
          {{ $t("Verification") }}
        </div>
        <h1 class="m-0 mt-2 text-[26px] font-black leading-tight">{{ $t("Driver's License") }}</h1>
      </div>
      <ul class="rounded-[8px] border border-tagam-line bg-white p-5 pl-8 text-sm font-semibold leading-7 text-tagam-muted shadow-tagam-card">
        <li>
          {{
            $t("Make sure the entire license and all the details are VISIBLE")
          }}
        </li>
        <li>{{ $t("Take a Photo") }}</li>
        <li>{{ $t("Upload a Photo") }}</li>
      </ul>

      <q-space class="q-pa-sm"></q-space>

      <div class="row q-col-gutter-sm q-mb-sm rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
        <template v-if="hasData">
          <q-img
            :src="photo_data.path"
            spinner-color="amber-7"
            spinner-size="sm"
            fit="cover"
            style="height: 70px"
            class="col-3 radius8 border border-tagam-line"
          />
        </template>
        <template v-else-if="hasPhoto">
          <q-img
            :src="this.front_photo_url"
            spinner-color="amber-7"
            fit="cover"
            style="height: 70px"
            class="col-3 radius8 border border-tagam-line"
          />
        </template>
        <div
          v-else
          class="col-3 row items-center justify-center radius8"
          :class="{
            'bg-grey600': $q.dark.mode,
            'bg-amber-50': !$q.dark.mode,
          }"
          style="height: 70px"
        >
          <q-icon name="las la-image" class="text-amber-700" size="xl" />
        </div>
        <div class="col">
          <div class="text-sm font-semibold leading-normal text-tagam-muted">
            <span class="text-weight-bold">{{ $t("Front Photo of ID") }}</span
            >. {{ $t("Maximum 2MB. Accepted types: PNG. JPG") }}
          </div>
          <q-btn
            :label="
              hasPhoto
                ? this.$t('Change Photo')
                : hasData
                ? this.$t('Change Photo')
                : this.$t('Add Photo')
            "
            flat
            color="amber-7"
            no-caps
            class="q-pl-none q-pr-none"
            @click="takePhoto"
          ></q-btn>
        </div>
      </div>
      <!-- row -->

      <template v-if="front_upload_enabled">
        <UploaderFile
          ref="uploader_file"
          path="upload/license"
          @after-uploadfile="afterUploadfile"
        ></UploaderFile>
      </template>

      <q-separator></q-separator>

      <!-- BACK PHOTO ID -->
      <q-space class="q-pa-md"></q-space>

      <div class="row q-col-gutter-sm q-mb-sm rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
        <template v-if="hasBackData">
          <q-img
            :src="photo_data_back.path"
            spinner-color="amber-7"
            spinner-size="sm"
            fit="cover"
            style="height: 70px"
            class="col-3 radius8 border border-tagam-line"
          />
        </template>
        <template v-else-if="hasBackPhoto">
          <q-img
            :src="this.back_photo_url"
            spinner-color="amber-7"
            fit="cover"
            style="height: 70px"
            class="col-3 radius8 border border-tagam-line"
          />
        </template>
        <div
          v-else
          class="col-3 row items-center justify-center radius8"
          :class="{
            'bg-grey600': $q.dark.mode,
            'bg-amber-50': !$q.dark.mode,
          }"
          style="height: 70px"
        >
          <q-icon name="las la-image" class="text-amber-700" size="xl" />
        </div>
        <div class="col">
          <div class="text-sm font-semibold leading-normal text-tagam-muted">
            <span class="text-weight-bold">{{ $t("Back Photo of ID") }}</span
            >. {{ $t("Maximum 2MB. Accepted types: PNG. JPG") }}
          </div>
          <q-btn
            :label="
              hasBackPhoto
                ? this.$t('Change Photo')
                : hasBackData
                ? this.$t('Change Photo')
                : this.$t('Add Photo')
            "
            flat
            color="amber-7"
            no-caps
            class="q-pl-none q-pr-none"
            @click="takeBackPhoto"
          ></q-btn>
        </div>
      </div>
      <!-- row -->

      <template v-if="back_upload_enabled">
        <UploaderFile
          ref="uploader_file"
          path="upload/license"
          @after-uploadfile="afterUploadfileBackphoto"
        ></UploaderFile>
      </template>
      <!-- BACK PHOTO ID -->

      <q-footer
          class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur"
        :class="{
          'bg-mydark ': $q.dark.mode,
          'bg-white ': !$q.dark.mode,
        }"
      >
        <q-btn
          @click="addLicensephoto"
          :label="$t('Confirm Photo')"
          unelevated
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          size="lg"
          no-caps
          :loading="loading"
          :disable="hasAddedPhoto"
        />
      </q-footer>
      </section>
    </template>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import AppCamera from "src/api/AppCamera";
import { useActivityStore } from "stores/ActivityStore";

export default {
  name: "TakeLicensePhoto",
  components: {
    UploaderFile: defineAsyncComponent(() =>
      import("components/UploaderFile.vue")
    ),
  },
  setup() {
    const ActivityStore = useActivityStore();
    return { ActivityStore };
  },
  data() {
    return {
      upload_path: "",
      photo_data: "",
      photo_data_back: "",
      front_upload_enabled: false,
      front_photo_filename: "",
      front_photo_url: "",
      back_upload_enabled: false,
      back_photo_filename: "",
      back_photo_url: "",
      loading: false,
      driver_uuid: "",
    };
  },
  created() {
    this.driver_uuid = this.$route.query.uuid;
  },
  computed: {
    hasPhoto() {
      return APIinterface.empty(this.front_photo_filename) ? false : true;
    },
    hasData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
    hasBackPhoto() {
      return APIinterface.empty(this.back_photo_filename) ? false : true;
    },
    hasBackData() {
      if (Object.keys(this.photo_data_back).length > 0) {
        return true;
      }
      return false;
    },
    hasAddedPhoto() {
      let $found = false;
      if (Object.keys(this.photo_data).length > 0) {
        if (Object.keys(this.photo_data_back).length > 0) {
          $found = true;
        }
      }

      if (!APIinterface.empty(this.front_photo_filename)) {
        if (!APIinterface.empty(this.back_photo_filename)) {
          $found = true;
        }
      }

      if ($found) {
        return false;
      } else return true;
    },
  },
  methods: {
    takePhoto() {
      if (this.$q.capacitor) {
        AppCamera.isCameraEnabled()
          .then((data) => {
            AppCamera.isFileAccessEnabled()
              .then((data) => {
                AppCamera.getPhoto(1)
                  .then((data) => {
                    this.photo_data = data;
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
        this.front_upload_enabled = !this.front_upload_enabled;
      }
    },
    takeBackPhoto() {
      if (this.$q.capacitor) {
        AppCamera.isCameraEnabled()
          .then((data) => {
            AppCamera.isFileAccessEnabled()
              .then((data) => {
                AppCamera.getPhoto(1)
                  .then((data) => {
                    this.photo_data_back = data;
                  })
                  .catch((error) => {
                    this.photo_data_back = [];
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
        this.back_upload_enabled = !this.back_upload_enabled;
      }
    },
    afterUploadfile(data) {
      this.front_photo_filename = data.filename;
      this.front_photo_url = data.url_image;
      this.upload_path = data.upload_path;
    },
    afterUploadfileBackphoto(data) {
      this.back_photo_filename = data.filename;
      this.back_photo_url = data.url_image;
      this.upload_path = data.upload_path;
    },
    hadData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
    addLicensephoto() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.addLicensephoto({
        driver_uuid: this.driver_uuid,
        front_photo_filename: this.front_photo_filename,
        front_photo_url: this.front_photo_url,
        upload_path: this.upload_path,
        file_data: this.hadData() ? this.photo_data.data : "",
        image_type: this.hadData() ? this.photo_data.format : "",

        back_photo_filename: this.back_photo_filename,
        back_photo_url: this.back_photo_url,
        upload_path: this.upload_path,
        photo_data_back: this.hadData() ? this.photo_data_back.data : "",
        image_type_back: this.hadData() ? this.photo_data_back.format : "",
      })
        .then((data) => {
          console.log(this.ActivityStore.settings_data.registration_process);
          if (
            this.ActivityStore.settings_data.registration_process ==
            "activate_account"
          ) {
            this.$router.push({
              path: "/account/signup_ty",
            });
          } else {
            this.$router.push({
              path: "/account/verified_ty",
            });
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    //
  },
  //
};
</script>
