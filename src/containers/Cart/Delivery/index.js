import React from 'react';
import { useSelector } from 'react-redux';

import { getDefaultAddress } from '@app/utils/Address';

import DeliveryComponent from './DeliveryComponent';

const Delivery = React.memo(props => {
  const selectedAddress = useSelector(state => state.addresses.selectedAddress);
  const customer = useSelector(state => state.user.user);
  const defaultAddress = React.useMemo(
    () => getDefaultAddress(selectedAddress, customer),
    [customer, selectedAddress],
  );

  return (
    <DeliveryComponent
      address={defaultAddress}
      onPrevious={props.onPrevious}
      onNext={props.onNext}
    />
  );
});

export default Delivery;
