/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { ActionSheetRef } from 'react-native-actions-sheet';
import ActionSheet from 'react-native-actions-sheet';
import { Divider } from 'react-native-paper';

interface DeviceOptionPickerProps {
  showPicker: boolean;
  hidePicker: () => void;
  onDeleteDevice: (data: QueryDocumentSnapshot) => void;
  onSetAsPrimary: (data: QueryDocumentSnapshot) => void;
  deviceData: QueryDocumentSnapshot | null;
}

export const DeviceOptionPicker = (props: DeviceOptionPickerProps) => {
  const { showPicker, hidePicker, onDeleteDevice, onSetAsPrimary, deviceData } =
    props;
  const sheetRef = useRef<ActionSheetRef | null>(null);
  useEffect(() => {
    if (showPicker) {
      sheetRef.current?.show();
    }
  }, [showPicker]);

  const closeActionSheet = () => {
    sheetRef.current?.hide();
    hidePicker();
  };

  const onDelete = () => {
    if (deviceData) {
      onDeleteDevice(deviceData);
      closeActionSheet();
    }
  };

  const onSetPrimary = () => {
    if (deviceData) {
      onSetAsPrimary(deviceData);
      closeActionSheet();
    }
  };

  return (
    <ActionSheet
      ref={(ref) => (sheetRef.current = ref)}
      statusBarTranslucent={false}
      drawUnderStatusBar={false}
      gestureEnabled={true}
      springOffset={50}
      defaultOverlayOpacity={0.3}
      onClose={() => hidePicker()}
    >
      <Text
        style={{
          marginTop: 15,
          marginBottom: 5,
          color: 'black',
          fontFamily: 'Roboto-Medium',
          alignSelf: 'center',
          fontSize: 18,
        }}
      >
        {deviceData ? deviceData.data().deviceName : ''}
      </Text>
      <Text
        style={{
          marginBottom: 20,
          color: 'gray',
          fontFamily: 'Roboto',
          alignSelf: 'center',
        }}
      >
        {deviceData
          ? `Linked at ${deviceData.data().linkedAt.toDate().toLocaleString()}`
          : ''}
      </Text>
      {deviceData && !deviceData.data().isPrimary && (
        <>
          <Divider />
          <TouchableOpacity style={styles.button} onPress={onSetPrimary}>
            <Text
              style={{ fontFamily: 'Roboto', fontSize: 16, color: '#007AFF' }}
            >
              Set as Primary
            </Text>
          </TouchableOpacity>
        </>
      )}
      <Divider />
      <TouchableOpacity style={styles.button} onPress={onDelete}>
        <Text style={{ fontFamily: 'Roboto', fontSize: 16, color: 'red' }}>
          Remove
        </Text>
      </TouchableOpacity>
      <Divider />
      <TouchableOpacity style={styles.button} onPress={closeActionSheet}>
        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: 16,
            color: '#007AFF',
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </ActionSheet>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
