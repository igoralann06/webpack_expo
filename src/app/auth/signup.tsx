/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ICountry } from 'react-native-international-phone-number';
import PhoneInput from 'react-native-international-phone-number';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ActionButton } from '@/components/action-button';
import { useAuthStore } from '@/core/hooks/use-auth';
import { Checkbox, Image, showErrorMessage } from '@/ui';

import { signupWithEmail } from '../../firebase/auth';

const SignupScreen = () => {
  const router = useRouter();
  const { setUserData, setLoggedIn } = useAuthStore();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState<ICountry>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = useCallback(async () => {
    if (!fullname) {
      showErrorMessage('Please input full name');
      return;
    }
    if (!email) {
      showErrorMessage('Please input email address');
      return;
    }
    if (!phoneNumber) {
      showErrorMessage('Please input phone number');
      return;
    }
    if (!password) {
      showErrorMessage('Please input password');
      return;
    }
    if (password !== confirmPassword) {
      showErrorMessage('Password should match with confirm password');
      return;
    }
    if (!acceptTerms) {
      showErrorMessage('You must agree with our Terms & Condition');
      return;
    }
    const userPhoneNumber = `${country?.callingCode} ${phoneNumber}`;
    const signupData = {
      fullname,
      email,
      password,
      phoneNumber: userPhoneNumber,
      photoURL,
    };
    setLoading(true);
    const result = await signupWithEmail(signupData);
    if (result.status) {
      setLoading(false);
      setUserData(result.userData ?? null);
      setLoggedIn(true);
      router.push('/auth/verify-phone');
    } else {
      showErrorMessage(result.message);
      setLoading(false);
    }
  }, [
    acceptTerms,
    confirmPassword,
    country?.callingCode,
    email,
    fullname,
    password,
    phoneNumber,
    photoURL,
    router,
    setLoggedIn,
    setUserData,
  ]);

  const pickImage = useCallback(async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
      console.log('====> photo ', result.assets[0].uri);
    }
  }, []);

  return (
    <View className=" flex-1">
      <ScrollView className="bg-white">
        <View className="items-center px-5 pb-5 pt-20">
          <Text style={styles.title}>Create Account</Text>
          <Pressable style={{ marginBottom: 10 }} onPress={() => pickImage()}>
            <Image
              source={
                photoURL
                  ? { uri: photoURL }
                  : require('../../../assets/images/AddPhoto.png')
              }
              style={styles.profilePhotoStyle}
              contentFit="contain"
            />
          </Pressable>
          <View style={styles.inputBack}>
            <FontAwesome5 name="user-circle" color="gray" size={22} />
            <TextInput
              style={styles.inputBox}
              placeholder="Full name"
              keyboardType="name-phone-pad"
              value={fullname}
              onChangeText={setFullname}
            />
          </View>
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
          <View style={{ width: '100%', marginVertical: 5 }}>
            <PhoneInput
              value={phoneNumber}
              onChangePhoneNumber={setPhoneNumber}
              selectedCountry={country}
              onChangeSelectedCountry={setCountry}
              placeholder="Your phone number"
              defaultCountry="US"
              phoneInputStyles={{
                container: {
                  borderWidth: 0,
                  borderRadius: 10,
                  height: 60,
                },
                flagContainer: {
                  borderRadius: 10,
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                },
                input: {
                  backgroundColor: '#F4F6FA',
                  height: '100%',
                  flex: 1,
                  marginLeft: 10,
                  borderRadius: 10,
                },
              }}
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
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 5,
              alignSelf: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Checkbox
              disabled={false}
              checked={acceptTerms}
              // tintColors={{ true: '#6BC4EA' }}
              // boxType={'square'}
              accessibilityLabel="I Agree with "
              onChange={(newValue) => setAcceptTerms(newValue)}
              style={{
                height: 22,
                width: 22,
              }}
            />
            <Text
              style={{ fontFamily: 'Roboto', color: 'gray', marginLeft: 10 }}
            >
              {'I Agree with '}
            </Text>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Roboto', color: 'black' }}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', marginTop: 20 }}>
            <ActionButton
              onPress={onSignUp}
              title="Sign Up"
              loading={loading}
              disabled={
                !fullname ||
                !email ||
                !phoneNumber ||
                !password ||
                !confirmPassword ||
                !acceptTerms
              }
            />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <Text
              style={{ fontFamily: 'Roboto', color: 'gray', marginRight: 10 }}
            >
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.back()} disabled={loading}>
              <Text style={{ fontFamily: 'Roboto', color: 'black' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={{ position: 'absolute', top: 60, left: 20 }}
        onPress={() => router.back()}
        disabled={loading}
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
  },
  profilePhotoStyle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'lightgray',
    //tintColor: "lightgray"
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

export default SignupScreen;
