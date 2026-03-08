/** @format */

import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { ButtonIndex, SafeAreaView, TextInput } from '@components';
import { Color, Styles, withTheme } from '@common';
import { toast } from '@app/Omni';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import { createSpecialistRequest } from '../services/specialistRequestRepository';

const RecommendationSpecialistContactScreen = ({
  route,
  navigation,
  theme,
}) => {
  const questionnaireId = route?.params?.questionnaireId;
  const answers = route?.params?.answers || {};
  const contact = route?.params?.contact || {};
  const userProfile = useSelector(state => state.user.user);
  const noteFromFlow = route?.params?.note || '';
  const recommendationResponse = route?.params?.recommendationResponse;
  const specialistPhone =
    typeof route?.params?.specialistPhone === 'string'
      ? route.params.specialistPhone.trim()
      : '';

  const [name, setName] = React.useState(
    contact?.name ||
      `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() ||
      userProfile?.name ||
      '',
  );
  const [email, setEmail] = React.useState(contact?.email || userProfile?.email || '');
  const [phone, setPhone] = React.useState(contact?.phone || userProfile?.phone || '');
  const [note, setNote] = React.useState(noteFromFlow);
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = texts.questionnaireRequired;
    }

    if (!email.trim()) {
      nextErrors.email = texts.questionnaireRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = texts.questionnaireInvalidEmail;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!recommendationResponse) {
      toast(texts.callableGeneric);
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await createSpecialistRequest({
        questionnaireId,
        answers,
        note,
        contact: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
        recommendationResponse,
      });

      toast(texts.specialistSuccess);
      navigation.goBack();
    } catch (error) {
      toast(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    } finally {
      setSubmitting(false);
    }
  };

  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <SafeAreaView topInsetEnabled>
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <Text style={styles.title}>{texts.specialistTitle}</Text>
        <Text style={styles.subtitle}>{texts.specialistSubtitle}</Text>

        {specialistPhone ? (
          <TouchableOpacity
            style={styles.callCta}
            activeOpacity={0.88}
            onPress={() => Linking.openURL(`tel:${specialistPhone}`)}
          >
            <Text style={styles.callCtaText}>Sună specialistul</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.card}>
          <TextInput
            label={texts.questionnaireContactName}
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <TextInput
            label={texts.questionnaireContactEmail}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />

          <TextInput
            label={texts.questionnaireContactPhone}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            label={texts.questionnaireContactNote}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            inputStyle={styles.noteTextarea}
          />
        </View>

        <ButtonIndex
          text={texts.specialistSubmit}
          onPress={onSubmit}
          loading={submitting}
          disabled={submitting}
          containerStyle={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    marginTop: 12,
    fontSize: Styles.FontSize.large,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Styles.FontSize.small,
    color: Color.blackTextSecondary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  callCta: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  callCtaText: {
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.tiny,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 6,
    backgroundColor: Color.primary,
    marginBottom: 16,
  },
  noteTextarea: {
    height: 120,
    borderRadius: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
});

export default withTheme(RecommendationSpecialistContactScreen);
