/** @format */

import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';

import { Color, Styles } from '@common';
import { ROUTER } from '@navigation/constants';

const ADMIN_TRUE_VALUES = new Set(['true', '1', 'yes']);

const getIsAdminEnabled = () => {
  const extra =
    Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

  if (typeof extra?.isAdmin === 'boolean') {
    return extra.isAdmin;
  }

  const normalized = String(extra?.isAdmin || '')
    .trim()
    .toLowerCase();

  return ADMIN_TRUE_VALUES.has(normalized);
};

const TEMPLATE_LINKS = [
  {
    key: 'template-home',
    label: 'Template: Home (tabs)',
    routeName: ROUTER.ROOT,
  },
  {
    key: 'tab-home',
    label: 'Tab: Acasă',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.HOME_STACK,
      },
    },
  },
  {
    key: 'tab-categories',
    label: 'Tab: Categorii',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.CATEGORY_STACK,
      },
    },
  },
  {
    key: 'tab-search',
    label: 'Tab: Căutare',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.SEARCH_STACK,
      },
    },
  },
  {
    key: 'tab-cart',
    label: 'Tab: Coș',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.CART_STACK,
      },
    },
  },
  {
    key: 'tab-wishlist',
    label: 'Tab: Favorite',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.WISHLIST_STACK,
      },
    },
  },
  {
    key: 'tab-profile',
    label: 'Tab: Profil',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.USER_PROFILE_STACK,
      },
    },
  },
  {
    key: 'tab-orders',
    label: 'Tab: Comenzi',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.MY_ORDERS_STACK,
      },
    },
  },
  {
    key: 'news',
    label: 'Știri',
    routeName: ROUTER.NEWS,
  },
  {
    key: 'login',
    label: 'Login',
    routeName: ROUTER.LOGIN,
  },
  {
    key: 'signup',
    label: 'Înregistrare',
    routeName: ROUTER.SIGN_UP,
  },
  {
    key: 'settings',
    label: 'Setări',
    routeName: ROUTER.SETTINGS,
  },
  {
    key: 'address',
    label: 'Adrese',
    routeName: ROUTER.ADDRESS,
  },
  {
    key: 'add-address',
    label: 'Adaugă adresă',
    routeName: ROUTER.ADD_ADDRESS,
  },
  {
    key: 'recommendation',
    label: 'Înapoi la recomandări',
    routeName: ROUTER.ROOT,
    params: {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.RECOMMENDATION_STACK,
      },
    },
  },
];

const AdminFloatingMenu = ({ onNavigate }) => {
  const [visible, setVisible] = React.useState(false);
  const isAdminEnabled = React.useMemo(() => getIsAdminEnabled(), []);

  if (!isAdminEnabled) {
    return null;
  }

  const handleNavigate = (routeName, params) => {
    if (!routeName || typeof onNavigate !== 'function') {
      return;
    }

    setVisible(false);
    onNavigate(routeName, params);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.fabText}>Admin</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.title}>Navigare rapidă template</Text>
            <Text style={styles.subtitle}>
              Disponibil doar când `IS_ADMIN=true`.
            </Text>

            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
            >
              {TEMPLATE_LINKS.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.linkButton}
                  activeOpacity={0.8}
                  onPress={() => handleNavigate(item.routeName, item.params)}
                >
                  <Text style={styles.linkText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 14,
    bottom: 28,
    borderRadius: 22,
    backgroundColor: Color.primary,
    minWidth: 82,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 2000,
  },
  fabText: {
    color: '#fff',
    fontSize: Styles.FontSize.small,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '82%',
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.medium,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: Color.blackTextSecondary,
    fontSize: Styles.FontSize.small,
    marginBottom: 10,
  },
  list: {
    marginBottom: 10,
  },
  linkButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  linkText: {
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.small,
    fontWeight: '600',
  },
  closeButton: {
    borderRadius: 8,
    backgroundColor: '#596275',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: Styles.FontSize.small,
    fontWeight: '700',
  },
});

export default AdminFloatingMenu;
