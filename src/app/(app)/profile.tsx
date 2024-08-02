/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
// import FastImage from 'react-native-fast-image';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { Image } from '@/ui';

export interface FormListItem {
  title?: string;
  icon?: ReactNode;
  marginTop?: number;
  disabled?: boolean;
  textColor?: string;
  onPress?: () => void;
}

const ProfileScreen = () => {
  const { userData } = useAuthStore();

  // const onSelectedImage = async (uri) => {
  //   const router = useRouter();
  //   const avatarURL = await uploadProfilePic(userData.id, uri);
  //   setUserData({ ...userData, profilePhoto: avatarURL });
  // };

  const profileList: FormListItem[] = [
    {
      title: userData?.email,
      icon: <Feather name="mail" color="#848FA6" size={24} />,
      marginTop: 30,
      disabled: true,
    },
    {
      title: userData?.fullname,
      icon: <FontAwesome5 name="user-circle" color="#848FA6" size={24} />,
    },
    {
      title: userData?.phoneNumber,
      icon: <Feather name="phone" color="#848FA6" size={24} />,
    },
    {
      title: 'Change password',
      icon: (
        <MaterialCommunityIcon name="lock-outline" color="#848FA6" size={24} />
      ),
      marginTop: 30,
      onPress: () => router.navigate('/change-password'),
    },
  ];

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
      // const url = await uploadProfilePic(userData?.id, result.assets[0].uri);
      // setPhotoURL(result.assets[0].uri);
      console.log('====> photo ', result.assets[0].uri);
    }
  }, []);

  const renderProfileItem = (item: FormListItem, index: number) => {
    return (
      <TouchableHighlight
        key={index}
        style={{
          width: '100%',
          marginTop: item.marginTop ? item.marginTop : 5,
          borderRadius: 15,
        }}
        onPress={() => item.onPress && item.onPress()}
        underlayColor="#f2f3f5"
        disabled={item.disabled ? true : false}
      >
        <View
          style={{
            paddingVertical: 15,
            paddingHorizontal: 15,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 0.8,
            borderRadius: 15,
            borderColor: '#DFDFDF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.icon}
            <Text
              style={{
                color: 'black',
                fontFamily: 'Roboto-Medium',
                fontSize: 16,
                marginLeft: 10,
              }}
            >
              {item.title}
            </Text>
          </View>
          {!item.disabled && (
            <Entypo name="chevron-right" color="#DFDFDF" size={22} />
          )}
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View
          style={{ paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              style={{
                width: 50,
                height: 50,
                borderColor: '#DFDFDF',
                borderWidth: 1,
                borderRadius: 10,
                marginRight: 10,
              }}
              source={
                userData && userData.profilePhoto
                  ? { uri: userData.profilePhoto }
                  : require('../../../assets/images/DefaultPhoto.jpg')
              }
              contentFit={'contain'}
            />
            <TouchableOpacity onPress={pickImage}>
              <Text style={{ fontFamily: 'Roboto', color: '#6BC4EA' }}>
                Change Avatar
              </Text>
            </TouchableOpacity>
          </View>
          {profileList.map((item, index) => {
            return renderProfileItem(item, index);
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
