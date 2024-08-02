// import PropTypes from 'prop-types';

import React from 'react';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { Image, Text, View } from '@/ui';

import { getAvatarInitials, stringToColor } from '../util';

interface AvatarProps {
  img?: ImageSourcePropType | null;
  placeholder: string;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  roundedImage?: boolean;
  roundedPlaceholder?: boolean;
  className?: string;
}

const Avatar = (props: AvatarProps) => {
  const {
    img,
    width,
    height,
    placeholder,
    roundedImage = true,
    style,
    roundedPlaceholder = true,
    className = '',
  } = props;
  const { container } = styles;

  const renderImage = () => {
    const { image } = styles;

    return (
      <View className={`w-full ${roundedImage ? 'rounded-full' : ''}`}>
        <Image style={image} source={img} />
      </View>
    );
  };

  const renderPlaceholder = () => {
    const { placeholderContainer, placeholderText } = styles;

    const viewStyle = [
      placeholderContainer,
      { backgroundColor: stringToColor(placeholder) },
    ];

    return (
      <View
        style={viewStyle}
        className={` ${roundedPlaceholder ? 'rounded-full' : ''}`}
      >
        {placeholder ? (
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.01}
            style={[{ fontSize: Math.round(width) / 2 }, placeholderText]}
          >
            {getAvatarInitials(placeholder)}
          </Text>
        ) : (
          <FontAwesome name="user" color="white" size={22} />
        )}
      </View>
    );
  };

  return (
    <View
      style={[container, style, { width, height }]}
      className={`${className}`}
    >
      {img ? renderImage() : renderPlaceholder()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    height: '100%',
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
    width: undefined,
    height: undefined,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dddddd',
    height: '100%',
  },
  placeholderText: {
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default Avatar;
