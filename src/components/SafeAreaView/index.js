/** @format */

import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
|--------------------------------------------------
| Optional safe-area wrapper with explicit top/bottom inset control.
|--------------------------------------------------
*/

const SafeArea = ({
  children,
  topInsetEnabled = false,
  bottomInsetEnabled = true,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = topInsetEnabled ? Math.max(insets.top, 0) : 0;
  const resolvedBottomInset =
    Platform.OS === 'android' ? 16 : Math.max(insets.bottom, 16);
  const bottomPadding = bottomInsetEnabled ? resolvedBottomInset : 0;
  const containerStyle = React.useMemo(
    () => [
      styles.container,
      {
        paddingTop: topPadding,
        paddingBottom: bottomPadding,
      },
    ],
    [bottomPadding, topPadding],
  );

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default SafeArea;
