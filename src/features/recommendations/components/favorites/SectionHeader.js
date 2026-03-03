/** @format */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';

const SectionHeader = ({ title }) => {
  if (!title) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
});

export default SectionHeader;
