/** @format */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';

// const { width } = Dimensions.get('window');

const Input = props => {
  return (
    <View style={styles.container}>
      <View style={styles.selected}>
        {props.selected && (
          <Image
            source={require('@images/checkout/ic_arrow_drop_down.png')}
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.content,
          props.selected && { backgroundColor: '#E94190' },
        ]}
        onPress={props.onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.money, props.selected && { color: 'white' }]}>
          {props.money}
        </Text>
        <Text style={[styles.type, props.selected && { color: 'white' }]}>
          {props.type}
        </Text>
        <Text style={[styles.time, props.selected && { color: 'white' }]}>
          {props.time}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  content: {
    width: 95,
    borderWidth: 1,
    borderColor: '#E94190',
    borderRadius: 12,
  },
  selected: {
    alignItems: 'center',
    height: 20,
    marginBottom: 5,
  },
  money: {
    color: '#E94190',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
  },
  type: {
    color: '#E94190',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 8,
  },
  time: {
    color: '#E94190',
    fontSize: 13,
    textAlign: 'center',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 8,
    marginBottom: 10,
  },
});

export default Input;
