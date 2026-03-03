/** @format */

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
    paddingHorizontal: 20,
    height: 60,
  },
  leftText: {
    fontSize: 16,
    color: '#9B9B9B',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  leadingIcon: {
    marginRight: 10,
  },
  rightText: textColor => ({
    fontSize: 16,
    color: textColor,
    fontWeight: '300',
    alignSelf: 'flex-start',
  }),
  rightContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
