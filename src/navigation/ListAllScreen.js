/** @format */

import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from '@components';
import { Color, Styles } from '@common';
import { ProductList } from '@components';

class ListAllScreen extends Component {
  render() {
    const { route, navigation } = this.props;
    const params = route?.params;

    if (
      !params ||
      !params.config ||
      typeof params.index === 'undefined' ||
      params.index === null
    ) {
      return (
        <SafeAreaView>
          <View style={styles.fallbackWrap}>
            <Text style={styles.fallbackText}>
              Ecranul are nevoie de context de colecție.
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ProductList
        headerImage={
          params.config.image && params.config.image.length > 0
            ? { uri: params.config.image }
            : null
        }
        config={params.config}
        page={1}
        navigation={navigation}
        index={params.index}
        onViewProductScreen={item => navigation.navigate('DetailScreen', item)}
      />
    );
  }
}

const styles = StyleSheet.create({
  fallbackWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fallbackText: {
    fontSize: Styles.FontSize.small,
    color: Color.blackTextSecondary,
    textAlign: 'center',
  },
});

export default ListAllScreen;
