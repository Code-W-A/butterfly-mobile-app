/** @format */

import { warn } from './../Omni';

const CountryWorker = {
  getAllCountries: async () => {
    return await fetch('https://restcountries.com/v2/all')
      .then(response => response.json())
      .then(json => {
        if (json.length != 0) {
          const data = {};
          for (const country of json) {
            data[`${country.alpha2Code}`] = country.name;
          }
          return data;
        }
        // callback({});
      })
      .catch(error => warn(error));
  },
};

export default CountryWorker;
