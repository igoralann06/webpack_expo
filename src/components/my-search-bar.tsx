/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
// import Spinner from 'react-native-spinkit';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

interface MySearchBarProps {
  spinnerVisibility?: boolean;
  spinnerSize?: number;
  darkMode?: boolean;
  placeholder?: string;
  placeholderTextColor?: string;
  enabled?: boolean;
  autoFocus?: boolean;
  searchText: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onPress?: () => void;
  onSearchPress?: () => void;
  onClearPress?: () => void;
  onChangeText?: (value: string) => void;
}

export const MySearchBar = (props: MySearchBarProps) => {
  const {
    spinnerVisibility,
    // spinnerSize = 15,
    darkMode = false,
    placeholder = 'Search here...',
    placeholderTextColor,
    enabled = true,
    autoFocus = false,
    searchText,
    onBlur,
    onFocus,
    // onPress,
    onSearchPress,
    onClearPress,
    onChangeText,
  } = props;
  const inputRef = useRef<TextInput | null>(null);

  // const handleSearchBarPress = () => {
  //   inputRef.current?.focus();
  //   onPress && onPress();
  // };

  const handleOnClearPress = () => {
    inputRef.current?.clear();
    onClearPress && onClearPress();
    onChangeText && onChangeText('');
  };

  const handleChangeText = (value: string) => {
    onChangeText && onChangeText(value);
  };

  const renderSpinner = () => {
    return (
      <View style={styles.spinnerContainer}>
        {/* <Spinner
          size={spinnerSize}
          type={'FadingCircleAlt'}
          color={darkMode ? '#fdfdfd' : '#19191a'}
          isVisible={spinnerVisibility}
        /> */}
      </View>
    );
  };

  const renderSearchIcon = () => {
    return (
      <RNBounceable
        style={styles.searchContainer}
        onPress={() => {
          onSearchPress && onSearchPress();
        }}
      >
        <Feather name="search" color={darkMode ? 'white' : 'black'} size={20} />
      </RNBounceable>
    );
  };

  const renderTextInput = () => {
    let _placeholderTextColor = placeholderTextColor;
    if (!placeholderTextColor) {
      _placeholderTextColor = darkMode ? '#fdfdfd' : '#19191a';
    }
    return (
      <TextInput
        placeholderTextColor={_placeholderTextColor}
        onBlur={() => {
          onBlur && onBlur();
        }}
        onFocus={() => {
          onFocus && onFocus();
        }}
        ref={inputRef}
        style={{
          width: '80%',
          marginLeft: 12,
          color: darkMode ? '#fdfdfd' : '#19191a',
        }}
        value={searchText}
        placeholder={placeholder}
        autoCorrect={false}
        onChangeText={handleChangeText}
        editable={enabled}
        pointerEvents={enabled ? 'auto' : 'none'}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
    );
  };

  const renderClearIcon = () => {
    return (
      <RNBounceable
        bounceEffectIn={0.8}
        style={styles.clearIconContainer}
        onPress={handleOnClearPress}
      >
        <MaterialIcon
          name="close"
          color={darkMode ? 'white' : 'black'}
          size={20}
        />
      </RNBounceable>
    );
  };

  return (
    <View
      style={{
        height: 40,
        width: '100%',
        borderRadius: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: darkMode ? '#19191a' : '#f6f6f8',
        // shadowColor: darkMode ? "#19191a" : "#757575",
        // shadowRadius: 8,
        // shadowOpacity: 0.3,
        // shadowOffset: {
        //   width: 0,
        //   height: 3,
        // },
      }}
    >
      {spinnerVisibility ? renderSpinner() : renderSearchIcon()}
      {renderTextInput()}
      {searchText ? renderClearIcon() : null}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginLeft: 12,
  },
  searchIconImageStyle: {
    width: 18,
    height: 18,
  },
  clearIconImageStyle: {
    width: 15,
    height: 15,
  },
  clearIconContainer: {
    marginRight: 12,
    marginLeft: 'auto',
  },
  spinnerContainer: {
    marginLeft: 12,
  },
});
