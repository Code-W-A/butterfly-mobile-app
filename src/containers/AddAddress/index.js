import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import * as AddressRedux from '@redux/AddressRedux';

import { TextInput, SelectCountry } from '@components';
import { Languages, withTheme, Config } from '@common';
import { addAddressSchema } from '@app/common/Validator';

import styles from './styles';

const AddAddress = React.memo(props => {
  const dispatch = useDispatch();

  const {
    theme: {
      colors: { background, placeholder },
    },
  } = props;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      address_1: '',
      city: '',
      state: '',
      postcode: '',
      country: Config.DefaultCountry.countryCode,
      email: '',
      phone: '',
      note: '',
    },
    resolver: yupResolver(addAddressSchema),
  });

  const onSubmit = data => {
    AddressRedux.actions.addAddress(dispatch, data);
    props.onBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <KeyboardAwareScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.FirstName}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeFirstName}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.first_name?.message}
              />
            )}
            name="first_name"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.LastName}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeLastName}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.last_name?.message}
              />
            )}
            name="last_name"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.Address}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeAddress}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.address_1?.message}
              />
            )}
            name="address_1"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.City}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeCity}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.city?.message}
              />
            )}
            name="city"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.State}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeState}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.state?.message}
              />
            )}
            name="state"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.Postcode}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypePostcode}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.postcode?.message}
              />
            )}
            name="postcode"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <SelectCountry
                onChange={onChange}
                value={value}
                error={errors.country?.message}
              />
            )}
            name="country"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.Email}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeEmail}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.email?.message}
              />
            )}
            name="email"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.Phone}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypePhone}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.phone?.message}
              />
            )}
            name="phone"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={Languages.Note}
                onChangeText={onChange}
                value={value}
                placeholder={Languages.TypeNote}
                underlineColorAndroid={'transparent'}
                placeholderTextColor={placeholder}
                error={errors.note?.message}
              />
            )}
            name="note"
          />

          <TouchableOpacity
            style={styles.btnAdd}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.add}>{Languages.AddToAddress}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
});

export default withTheme(AddAddress);
