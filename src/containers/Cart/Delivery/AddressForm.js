import React from 'react';
import { View } from 'react-native';
import { Controller } from 'react-hook-form';

import { TextInput, SelectCountry } from '@components';
import { Languages, withTheme } from '@common';

import styles from './styles';

const AddressForm = React.memo(({ errors, control, ...rest }) => {
  const {
    theme: {
      colors: { placeholder },
    },
  } = rest;

  return (
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
    </View>
  );
});

export default withTheme(AddressForm);
