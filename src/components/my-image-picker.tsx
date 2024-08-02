/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import ImagePicker from 'react-native-image-crop-picker';
import { Divider } from 'react-native-paper';

const DEFAULT_IMAGE_WIDTH = 300;
const DEFAULT_IMAGE_HEIGHT = 300;

export const MyImagePicker = ({ showPicker, setShowPicker, onSelected }) => {
  const sheetRef = useRef<ActionSheet>();
  useEffect(() => {
    if (showPicker) {
      sheetRef.current.show();
    }
  }, [showPicker]);

  const closeActionSheet = () => {
    sheetRef.current.hide();
    setShowPicker(false);
  };

  const pickImageFromGallery = async () => {
    try {
      const media = await ImagePicker.openPicker({
        mediaType: 'photo',
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
        cropping: true,
      });
      onSelected(media.path);
    } catch (err) {}
    closeActionSheet();
  };

  const pickImageFromCamera = async () => {
    try {
      const media = await ImagePicker.openCamera({
        mediaType: 'photo',
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
        cropping: true,
      });
      onSelected(media.path);
    } catch {}
    closeActionSheet();
  };

  return (
    <ActionSheet
      ref={sheetRef}
      statusBarTranslucent={false}
      drawUnderStatusBar={false}
      gestureEnabled={true}
      springOffset={50}
      defaultOverlayOpacity={0.3}
      onClose={() => setShowPicker(false)}
    >
      <Text
        style={{
          marginTop: 15,
          marginBottom: 20,
          color: 'gray',
          fontFamily: 'Roboto',
          alignSelf: 'center',
        }}
      >
        Select Image
      </Text>
      <Divider />
      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={{ fontFamily: 'Roboto', fontSize: 16, color: '#007AFF' }}>
          Photo Library
        </Text>
      </TouchableOpacity>
      <Divider />
      <TouchableOpacity style={styles.button} onPress={pickImageFromCamera}>
        <Text style={{ fontFamily: 'Roboto', fontSize: 16, color: '#007AFF' }}>
          Take Photo
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
