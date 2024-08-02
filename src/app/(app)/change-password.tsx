/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ActionButton } from '@/components/action-button';
import { showErrorMessage } from '@/ui';

import { changePassword } from '../../firebase/auth';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showErrorMessage('New password should match with confirm password');
      return;
    }
    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    if (!result.status) {
      showErrorMessage(result.message);
    } else {
      showErrorMessage('Password is updated');
      router.back();
    }
    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 30,
      }}
    >
      <Text style={{ fontFamily: 'Roboto', color: 'black', marginBottom: 10 }}>
        Enter your current password and new password
      </Text>
      <View style={styles.inputBack}>
        <MaterialCommunityIcon name="lock-outline" color="gray" size={22} />
        <TextInput
          style={styles.inputBox}
          placeholder="Current password"
          value={currentPassword}
          secureTextEntry={true}
          onChangeText={setCurrentPassword}
        />
      </View>
      <View style={styles.inputBack}>
        <MaterialCommunityIcon name="lock-outline" color="gray" size={22} />
        <TextInput
          style={styles.inputBox}
          placeholder="New password"
          value={newPassword}
          secureTextEntry={true}
          onChangeText={setNewPassword}
        />
      </View>
      <View style={styles.inputBack}>
        <MaterialCommunityIcon name="lock-outline" color="gray" size={22} />
        <TextInput
          style={styles.inputBox}
          placeholder="Confirm password"
          value={confirmPassword}
          secureTextEntry={true}
          onChangeText={setConfirmPassword}
        />
      </View>
      <View style={{ width: '100%', marginTop: 20 }}>
        <ActionButton
          onPress={onChangePassword}
          title="Change"
          loading={loading}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBack: {
    backgroundColor: '#F4F6FA',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
    minHeight: 45,
  },
  inputBox: {},
});

export default ChangePasswordScreen;
