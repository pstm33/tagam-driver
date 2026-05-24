import { defineStore } from "pinia";
import AppLocation from "src/api/AppLocation";

export const useLocationStore = defineStore("location", {
  state: () => ({
    coordinates: [],
    has_watcher: false,
    watchers: [],
  }),

  getters: {
    hasData() {
      if (Object.keys(this.coordinates).length > 0) {
        return true;
      }
      return false;
    },
  },

  actions: {
    hadData() {
      if (Object.keys(this.coordinates).length > 0) {
        return true;
      }
      return false;
    },

    async fetchLocation() {
      return new Promise((resolve, reject) => {
        AppLocation.checkAccuracy()
          .then((data) => {
            //
            AppLocation.getPosition()
              .then((data) => {
                resolve({
                  latitude: data.lat,
                  longitude: data.lng,
                });
              })
              .catch((error) => {
                reject(error);
              })
              .then((data) => {});
            //
          })
          .catch((error) => {
            reject(error);
          })
          .then((data) => {
            //
          });
      });
    },

    //
  },
});
