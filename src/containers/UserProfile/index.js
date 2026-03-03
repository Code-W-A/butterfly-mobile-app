/** @format */

import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from 'firebase/auth';

import { UserProfileHeader, UserProfileItem } from '@components';
import { Icon, toast } from '@app/Omni';
import { Languages, Tools, withTheme } from '@common';
import { initializeFirebase } from '@services/Firebase';
import { deleteCurrentFirebaseAccount } from '@services/FirebaseAccountDeletion';
import { ROUTER } from '@navigation/constants';

import styles from './styles';

class UserProfile extends PureComponent {
  state = {
    isDeletingAccount: false,
    isDeleteModalVisible: false,
    deleteModalStep: 1,
    deleteReauthPassword: '',
    deleteReauthPasswordVisible: false,
  };

  _getListItem = () => {
    return [
      {
        label: 'Istoric recomandari',
        routeName: ROUTER.RECOMMENDATION_HISTORY,
        leadingIconName: 'history',
      },
      {
        label: 'Recomandari favorite',
        routeName: ROUTER.RECOMMENDATION_FAVORITES,
        leadingIconName: 'heart-outline',
      },
      {
        label: 'Editeaza profilul',
        routeName: ROUTER.EDIT_PROFILE,
        leadingIconName: 'account-edit-outline',
      },
      {
        label: 'Schimba email',
        routeName: ROUTER.CHANGE_EMAIL,
        leadingIconName: 'email-edit-outline',
      },
      {
        label: 'Schimba parola',
        routeName: ROUTER.CHANGE_PASSWORD,
        leadingIconName: 'lock-reset',
      },
      {
        label: Languages.Languages,
        routeName: ROUTER.SETTINGS,
        leadingIconName: 'translate',
      },
      {
        label: 'Politica de confidentialitate',
        routeName: ROUTER.PRIVACY_POLICY,
        leadingIconName: 'shield-lock-outline',
      },
      {
        label: 'Termeni si conditii',
        routeName: ROUTER.TERMS_AND_CONDITIONS,
        leadingIconName: 'file-document-outline',
      },
      {
        label: Languages.DeleteAccount || 'Stergere cont',
        action: 'deleteAccount',
        destructive: true,
        leadingIconName: 'account-remove-outline',
      },
      {
        label: 'Deconectare',
        action: 'logout',
        leadingIconName: 'logout',
      },
    ];
  };

  _getDeleteAccountErrorMessage = error => {
    const code = String(error?.code || '');
    if (code.includes('requires-recent-login')) {
      return (
        Languages.DeleteAccountReauthRequired ||
        'Pentru securitate, autentifica-te din nou si incearca stergerea contului.'
      );
    }

    if (code.includes('network-request-failed')) {
      return Languages.NoConnection || 'Nu exista conexiune la internet';
    }

    return (
      Languages.DeleteAccountGenericError ||
      'Nu am putut sterge contul acum. Incearca din nou.'
    );
  };

  _handleLogout = async () => {
    const { logout, navigation } = this.props;
    try {
      const firebaseSetup = initializeFirebase();
      if (firebaseSetup?.auth) {
        await signOut(firebaseSetup.auth);
      }
    } catch (_error) {
      // Ignore Firebase sign out errors and proceed with local logout.
    } finally {
      logout();
      this._navigateAfterSessionEnd();
    }
  };

  _navigateAfterSessionEnd = () => {
    const { navigation } = this.props;
    const tryNavigate = (navigator, routeName, params) => {
      try {
        const state = navigator?.getState?.();
        if (state?.routeNames?.includes(routeName)) {
          navigator.navigate(routeName, params);
          return true;
        }
      } catch (_error) {
        // continue fallback chain
      }
      return false;
    };

    const parentNavigator = navigation.getParent?.();

    if (tryNavigate(parentNavigator, ROUTER.RECOMMENDATION_STACK)) {
      return;
    }
    if (tryNavigate(parentNavigator, ROUTER.HOME_STACK)) {
      return;
    }
    if (tryNavigate(navigation, ROUTER.RECOMMENDATION_STACK)) {
      return;
    }
    if (tryNavigate(navigation, ROUTER.HOME_STACK)) {
      return;
    }

    navigation.navigate(ROUTER.ROOT, {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.RECOMMENDATION_STACK,
      },
    });
  };

  _handlePress = item => {
    const { isDeletingAccount } = this.state;
    const { navigation } = this.props;
    const { routeName, action } = item;

    if (isDeletingAccount) {
      return;
    }

    if (action === 'deleteAccount') {
      this._handleDeleteAccount();
      return;
    }

    if (action === 'logout') {
      this._handleLogout();
      return;
    }

    if (routeName) {
      navigation.navigate(routeName, item.params);
    }
  };

  _openDeleteModal = () => {
    this.setState({
      isDeleteModalVisible: true,
      deleteModalStep: 1,
      deleteReauthPassword: '',
      deleteReauthPasswordVisible: false,
    });
  };

  _closeDeleteModal = () => {
    if (this.state.isDeletingAccount) {
      return;
    }
    this.setState({
      isDeleteModalVisible: false,
      deleteModalStep: 1,
      deleteReauthPassword: '',
      deleteReauthPasswordVisible: false,
    });
  };

  _handleDeleteAccount = () => {
    this._openDeleteModal();
  };

  _handleDeleteAccountConfirmStep = () => {
    if (this.state.isDeletingAccount) {
      return;
    }
    this.setState({ deleteModalStep: 2 });
  };

  _canReauthenticateWithPassword = firebaseUser => {
    const providerIds = (firebaseUser?.providerData || []).map(
      item => item?.providerId,
    );
    return providerIds.includes('password') && Boolean(firebaseUser?.email);
  };

  _reauthenticateForDelete = async currentPassword => {
    const firebaseSetup = initializeFirebase();
    const firebaseUser = firebaseSetup?.auth?.currentUser;
    if (!firebaseUser || !this._canReauthenticateWithPassword(firebaseUser)) {
      throw new Error('reauth-not-supported');
    }

    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(firebaseUser, credential);
  };

  _handleDeleteAccountConfirmed = async () => {
    const { logout } = this.props;

    this.setState({ isDeletingAccount: true });
    try {
      const firebaseSetup = initializeFirebase();
      const currentUser = firebaseSetup?.auth?.currentUser;
      if (!currentUser) {
        throw new Error(Languages.DeleteAccountNoUser || 'No user');
      }

      await deleteCurrentFirebaseAccount();
      logout();
      toast(Languages.DeleteAccountSuccess || 'Contul a fost sters cu succes.');
      this.setState({
        isDeleteModalVisible: false,
        deleteModalStep: 1,
        deleteReauthPassword: '',
        deleteReauthPasswordVisible: false,
      });
      this._navigateAfterSessionEnd();
    } catch (error) {
      const code = String(error?.code || '');
      if (code.includes('requires-recent-login')) {
        const firebaseUser = initializeFirebase()?.auth?.currentUser;
        if (this._canReauthenticateWithPassword(firebaseUser)) {
          this.setState({ deleteModalStep: 3 });
          toast(
            'Pentru securitate, confirma parola curenta si continuam stergerea contului.',
          );
        } else {
          toast(
            'Pentru acest tip de cont trebuie reautentificare. Te rugam autentifica-te din nou si apoi reincearca stergerea.',
          );
        }
        return;
      }
      toast(this._getDeleteAccountErrorMessage(error));
    } finally {
      this.setState({ isDeletingAccount: false });
    }
  };

  _handleDeleteReauthPasswordChange = value => {
    this.setState({ deleteReauthPassword: value });
  };

  _toggleDeleteReauthPasswordVisibility = () => {
    this.setState(previous => ({
      deleteReauthPasswordVisible: !previous.deleteReauthPasswordVisible,
    }));
  };

  _handleDeleteAccountReauthAndConfirm = async () => {
    const { deleteReauthPassword } = this.state;
    if (!String(deleteReauthPassword || '').trim()) {
      toast('Introdu parola curenta pentru a continua.');
      return;
    }

    this.setState({ isDeletingAccount: true });
    try {
      await this._reauthenticateForDelete(deleteReauthPassword);
      this.setState({ deleteReauthPassword: '' });
      await this._handleDeleteAccountConfirmed();
    } catch (error) {
      const code = String(error?.code || '');
      if (
        code.includes('wrong-password') ||
        code.includes('invalid-credential') ||
        code.includes('invalid-login-credentials')
      ) {
        toast('Parola curenta este incorecta.');
      } else {
        toast(
          'Nu am putut valida sesiunea curenta. Verifica parola si incearca din nou.',
        );
      }
      this.setState({ isDeletingAccount: false });
    }
  };

  render() {
    const {
      isDeletingAccount,
      isDeleteModalVisible,
      deleteModalStep,
      deleteReauthPassword,
      deleteReauthPasswordVisible,
    } = this.state;
    const { userProfile, navigation } = this.props;
    const user = userProfile.user || {};
    const name = Tools.getName(user);
    const equipment = user?.equipment || {};
    const bladeLabel = equipment?.blade?.label || '-';
    const forehandLabel = equipment?.forehand?.label || '-';
    const backhandLabel = equipment?.backhand?.label || '-';
    const setupValue = `${forehandLabel} / ${backhandLabel}`;
    const listItem = this._getListItem();
    const {
      theme: {
        colors: { background },
        dark,
      },
    } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView ref="scrollView">
          <UserProfileHeader
            onLogin={() => navigation.navigate('LoginScreen')}
            onLogout={this._handleLogout}
            user={{
              ...user,
              name,
            }}
          />

          {userProfile.user && (
            <View style={[styles.profileSection(dark)]}>
              <Text style={styles.headerSection}>
                {'INFORMATII CONT'}
              </Text>
              <UserProfileItem
                label="Nume"
                onPress={this._handlePress}
                value={name}
                leadingIconName="account-outline"
              />
              <UserProfileItem
                label="Email"
                value={user.email}
                leadingIconName="email-outline"
              />
              <UserProfileItem
                label="Lemn"
                value={bladeLabel}
                leadingIconName="table-tennis"
              />
              <UserProfileItem
                label="Fete"
                value={setupValue}
                leadingIconName="layers-outline"
              />
              {/* <UserProfileItem label={Languages.Address} value={user.address} /> */}
            </View>
          )}

          <View style={[styles.profileSection(dark)]}>
            {listItem.map((item, index) => {
              return (
                item && (
                  <UserProfileItem
                    icon={item.action !== 'logout'}
                    key={index.toString()}
                    onPress={() => this._handlePress(item)}
                    labelColor={item.destructive ? '#d93838' : undefined}
                    value={
                      item.action === 'deleteAccount' && isDeletingAccount
                        ? Languages.DeleteAccountInProgress || 'Stergem contul...'
                        : item.value
                    }
                    valueColor={item.destructive ? '#d93838' : undefined}
                    {...item}
                  />
                )
              );
            })}
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={isDeleteModalVisible}
          animationType="fade"
          onRequestClose={this._closeDeleteModal}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={styles.modalPressArea} onPress={this._closeDeleteModal} />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {(deleteModalStep === 1
                  ? Languages.DeleteAccountTitle
                  : deleteModalStep === 2
                  ? Languages.DeleteAccountConfirmTitle
                  : 'Confirma parola') || 'Stergere cont'}
              </Text>
              <Text style={styles.modalBody}>
                {(deleteModalStep === 1
                  ? Languages.DeleteAccountMessage
                  : deleteModalStep === 2
                  ? Languages.DeleteAccountConfirmMessage
                  : 'Pentru securitate, introdu parola curenta. Dupa validare, contul va fi sters imediat.') ||
                  'Aceasta actiune este ireversibila.'}
              </Text>
              {deleteModalStep === 3 ? (
                <View style={styles.modalInputRow}>
                  <TextInput
                    value={deleteReauthPassword}
                    onChangeText={this._handleDeleteReauthPasswordChange}
                    secureTextEntry={!deleteReauthPasswordVisible}
                    autoCapitalize="none"
                    placeholder="Parola curenta"
                    placeholderTextColor="#8a96a3"
                    style={styles.modalInput}
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.modalInputToggle}
                    onPress={this._toggleDeleteReauthPasswordVisibility}
                  >
                    <Icon
                      name={deleteReauthPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6b7786"
                    />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.modalSecondaryButton}
                  onPress={this._closeDeleteModal}
                  disabled={isDeletingAccount}
                >
                  <Text style={styles.modalSecondaryText}>
                    {Languages.DeleteAccountCancel || 'Anuleaza'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.modalPrimaryButton,
                    isDeletingAccount ? styles.modalPrimaryButtonDisabled : null,
                  ]}
                  onPress={
                    deleteModalStep === 1
                      ? this._handleDeleteAccountConfirmStep
                      : deleteModalStep === 2
                      ? this._handleDeleteAccountConfirmed
                      : this._handleDeleteAccountReauthAndConfirm
                  }
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalPrimaryText}>
                      {deleteModalStep === 1
                        ? Languages.DeleteAccountContinue || 'Continua'
                        : deleteModalStep === 2
                        ? Languages.DeleteAccountConfirm || 'Sterge definitiv'
                        : 'Confirma si sterge'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  userProfile: user,
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;
  const { actions } = require('@redux/UserRedux');
  return {
    ...ownProps,
    ...stateProps,
    logout: () => dispatch(actions.logout()),
  };
}

export default connect(
  mapStateToProps,
  null,
  mergeProps,
)(withTheme(UserProfile));
