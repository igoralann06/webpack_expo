/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
/* eslint-disable react-native/no-inline-styles */
import type { ReactNode } from 'react';
import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface ContactListItemProps {
  leftElement: ReactNode;
  title: string;
  description: string;
  rightElement: ReactNode;
  rightText: string;
  onPress?: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  disabled: boolean;
}

const ContactListItem = (props: ContactListItemProps) => {
  const {
    leftElement,
    title,
    description,
    rightElement,
    rightText,
    onPress,
    onDelete,
    onLongPress,
    disabled,
  } = props;
  const swipeableRow = useRef<Swipeable | null>(null);

  const renderRightAction = (
    iconName: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<string | number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });

    const pressHandler = () => {
      if (onDelete) onDelete();
      close();
    };

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          <Text style={{ color: '#fff' }}>Delete</Text>
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<string | number>
  ) => (
    <View style={{ width: 64, flexDirection: 'row' }}>
      {renderRightAction('trash', '#ef5350', 64, progress)}
    </View>
  );

  const close = () => {
    swipeableRow.current?.close();
  };

  // const Component = onPress || onLongPress ? TouchableHighlight : View;

  const {
    itemContainer,
    leftElementContainer,
    rightSectionContainer,
    mainTitleContainer,
    rightElementContainer,
    rightTextContainer,
    titleStyle,
    descriptionStyle,
  } = styles;

  return (
    <Swipeable
      ref={(ref) => (swipeableRow.current = ref)}
      friction={1}
      renderRightActions={renderRightActions}
    >
      <TouchableHighlight
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        underlayColor="#f2f3f5"
      >
        <View style={itemContainer}>
          {leftElement ? (
            <View style={leftElementContainer}>{leftElement}</View>
          ) : (
            <View />
          )}
          <View style={rightSectionContainer}>
            <View style={mainTitleContainer}>
              <Text style={titleStyle}>{title}</Text>
              {description ? (
                <Text style={descriptionStyle}>{description}</Text>
              ) : (
                <View />
              )}
            </View>
            <View style={rightTextContainer}>
              {rightText ? <Text>{rightText}</Text> : <View />}
            </View>

            {rightElement ? (
              <View style={rightElementContainer}>{rightElement}</View>
            ) : (
              <View />
            )}
          </View>
        </View>
      </TouchableHighlight>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    minHeight: 44,
    height: 63,
  },
  leftElementContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2,
    paddingLeft: 20,
  },
  rightSectionContainer: {
    marginLeft: 20,
    flexDirection: 'row',
    flex: 20,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderColor: "#515151"
  },
  mainTitleContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  rightElementContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.4,
  },
  rightTextContainer: {
    justifyContent: 'center',
    marginRight: 10,
  },
  titleStyle: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: 'black',
  },
  descriptionStyle: {
    fontSize: 12,
    color: '#515151',
    fontFamily: 'Roboto',
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default ContactListItem;
