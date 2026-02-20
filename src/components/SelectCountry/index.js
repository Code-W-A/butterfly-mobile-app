import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

import { Languages } from '@common';

const SelectCountry = React.memo(props => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{Languages.TypeCountry}</Text>
      <View style={styles.viewInput}>
        <CountryPicker
          onSelect={value => {
            props.onChange(value.cca2);
          }}
          cca2={props.value}
          countryCode={props.value}
          filterable
          withCountryNameButton
        />
      </View>
      {props.error && (
        <Text style={[styles.error, props.errorStyle]}>{props.error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 3,
  },
  viewInput: {
    height: 40,
    textAlign: 'left',
    borderColor: '#d4dce1',
    borderWidth: 1,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
    backgroundColor: '#F6F7F9',
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    marginLeft: 3,
  },
});

export default SelectCountry;
