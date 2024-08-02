/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DialpadButtonProps {
  disabled: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const DIALPAD_DATA = [
  [
    ['1', ''],
    ['2', 'abc'],
    ['3', 'def'],
  ],
  [
    ['4', 'ghi'],
    ['5', 'jkl'],
    ['6', 'mno'],
  ],
  [
    ['7', 'pqrs'],
    ['8', 'tuv'],
    ['9', 'wxyz'],
  ],
  [
    ['*', ''],
    ['0', '.'],
    ['#', ''],
  ],
];

const DIALBUTTON_SIZE = 60;

const DialpadButton = (props: DialpadButtonProps) => {
  const { disabled, title, subtitle, onPress } = props;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{ paddingHorizontal: 10, paddingVertical: 5 }}
      testID={`dialpad_button_${title}`}
    >
      <View
        style={[
          styles.dialButtonContainer,
          {
            height: DIALBUTTON_SIZE,
            width: Dimensions.get('window').width / 3 - 30,
            opacity: disabled ? 0.2 : 1,
            backgroundColor: 'white',
            borderRadius: 30,
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface DialPadProps {
  disabled: boolean;
  onPress: (value: string) => void;
  data?: typeof DIALPAD_DATA;
}

export const DialPad = (props: DialPadProps) => {
  const { disabled, onPress, data = DIALPAD_DATA } = props;
  const mapCol = useCallback(
    ([title, subtitle]: string[], buttonIdx: number) => {
      const handle = onPress && (() => onPress(title));
      return (
        <View key={buttonIdx} style={styles.button}>
          <DialpadButton
            disabled={disabled}
            title={title}
            subtitle={subtitle}
            onPress={handle}
          />
        </View>
      );
    },
    [disabled, onPress]
  );

  const mapRow = useCallback(
    (rowData: string[][], rowIdx: number) => (
      <View key={rowIdx} style={styles.row}>
        {rowData.map(mapCol)}
      </View>
    ),
    [mapCol]
  );

  return (
    <View style={styles.container}>
      {useMemo(() => data.map(mapRow), [data, mapRow])}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  dialButtonContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: 'black',
  },
});
