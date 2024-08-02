/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ActionButton } from '@/components/action-button';
import { signIn } from '@/core';
import { useAuthStore } from '@/core/hooks/use-auth';
import { showErrorMessage, View } from '@/ui';

import { signinWithEmail } from '../../firebase/auth';
import { getServerUserData } from '../../firebase/firestore';

export default function LoginScreen() {
  const router = useRouter();
  const { setUserData, setLoggedIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = useCallback(async () => {
    if (!email) {
      showErrorMessage('Please input email address');
      return;
    }
    if (!password) {
      showErrorMessage('Please input password');
      return;
    }
    setLoading(true);
    const result = await signinWithEmail(email, password);
    if (result && result.user) {
      if (!result.status) {
        setLoading(false);
        showErrorMessage(result.message);
      } else {
        const userData = await getServerUserData(result.user.uid);
        setLoggedIn(true);
        if (userData !== null && !userData?.phoneVerified) {
          setUserData(userData);
          setLoading(false);
          router.replace('/auth/verify-phone');
        } else {
          router.push('/tab/my-devices');
          signIn({ access: 'access-token', refresh: 'refresh-token' });
          setLoading(false);
        }
      }
    }
  }, [email, password, router, setLoggedIn, setUserData]);

  return (
    <View className="flex-1">
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View
          style={{
            alignItems: 'center',
            paddingTop: 80,
            paddingHorizontal: 20,
          }}
        >
          <Image
            source={require('../../../assets/images/Icon.png')}
            style={{ width: 90, height: 90 }}
          />
          <Text style={styles.title}>Let's get started</Text>
          <View style={styles.inputBack}>
            <MaterialCommunityIcon
              name="email-outline"
              color="gray"
              size={22}
            />
            <TextInput
              style={styles.inputBox}
              placeholder="Email address"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputBack}>
            <MaterialCommunityIcon name="lock-outline" color="gray" size={22} />
            <TextInput
              style={styles.inputBox}
              placeholder="Password"
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginTop: 5 }}
            onPress={() => router.push('/auth/verify-phone')}
          >
            <Text style={{ fontFamily: 'Roboto-Medium', color: 'black' }}>
              Forgot password?
            </Text>
          </TouchableOpacity>
          <View style={{ width: '100%', marginTop: 20 }}>
            <ActionButton
              onPress={onSignIn}
              title="Sign In"
              loading={loading}
            />
          </View>
          <View style={{ width: '100%', marginTop: 20 }}>
            <ActionButton
              onPress={() => router.push('/auth/signup')}
              title="Create Account"
              outlined={true}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Medium',
    color: 'black',
    marginBottom: 20,
    marginTop: 20,
  },
  inputBack: {
    backgroundColor: '#F4F6FA',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  inputBox: {
    marginLeft: 10,
    flex: 1,
    minHeight: 45,
  },
});
