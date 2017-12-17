import * as axios from 'axios';

axios.defaults.baseURL = "http://geoapplications.de/geoio/services/";
// axios.defaults.baseURL = "http://localhost:5000/";
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export function convexHull(collection) {
  return axios.post("/convexHull", {
    collection
  }).then((result) => {
    let { error } = result && result.data;

/*     if (typeof error === "string") {
      error = JSON.parse(error);
    } */

    if (error) {
      throw new Error(error);
    }

    return result.data;
  });
}