/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import * as Progress from 'react-native-progress';

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  outlined?: boolean;
  textColor?: string;
  backColor?: string;
  loading?: boolean;
  disabled?: boolean;
};

export const ActionButton = ({
  title,
  onPress,
  outlined = false,
  textColor = 'white',
  backColor = '#6BC4EA',
  loading = false,
  disabled = false,
}: ActionButtonProps) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      disabled={loading || disabled}
      underlayColor={'#f2f3f5'}
      style={{ borderRadius: 20 }}
    >
      <View
        style={{
          backgroundColor: outlined ? textColor : backColor,
          borderColor: backColor,
          borderWidth: outlined ? 1 : 0,
          borderRadius: 20,
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.3 : 1,
        }}
      >
        {loading ? (
          <Progress.Circle
            indeterminate
            size={30}
            style={{ alignSelf: 'center' }}
            color={'#fff'}
          />
        ) : (
          <Text
            style={{
              color: outlined ? backColor : disabled ? 'black' : textColor,
              fontFamily: 'Roboto-Medium',
              fontSize: 18,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
};
