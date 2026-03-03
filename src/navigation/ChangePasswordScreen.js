/** @format */

import React from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import { toast } from '@app/Omni';
import { getFirebaseAuthErrorMessage } from '@services/FirebaseAuthErrorMessages';
import { initializeFirebase } from '@services/Firebase';
import recommendationUiTokens from '../features/recommendations/components/recommendationUiTokens';

const ChangePasswordScreen = ({ theme }) => {
  const [loading, setLoading] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  const passwordStrength = React.useMemo(() => {
    const value = String(newPassword || '');
    if (!value) {
      return null;
    }

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) {
      return { label: 'Parola slaba', color: '#d93838' };
    }
    if (score <= 3) {
      return { label: 'Parola medie', color: '#c87a00' };
    }
    return { label: 'Parola puternica', color: '#1f9f5f' };
  }, [newPassword]);

  const onChangePassword = async () => {
    if (!currentPassword) {
      toast('Introdu parola curenta.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast('Parola noua trebuie sa aiba cel putin 6 caractere.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast('Parola noua si confirmarea nu coincid.');
      return;
    }

    setLoading(true);
    try {
      const firebaseSetup = initializeFirebase();
      const firebaseUser = firebaseSetup?.auth?.currentUser;
      if (!firebaseUser) {
        toast('Te rugam sa te autentifici din nou.');
        return;
      }
      if (!firebaseUser.email) {
        toast('Nu putem schimba parola pentru acest cont.');
        return;
      }

      const providerIds = (firebaseUser.providerData || []).map(
        item => item?.providerId,
      );
      if (!providerIds.includes('password')) {
        toast('Contul nu foloseste autentificare cu parola.');
        return;
      }

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast('Parola actualizata.');
    } catch (error) {
      // Helps identify auth provider setup issues from production logs.
      console.log('[profile:change-password:error]', {
        code: error?.code || null,
        message: error?.message || null,
      });
      toast(
        getFirebaseAuthErrorMessage(
          error,
          'Nu am putut schimba parola. Incearca din nou.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const {
    colors: { background, text, lineColor, placeholder },
  } = theme;

  return (
    <SafeAreaView>
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>Schimba parola</Text>
          <Text style={styles.screenSubtitle}>
            Pentru securitate, confirma parola curenta.
          </Text>

          <View style={styles.formCard}>
            <Text style={[styles.label, { color: text }]}>Parola curenta</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder="Parola curenta"
              placeholderTextColor={placeholder}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: text }]}>Parola noua</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder="Parola noua"
              placeholderTextColor={placeholder}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            {passwordStrength ? (
              <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            ) : null}

            <Text style={[styles.label, { color: text }]}>Confirma parola noua</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder="Confirma parola noua"
              placeholderTextColor={placeholder}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <ButtonIndex
            text="Salveaza parola"
            disabled={loading}
            loading={loading}
            containerStyle={styles.button}
            onPress={onChangePassword}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f9',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingTop: recommendationUiTokens.spacing.cardPadding,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  screenTitle: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.sectionTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.sectionTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.sectionTitle.fontWeight,
  },
  screenSubtitle: {
    marginTop: 6,
    marginBottom: recommendationUiTokens.spacing.cardPadding,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  formCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e7edf2',
    backgroundColor: '#fff',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  label: {
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: recommendationUiTokens.typography.meta.fontWeight,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
    backgroundColor: '#fff',
  },
  passwordStrengthText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    marginTop: recommendationUiTokens.spacing.sectionGap,
    minHeight: 48,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: Color.primary,
  },
});

export default withTheme(ChangePasswordScreen);
