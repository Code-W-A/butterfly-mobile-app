/** @format */

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: dark => ({
    borderTopWidth: 10,
    borderColor: dark ? '#101425' : '#F5F5F5',
  }),
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 24, 0.35)',
    justifyContent: 'flex-end',
  },
  modalPressArea: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    color: '#121923',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  modalBody: {
    marginTop: 8,
    color: '#5f6b78',
    fontSize: 14,
    lineHeight: 20,
  },
  modalInputRow: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8e0e8',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    color: '#121923',
  },
  modalInputToggle: {
    width: 42,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalSecondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8e0e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  modalSecondaryText: {
    color: '#344354',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  modalPrimaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#d93838',
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.7,
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
});
