/* eslint-disable react-native/no-inline-styles */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ActionButton } from '@/components/action-button';
import { showErrorMessage } from '@/ui';

import { sendForgotPasswordEmail } from '../../firebase/auth';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const onSendForgotEmail = async () => {
    if (!email) {
      showErrorMessage('Please input email address');
      return;
    }
    setSending(true);
    await sendForgotPasswordEmail(email);
    setSending(false);
    showErrorMessage('Email sent to recover your password');
  };

  return (
    <View style={{ backgroundColor: 'white', flex: 1, paddingHorizontal: 30 }}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={{ fontFamily: 'Roboto', color: 'gray' }}>
        Please enter your <Text style={{ color: 'black' }}>Email</Text> so
      </Text>
      <Text style={{ fontFamily: 'Roboto', color: 'gray' }}>
        we can help you recover your password.
      </Text>
      <View style={styles.inputBack}>
        <MaterialCommunityIcon name="email-outline" color="gray" size={22} />
        <TextInput
          style={styles.inputBox}
          placeholder="Email address"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={{ width: '100%', marginTop: 10 }}>
        <ActionButton
          onPress={onSendForgotEmail}
          title="Send"
          loading={sending}
        />
      </View>
      <TouchableOpacity
        style={{ position: 'absolute', top: 60, left: 20 }}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcon name="arrow-left" color="black" size={22} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Medium',
    color: 'black',
    marginBottom: 20,
    marginTop: 100,
  },
  inputBack: {
    backgroundColor: '#F4F6FA',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  inputBox: {
    marginLeft: 10,
    flex: 1,
    minHeight: 45,
  },
});

export default ForgotPasswordScreen;
