/** @format */

import React from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, Languages, withTheme } from '@common';
import { toast } from '@app/Omni';
import { getFirebaseAuthErrorMessage } from '@services/FirebaseAuthErrorMessages';
import { initializeFirebase } from '@services/Firebase';
import recommendationUiTokens from '../features/recommendations/components/recommendationUiTokens';

const ChangeEmailScreen = ({ theme }) => {
  const storedUser = useSelector(state => state.user.user);
  const [loading, setLoading] = React.useState(false);
  const [currentEmail, setCurrentEmail] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');

  React.useEffect(() => {
    const bootstrap = async () => {
      try {
        const firebaseSetup = initializeFirebase();
        const firebaseUser = firebaseSetup?.auth?.currentUser;
        const email = firebaseUser?.email || storedUser?.email || '';
        setCurrentEmail(email);
        setNewEmail(email);
      } catch (_error) {
        // Keep fallback from local store only.
        setCurrentEmail(storedUser?.email || '');
        setNewEmail(storedUser?.email || '');
      }
    };
    bootstrap();
  }, [storedUser]);

  const onChangeEmail = async () => {
    const nextEmail = String(newEmail || '')
      .trim()
      .toLowerCase();
    if (!nextEmail) {
      toast(Languages.InvalidEmail);
      return;
    }
    if (!currentPassword) {
      toast('Introdu parola curenta.');
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
        toast('Nu putem schimba emailul pentru acest cont.');
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
      await verifyBeforeUpdateEmail(firebaseUser, nextEmail);

      setCurrentPassword('');
      toast(
        'Ti-am trimis un email de confirmare. Verifica noua adresa si confirma schimbarea.',
      );
    } catch (error) {
      // Helpful diagnostics for auth provider mismatches in production debugging.
      console.log('[profile:change-email:error]', {
        code: error?.code || null,
        message: error?.message || null,
      });
      const normalizedMessage = String(error?.message || '').toLowerCase();
      if (
        normalizedMessage.includes('verify the new email before changing email') ||
        normalizedMessage.includes('verify new email')
      ) {
        toast(
          'Trebuie sa confirmi noua adresa de email din mesajul primit pentru a finaliza schimbarea.',
        );
        return;
      }
      toast(
        getFirebaseAuthErrorMessage(
          error,
          'Nu am putut schimba emailul. Incearca din nou.',
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
          <Text style={styles.screenTitle}>Schimba email</Text>
          <Text style={styles.screenSubtitle}>
            Confirma parola curenta pentru securitate.
          </Text>
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Schimbarea se finalizeaza dupa confirmarea din email.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={[styles.label, { color: text }]}>Email curent</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput, { color: text, borderColor: lineColor }]}
              placeholder={Languages.Email}
              placeholderTextColor={placeholder}
              value={currentEmail}
              editable={false}
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: text }]}>Email nou</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder={Languages.Email}
              placeholderTextColor={placeholder}
              value={newEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setNewEmail}
            />

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
          </View>

          <ButtonIndex
            text="Salveaza emailul"
            disabled={loading}
            loading={loading}
            containerStyle={styles.button}
            onPress={onChangeEmail}
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
    marginBottom: 10,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  infoBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f6d8e9',
    backgroundColor: '#fff4fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: recommendationUiTokens.spacing.cardPadding,
  },
  infoBannerText: {
    color: Color.blackTextPrimary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
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
  readOnlyInput: {
    backgroundColor: '#f4f7fb',
    opacity: 0.8,
  },
  button: {
    marginTop: recommendationUiTokens.spacing.sectionGap,
    minHeight: 48,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: Color.primary,
  },
});

export default withTheme(ChangeEmailScreen);
