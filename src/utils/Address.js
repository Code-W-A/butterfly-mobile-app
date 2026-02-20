import { get, isEmpty } from 'lodash';

import { Config } from '@common';

export const getDefaultAddress = (selectedAddress, customer) => {
  let value = selectedAddress;

  if (!customer) {
    return value;
  }

  if (!selectedAddress || isEmpty(selectedAddress)) {
    const country =
      get(customer, 'billing.country') !== ''
        ? get(customer, 'billing.country')
        : Config.DefaultCountry.countryCode;

    value = {
      first_name:
        customer.billing.first_name === ''
          ? customer.first_name
          : customer.billing.first_name,
      last_name:
        customer.billing.last_name === ''
          ? customer.last_name
          : customer.billing.last_name,
      email:
        customer.billing.email === '' ? customer.email : customer.billing.email,
      address_1: customer.billing.address_1,
      city: customer.billing.city,
      state: customer.billing.state,
      postcode: customer.billing.postcode,
      phone: customer.billing.phone,
      country,
    };
  } else {
    value.country =
      selectedAddress?.country && selectedAddress?.country !== ''
        ? get(selectedAddress, 'country')
        : Config.DefaultCountry.countryCode;
  }

  return value;
};
