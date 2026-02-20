import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import * as CartRedux from '@redux/CartRedux';
import { Config, Languages, withTheme } from '@common';
import { ShippingMethod } from '@components';

import css from '@cart/styles';

import styles from './styles';

const SelectShippingMethod = React.memo(props => {
  const dispatch = useDispatch();

  const {
    theme: {
      colors: { text },
    },
  } = props;

  const currency = useSelector(state => state.currency);
  const shippingMethod = useSelector(state => state.carts.shippingMethod);
  const shippings = useSelector(state => state.carts.shippings);

  const isShippingEmpty = React.useMemo(() => {
    return !shippingMethod || (shippingMethod && !shippingMethod.id);
  }, [shippingMethod]);

  React.useEffect(() => {
    CartRedux.actions.getShippingMethod(dispatch, Config.shipping.zoneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectShippingMethod = React.useCallback(shipping => {
    CartRedux.actions.selectShippingMethod(dispatch, shipping);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    Config.shipping.visible &&
    shippings?.length > 0 && (
      <View>
        <View style={css.rowEmpty}>
          <Text style={[css.label, { color: text }]}>
            {Languages.ShippingType}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.shippingMethod}>
          {shippings?.map((item, index) => (
            <ShippingMethod
              item={item}
              currency={currency}
              key={`${index}shipping`}
              onPress={onSelectShippingMethod}
              selected={
                (index === 0 && isShippingEmpty) ||
                item?.id === shippingMethod?.id
              }
            />
          ))}
        </ScrollView>
      </View>
    )
  );
});

export default withTheme(SelectShippingMethod);
