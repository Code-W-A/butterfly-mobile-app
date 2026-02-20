import React from 'react';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as AddressRedux from '@redux/AddressRedux';

import { Languages, withTheme } from '@common';
import css from '@cart/styles';
import { addAddressSchema } from '@app/common/Validator';

import AddressForm from './AddressForm';
import SelectShippingMethod from './SelectShippingMethod';

import styles from './styles';
import Buttons from '../Buttons';

const DeliveryComponent = React.memo(props => {
  const dispatch = useDispatch();
  const {
    theme: {
      colors: { text },
    },
  } = props;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: props.address,
    resolver: yupResolver(addAddressSchema),
  });

  const onSubmit = React.useCallback(data => {
    props.onNext(data);
    saveUserData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveUserData = async data => {
    AddressRedux.actions.updateSelectedAddress(dispatch, data);

    try {
      await AsyncStorage.setItem('@userInfo', JSON.stringify(data));
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView style={styles.form} enableOnAndroid>
        <SelectShippingMethod />

        <View style={css.rowEmpty}>
          <Text style={[css.label, { color: text }]}>
            {Languages.YourDeliveryInfo}
          </Text>
        </View>

        <AddressForm
          handleSubmit={handleSubmit}
          control={control}
          errors={errors}
        />
      </KeyboardAwareScrollView>
      <Buttons
        isAbsolute
        onPrevious={props.onPrevious}
        onNext={handleSubmit(onSubmit)}
      />
    </View>
  );
});

export default withTheme(DeliveryComponent);
