<template>
  <q-header class="bg-white text-tagam-ink shadow-sm">
    <q-toolbar class="mx-auto max-w-4xl">
      <q-btn
        @click="$router.back()"
        unelevated
        round
        dense
        icon="arrow_back"
        class="bg-tagam-canvas text-tagam-ink"
      />
      <q-toolbar-title class="text-[18px] font-black">{{
        $t("Edit profile")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="min-h-screen bg-tagam-canvas px-4 pb-28 pt-5 text-tagam-ink">
    <section class="mx-auto max-w-4xl">
      <div class="mb-4 rounded-[8px] bg-tagam-ink p-5 text-white shadow-tagam-soft">
        <div class="text-[12px] font-extrabold uppercase tracking-[0.14em] text-tagam-lime">{{ $t("Courier profile") }}</div>
        <h1 class="m-0 mt-2 text-[28px] font-black leading-tight">{{ $t("Edit profile") }}</h1>
        <p class="m-0 mt-2 text-[13px] font-semibold leading-6 text-white/70">{{ $t("Update contact details used by dispatch and support") }}.</p>
      </div>
    <q-form @submit="onSubmit" class="rounded-[8px] border border-tagam-line bg-white p-4 shadow-tagam-card">
      <div>
        <div class="mb-5 flex items-center justify-center">
          <div class="relative text-center">
            <q-avatar size="86px" class="ring-4 ring-tagam-canvas">
              <template v-if="hasPhoto">
                <q-img
                  :src="photo_data.path"
                  spinner-color="primary"
                  spinner-size="sm"
                  fit="cover"
                />
              </template>
              <template v-else-if="hasData">
                <q-img
                  :src="featured_url"
                  spinner-color="primary"
                  spinner-size="sm"
                  fit="cover"
                />
              </template>
            </q-avatar>
            <q-btn
              round
              icon="las la-camera"
              unelevated
              size="sm"
              class="absolute-bottom-right bg-tagam-amber text-white"
              @click="takePhoto"
            />
          </div>
        </div>

        <template v-if="upload_enabled">
          <UploaderFile
            ref="uploader_file"
            path="upload/avatar"
            @after-uploadfile="afterUploadfile"
          ></UploaderFile>
        </template>

        <q-input
          outlined
          v-model="first_name"
          :label="$t('First name')"
          stack-label
          color="green-8"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          outlined
          v-model="last_name"
          :label="$t('Last name')"
          stack-label
          color="green-8"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          outlined
          v-model="email_address"
          :label="$t('Email address')"
          stack-label
          color="green-8"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="phone"
          mask="##############"
          outlined
          color="green-8"
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
          borderless
          class="input-borderless"
        >
          <template v-slot:prepend>
            <q-select
              v-model="phone_prefix"
              :options="options"
              @filter="filterFn"
              behavior="dialog"
              input-debounce="700"
              style="border: none"
              emit-value
              borderless
              class="myq-field"
            >
              <template v-slot:option="{ itemProps, opt }">
                <q-item v-bind="itemProps">
                  <q-item-section avatar>
                    <q-img
                      :src="opt.flag"
                      style="height: 15px; max-width: 20px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="opt.label" />
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ $t("No results") }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </template>
        </q-input>
      </div>

      <q-footer class="bg-white/90 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <q-btn
          type="submit"
          :label="$t('Update')"
          unelevated
          class="mx-auto h-13 w-full max-w-4xl rounded-[8px] bg-tagam-leaf font-black text-white"
          size="lg"
          no-caps
          :loading="loading"
        />
      </q-footer>
    </q-form>
    </section>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useActivityStore } from "stores/ActivityStore";
import auth from "src/api/auth";
import AppCamera from "src/api/AppCamera";

export default {
  name: "EditProfile",
  components: {
    UploaderFile: defineAsyncComponent(() =>
      import("components/UploaderFile.vue")
    ),
  },
  data() {
    return {
      data: [],
      first_name: "",
      last_name: "",
      email_address: "",
      phone_prefix: "",
      phone: "",
      avatar: " ",
      options: [],
      loading: false,
      phone_settings: [],
      photo_data: [],
      upload_enabled: false,
      featured_filename: "",
      featured_url: "",
      upload_path: "",
      has_photo: false,
    };
  },
  setup() {
    const Activity = useActivityStore();
    return { Activity };
  },
  created() {
    this.getProfile();
  },
  computed: {
    hasData() {
      if (!APIinterface.empty(this.featured_url)) {
        return true;
      }
      return false;
    },
    hasPhoto() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getProfile() {
      try {
        this.data = auth.getUser();
        this.first_name = this.data.first_name;
        this.last_name = this.data.last_name;
        this.email_address = this.data.email_address;
        this.phone_prefix = this.data.phone_prefix;
        this.phone = this.data.phone;
        this.featured_url = this.data.avatar;

        console.log(this.Activity.phone_settings);
        this.options = this.Activity.phone_settings.prefixes;
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
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
                if (this.$q.platform.is.ios) {
                  this.upload_enabled = !this.upload_enabled;
                }
              });
            //
          })
          .catch((error) => {
            if (this.$q.platform.is.ios) {
              this.upload_enabled = !this.upload_enabled;
            }
          });
      } else {
        this.upload_enabled = !this.upload_enabled;
      }
    },
    afterUploadfile(data) {
      this.featured_filename = data.filename;
      this.featured_url = data.url_image;
      this.upload_path = data.upload_path;
    },
    hadData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
    onSubmit() {
      APIinterface.showLoadingBox("", this.$q);
      this.loading = true;
      APIinterface.fetchDataByToken("updateprofile", {
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        phone_prefix: this.phone_prefix,
        phone: this.phone,
        featured_filename: this.featured_filename,
        upload_path: this.upload_path,
        file_data: this.hadData() ? this.photo_data.data : "",
        image_type: this.hadData() ? this.photo_data.format : "",
        // file_data: this.hadData() ? this.photo_data.data : "",
        // image_type: this.hadData() ? this.photo_data.format : "",
      })
        .then((data) => {
          auth.setUser(data.details.user_data);
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
