/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, { useCallback } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ICountry } from 'react-native-international-phone-number';
import PhoneInput from 'react-native-international-phone-number';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ActionButton } from '@/components/action-button';
import { LoadingOverlay } from '@/components/loading-overlay';
import { useAuthStore } from '@/core/hooks/use-auth';
import { showErrorMessage } from '@/ui';

// import { ActionButton } from '../../components/ActionButton';
// import { LoadingOverlay } from '../../components/loading-overlay';
import { confirmVerifyCode, verifyPhoneNumber } from '../../firebase/auth';
import { updateServerUserData } from '../../firebase/firestore';
// import { useAuthStore } from '../../hooks/useAuth';
import { getTimeString, trimAndRemoveAreaCode } from '../../util';

const RESEND_TIMEOUT = 120;

export default function VerifyPhoneScreen() {
  const { userData, setUserData } = useAuthStore();
  const [otpCode, setOtpCode] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState<ICountry>();
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const intervalId = useRef<NodeJS.Timeout | undefined>();
  const [currentTime, setCurrentTime] = useState(0);

  const timeStr = useMemo(() => {
    return getTimeString(currentTime);
  }, [currentTime]);

  useEffect(() => {
    return () => {
      intervalId && clearInterval(intervalId.current);
    };
  }, []);

  const sendVerificationCode = useCallback(async (phone: string) => {
    const result = await verifyPhoneNumber(phone);
    if (result) {
      startResendInterval();
    } else {
      showErrorMessage(
        'Failed to send verification code. try again later or use another phone number'
      );
    }
  }, []);

  useEffect(() => {
    if (userData && userData.phoneNumber) {
      sendVerificationCode(userData.phoneNumber);
    }
  }, [sendVerificationCode, userData]);

  const startResendInterval = () => {
    const startTime = Date.now();
    setCurrentTime(RESEND_TIMEOUT);
    if (intervalId.current) clearInterval(intervalId.current);
    intervalId.current = setInterval(() => {
      const dt = Math.round((Date.now() - startTime) / 1000);
      if (RESEND_TIMEOUT - dt > 0) {
        setCurrentTime(RESEND_TIMEOUT - dt);
      } else {
        setCurrentTime(0);
        clearInterval(intervalId.current);
        intervalId.current = undefined;
      }
    }, 1000);
  };

  const onChangeVerifyPhone = useCallback(async () => {
    if (userData) {
      const newPhoneNumber = `${country?.callingCode} ${phoneNumber}`;
      setSaving(true);
      await updateServerUserData(userData?.id, {
        phoneNumber: newPhoneNumber,
        trimPhoneNumber: trimAndRemoveAreaCode(newPhoneNumber),
      });
      sendVerificationCode(newPhoneNumber);
      setUserData({ ...userData, phoneNumber: newPhoneNumber });
      setSaving(false);
      setEditMode(false);
    }
  }, [
    country?.callingCode,
    phoneNumber,
    sendVerificationCode,
    setUserData,
    userData,
  ]);

  const onVerifyCode = useCallback(
    async (code: string) => {
      if (userData) {
        setVerifying(true);
        const result = await confirmVerifyCode(userData.phoneNumber, code);
        if (!result) {
          showErrorMessage('Invalid verify code');
        } else {
          await updateServerUserData(userData.id, { phoneVerified: true });
          setUserData({ ...userData, phoneVerified: true });
        }
        setVerifying(false);
      }
    },
    [setUserData, userData]
  );

  if (!userData) return undefined;

  return (
    <View style={{ backgroundColor: 'white', flex: 1, paddingHorizontal: 30 }}>
      <Text style={styles.title}>Phone Verification</Text>
      {editMode ? (
        <>
          <View style={{ width: '100%', marginVertical: 5 }}>
            <PhoneInput
              value={phoneNumber}
              onChangePhoneNumber={setPhoneNumber}
              selectedCountry={country}
              onChangeSelectedCountry={setCountry}
              placeholder="Your phone number"
              defaultValue={userData ? userData.phoneNumber : ''}
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
          <View style={{ width: '100%', marginTop: 10 }}>
            <ActionButton
              onPress={onChangeVerifyPhone}
              title="Change"
              loading={saving}
            />
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontFamily: 'Roboto', color: 'gray' }}>
            Enter the verification code sent to
          </Text>
          <View
            style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Roboto', color: 'black' }}>
              {userData ? userData.phoneNumber : ''}
            </Text>
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => setEditMode(true)}
            >
              <Text style={{ fontFamily: 'Roboto', color: '#6BC4EA' }}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 30 }}>
            <OTPInputView
              style={{ height: 60 }}
              pinCount={6}
              code={otpCode}
              onCodeChanged={(code) => {
                setOtpCode(code);
              }}
              autoFocusOnLoad
              codeInputFieldStyle={styles.borderStyleBase}
              codeInputHighlightStyle={styles.borderStyleHighLighted}
              onCodeFilled={(code) => {
                onVerifyCode(code);
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: 'Roboto',
              color: 'gray',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {currentTime > 0 ? `Resend code in ${timeStr}` : ''}
          </Text>
          <View style={{ width: '100%', marginTop: 20 }}>
            <ActionButton
              onPress={() => sendVerificationCode(userData.phoneNumber)}
              title="Resend Code"
              disabled={currentTime > 0}
            />
          </View>
        </>
      )}
      {verifying && <LoadingOverlay text="Verifying..." />}
      {editMode && (
        <TouchableOpacity
          onPress={() => setEditMode(false)}
          style={{ position: 'absolute', top: 40, left: 20 }}
        >
          <MaterialCommunityIcon name="arrow-left" color="black" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Medium',
    color: 'black',
    marginBottom: 20,
    marginTop: 80,
  },
  borderStyleBase: {
    width: 40,
    height: 50,
    marginRight: '2%',
    color: '#6BC4EA',
  },
  borderStyleHighLighted: {
    borderColor: '#6BC4EA',
  },
});
