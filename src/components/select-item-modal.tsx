/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

import { makeFirstUppercase } from '../util';

interface SelectItemModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  title: string;
  dataArray: ModalData[];
  onSelected: (data: ModalData) => void;
}

interface ModalData {
  title: string;
  label: string;
}

export const SelectItemModal = ({
  visible,
  setVisible,
  title,
  dataArray,
  onSelected,
}: SelectItemModalProps) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => setVisible(false)}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View
        style={{
          backgroundColor: 'white',
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            color: 'black',
            fontSize: 20,
            marginHorizontal: 20,
            marginBottom: 10,
          }}
        >
          {title}
        </Text>
        {dataArray.map((data, index) => {
          return (
            <TouchableHighlight
              onPress={() => onSelected(data)}
              underlayColor="#f2f3f5"
              key={index}
            >
              <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                <Text style={styles.mainText}>{data.title}</Text>
                <Text style={styles.mainText}>
                  {makeFirstUppercase(data.label)}
                </Text>
              </View>
            </TouchableHighlight>
          );
        })}
        <TouchableOpacity
          onPress={() => setVisible(false)}
          style={{ alignSelf: 'flex-end', marginRight: 20, marginBottom: 10 }}
        >
          <Text style={[styles.mainText, { color: 'black' }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainText: {
    fontFamily: 'Roboto',
    color: 'gray',
    fontSize: 16,
  },
});
