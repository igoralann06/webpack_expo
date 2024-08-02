/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

export const LoadingOverlay = ({ tintColor = '#6BC4EA', text = '' }) => {
  return (
    <View
      style={{
        position: 'absolute',
        width: screenWidth,
        height: screenHeight,
        top: 0,
        left: 0,
        backgroundColor: '#0000005F',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          paddingHorizontal: 30,
          paddingVertical: 20,
          marginTop: '45%',
          backgroundColor: '#FFFFFFEF',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Progress.Circle
          indeterminate
          size={30}
          borderWidth={3}
          color={tintColor}
        />
        {text && (
          <Text
            style={{ fontFamily: 'Roboto', color: tintColor, marginTop: 5 }}
          >
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};
