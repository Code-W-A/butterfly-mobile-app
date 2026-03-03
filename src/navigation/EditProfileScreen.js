/** @format */

import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useDispatch, useSelector } from 'react-redux';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, Images, Languages, withTheme } from '@common';
import { toast } from '@app/Omni';
import { getFirebaseAuthErrorMessage } from '@services/FirebaseAuthErrorMessages';
import { initializeFirebase } from '@services/Firebase';
import { getEquipmentCatalog } from '@services/FirebaseEquipmentCatalog';
import {
  ensureFirebaseUserProfile,
  getFirebaseUserProfile,
  mapFirebaseUserToAppUser,
} from '@services/FirebaseUserProfile';
import recommendationUiTokens from '../features/recommendations/components/recommendationUiTokens';

const EQUIPMENT_LABELS = {
  blade: 'Lemn',
  forehand: 'Forehand',
  backhand: 'Rever',
};
const EQUIPMENT_SOURCE_CATALOG = 'catalog';
const EQUIPMENT_SOURCE_CUSTOM = 'custom';

const cleanString = value => (typeof value === 'string' ? value.trim() : '');
const isRemoteUri = value => /^https?:\/\//i.test(cleanString(value));

const buildEquipmentEntry = entry => {
  if (!entry || typeof entry !== 'object') {
    return {
      source: EQUIPMENT_SOURCE_CUSTOM,
      catalogId: '',
      label: '',
    };
  }

  return {
    source:
      cleanString(entry.source) === EQUIPMENT_SOURCE_CATALOG
        ? EQUIPMENT_SOURCE_CATALOG
        : EQUIPMENT_SOURCE_CUSTOM,
    catalogId: cleanString(entry.catalogId),
    label: cleanString(entry.label),
  };
};

const buildEquipmentDraft = equipment => {
  const source = equipment && typeof equipment === 'object' ? equipment : {};
  return {
    blade: buildEquipmentEntry(source.blade),
    forehand: buildEquipmentEntry(source.forehand),
    backhand: buildEquipmentEntry(source.backhand),
  };
};

const normalizeCatalogEntryForSave = (entry, options) => {
  const safeEntry = buildEquipmentEntry(entry);
  const optionsList = Array.isArray(options) ? options : [];
  const selectedCatalogOption = optionsList.find(
    option => option?.id === safeEntry.catalogId,
  );

  const normalizedLabel =
    cleanString(safeEntry.label) || cleanString(selectedCatalogOption?.name);
  const normalizedSource =
    safeEntry.source === EQUIPMENT_SOURCE_CATALOG && safeEntry.catalogId
      ? EQUIPMENT_SOURCE_CATALOG
      : EQUIPMENT_SOURCE_CUSTOM;

  if (!normalizedLabel && !safeEntry.catalogId) {
    return null;
  }

  return {
    source: normalizedSource,
    catalogId: safeEntry.catalogId,
    label: normalizedLabel,
  };
};

const EditProfileScreen = ({ theme }) => {
  const dispatch = useDispatch();
  const storedUser = useSelector(state => state.user.user);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [avatarUri, setAvatarUri] = React.useState('');
  const [catalogLoading, setCatalogLoading] = React.useState(false);
  const [bladeOptions, setBladeOptions] = React.useState([]);
  const [rubberOptions, setRubberOptions] = React.useState([]);
  const [equipmentDraft, setEquipmentDraft] = React.useState(() =>
    buildEquipmentDraft(storedUser?.equipment),
  );

  const updateEquipmentEntry = React.useCallback((key, patch) => {
    setEquipmentDraft(previous => ({
      ...previous,
      [key]: {
        ...previous[key],
        ...patch,
      },
    }));
  }, []);

  React.useEffect(() => {
    const bootstrap = async () => {
      setInitialLoading(true);
      try {
        const firebaseSetup = initializeFirebase();
        const firebaseUser = firebaseSetup?.auth?.currentUser;
        if (!firebaseUser) {
          setFirstName(storedUser?.first_name || '');
          setLastName(storedUser?.last_name || '');
          setPhone(storedUser?.phone || '');
          setAvatarUri(storedUser?.avatar_url || '');
          setEquipmentDraft(buildEquipmentDraft(storedUser?.equipment));
          return;
        }

        const profile = await getFirebaseUserProfile(firebaseUser);
        const appUser = mapFirebaseUserToAppUser({ firebaseUser, profile });

        setFirstName(appUser.first_name || '');
        setLastName(appUser.last_name || '');
        setPhone(appUser.phone || '');
        setAvatarUri(appUser.avatar_url || '');
        setEquipmentDraft(buildEquipmentDraft(appUser.equipment));
      } catch (_error) {
        toast('Nu am putut incarca datele profilului.');
      } finally {
        setInitialLoading(false);
      }
    };

    bootstrap();
  }, [storedUser]);

  React.useEffect(() => {
    const loadEquipmentCatalog = async () => {
      setCatalogLoading(true);
      try {
        const catalog = await getEquipmentCatalog();
        setBladeOptions(Array.isArray(catalog.blades) ? catalog.blades : []);
        setRubberOptions(Array.isArray(catalog.rubbers) ? catalog.rubbers : []);
      } catch (_error) {
        setBladeOptions([]);
        setRubberOptions([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadEquipmentCatalog();
  }, []);

  const onPickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission?.granted) {
        toast('Ai nevoie de permisiune la poze pentru a adauga avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) {
        return;
      }

      const selectedAsset = Array.isArray(result.assets) ? result.assets[0] : null;
      if (!selectedAsset?.uri) {
        return;
      }
      setAvatarUri(selectedAsset.uri);
    } catch (_error) {
      toast('Nu am putut deschide galeria.');
    }
  };

  const uploadAvatarToStorage = async ({ firebaseUser, localUri }) => {
    const firebaseSetup = initializeFirebase();
    if (!firebaseSetup?.storage || !firebaseUser?.uid || !localUri) {
      return '';
    }

    const fileResponse = await fetch(localUri);
    const fileBlob = await fileResponse.blob();
    const storagePath = `users/${firebaseUser.uid}/avatars/profile_${Date.now()}.jpg`;
    const avatarRef = ref(firebaseSetup.storage, storagePath);

    await uploadBytes(avatarRef, fileBlob, {
      contentType: fileBlob.type || 'image/jpeg',
    });

    if (typeof fileBlob.close === 'function') {
      fileBlob.close();
    }

    return getDownloadURL(avatarRef);
  };

  const onSaveProfile = async () => {
    setLoading(true);
    try {
      const firebaseSetup = initializeFirebase();
      const firebaseUser = firebaseSetup?.auth?.currentUser;
      if (!firebaseUser) {
        toast('Te rugam sa te autentifici din nou.');
        return;
      }

      let resolvedAvatarUrl = cleanString(avatarUri);
      if (resolvedAvatarUrl && !isRemoteUri(resolvedAvatarUrl)) {
        resolvedAvatarUrl = await uploadAvatarToStorage({
          firebaseUser,
          localUri: resolvedAvatarUrl,
        });
      }

      const profile = await ensureFirebaseUserProfile({
        firebaseUser,
        profilePatch: {
          firstName: cleanString(firstName),
          lastName: cleanString(lastName),
          email: firebaseUser.email || storedUser?.email || '',
          phone: cleanString(phone),
          avatarUrl: resolvedAvatarUrl,
          equipment: {
            blade: normalizeCatalogEntryForSave(equipmentDraft.blade, bladeOptions),
            forehand: normalizeCatalogEntryForSave(
              equipmentDraft.forehand,
              rubberOptions,
            ),
            backhand: normalizeCatalogEntryForSave(
              equipmentDraft.backhand,
              rubberOptions,
            ),
          },
        },
      });
      const appUser = mapFirebaseUserToAppUser({ firebaseUser, profile });
      setAvatarUri(appUser.avatar_url || resolvedAvatarUrl || '');
      const { actions } = require('@redux/UserRedux');
      dispatch(actions.login(appUser, firebaseUser.uid));
      toast('Profil actualizat.');
    } catch (error) {
      toast(
        getFirebaseAuthErrorMessage(
          error,
          'Nu am putut actualiza profilul. Incearca din nou.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const {
    colors: { background, text, lineColor, placeholder },
  } = theme;

  const renderEquipmentEditor = ({ keyName, label, options }) => {
    const draftEntry = equipmentDraft[keyName] || buildEquipmentEntry(null);
    const hasCatalog = Array.isArray(options) && options.length > 0;

    return (
      <View style={styles.equipmentBlock} key={keyName}>
        <Text style={[styles.label, { color: text }]}>{label}</Text>
        {hasCatalog ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.chip,
                draftEntry.source !== EQUIPMENT_SOURCE_CATALOG
                  ? styles.chipActive
                  : null,
              ]}
              onPress={() =>
                updateEquipmentEntry(keyName, {
                  source: EQUIPMENT_SOURCE_CUSTOM,
                  catalogId: '',
                })
              }
            >
              <Text
                style={[
                  styles.chipText,
                  draftEntry.source !== EQUIPMENT_SOURCE_CATALOG
                    ? styles.chipTextActive
                    : null,
                ]}
              >
                Altul
              </Text>
            </TouchableOpacity>
            {options.slice(0, 12).map(option => {
              const isSelected =
                draftEntry.source === EQUIPMENT_SOURCE_CATALOG &&
                draftEntry.catalogId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.85}
                  style={[styles.chip, isSelected ? styles.chipActive : null]}
                  onPress={() =>
                    updateEquipmentEntry(keyName, {
                      source: EQUIPMENT_SOURCE_CATALOG,
                      catalogId: option.id,
                      label: option.name || '',
                    })
                  }
                >
                  <Text
                    style={[styles.chipText, isSelected ? styles.chipTextActive : null]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <TextInput
          style={[styles.input, { color: text, borderColor: lineColor }]}
          placeholder={
            hasCatalog
              ? `${label} (sau selecteaza din lista de mai sus)`
              : `${label} (text liber)`
          }
          placeholderTextColor={placeholder}
          value={draftEntry.label}
          onChangeText={value =>
            updateEquipmentEntry(keyName, {
              source: EQUIPMENT_SOURCE_CUSTOM,
              catalogId: '',
              label: value,
            })
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>Profil</Text>
          <Text style={styles.screenSubtitle}>
            Actualizeaza datele contului tau Butterfly.
          </Text>

          <View style={styles.avatarCard}>
            <Image
              source={avatarUri ? { uri: avatarUri } : Images.defaultAvatar}
              style={styles.avatarPreview}
              resizeMode="cover"
            />
            <View style={styles.avatarTextWrap}>
              <Text style={styles.avatarTitle}>Foto profil</Text>
              <Text style={styles.avatarSubtitle}>
                Alege din galerie. Se salveaza automat in contul tau.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.avatarButton}
              onPress={onPickAvatar}
            >
              <Text style={styles.avatarButtonText}>
                {avatarUri ? 'Schimba' : 'Adauga'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <Text style={[styles.label, { color: text }]}>{Languages.firstName}</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder={Languages.firstName}
              placeholderTextColor={placeholder}
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={[styles.label, { color: text }]}>{Languages.lastName}</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder={Languages.lastName}
              placeholderTextColor={placeholder}
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={[styles.label, { color: text }]}>{Languages.Phone}</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: lineColor }]}
              placeholder={Languages.Phone}
              placeholderTextColor={placeholder}
              value={phone}
              keyboardType="phone-pad"
              onChangeText={setPhone}
            />

            <View style={styles.equipmentHeaderRow}>
              <Text style={[styles.sectionLabel, { color: text }]}>
                Echipament personal
              </Text>
              <Text style={styles.equipmentHint}>
                {catalogLoading
                  ? 'Sincronizare catalog...'
                  : 'Poti selecta din catalog sau completa manual.'}
              </Text>
            </View>

            {renderEquipmentEditor({
              keyName: 'blade',
              label: EQUIPMENT_LABELS.blade,
              options: bladeOptions,
            })}
            {renderEquipmentEditor({
              keyName: 'forehand',
              label: EQUIPMENT_LABELS.forehand,
              options: rubberOptions,
            })}
            {renderEquipmentEditor({
              keyName: 'backhand',
              label: EQUIPMENT_LABELS.backhand,
              options: rubberOptions,
            })}
          </View>

          <ButtonIndex
            text={initialLoading ? 'Se incarca...' : 'Salveaza profilul'}
            disabled={loading || initialLoading}
            loading={loading}
            containerStyle={styles.button}
            onPress={onSaveProfile}
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
  sectionLabel: {
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
  },
  avatarCard: {
    marginBottom: recommendationUiTokens.spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e8ef',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatarPreview: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#edf2f7',
    borderWidth: 1,
    borderColor: '#d7e1ea',
  },
  avatarTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  avatarTitle: {
    color: Color.blackTextPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  avatarSubtitle: {
    marginTop: 2,
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  avatarButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e1d4dc',
    backgroundColor: '#fff4fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtonText: {
    color: Color.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  equipmentHeaderRow: {
    marginTop: 16,
    marginBottom: 6,
  },
  equipmentHint: {
    marginTop: 4,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
  },
  equipmentBlock: {
    marginBottom: 8,
  },
  chipsContainer: {
    paddingBottom: 8,
    paddingTop: 2,
  },
  chip: {
    marginRight: 8,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: recommendationUiTokens.radius.pill,
    borderWidth: 1,
    borderColor: '#e0e7ee',
    backgroundColor: '#f7fafc',
  },
  chipActive: {
    borderColor: Color.primary,
    backgroundColor: 'rgba(233,65,144,0.12)',
  },
  chipText: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: recommendationUiTokens.typography.meta.fontWeight,
  },
  chipTextActive: {
    color: Color.primary,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
  },
  disabledInput: {
    opacity: 0.65,
    backgroundColor: '#f4f7fb',
  },
  button: {
    marginTop: recommendationUiTokens.spacing.sectionGap,
    minHeight: 48,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: Color.primary,
  },
});

export default withTheme(EditProfileScreen);
