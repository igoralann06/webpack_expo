/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import type { ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Platform } from 'react-native';

import { useIsFirstTime } from '@/core';
import { SafeAreaView, Text, View } from '@/ui';

import { ActionButton } from '../../components/action-button';

const screenWidth =
  Platform.OS === 'web' ? 1024 : Dimensions.get('window').width;
const imageWidth = Platform.OS === 'web' ? 512 : screenWidth * 0.8;

type IntroData = {
  image: ImageSource;
  title: string;
  text: string;
};

const introData: IntroData[] = [
  {
    image: require('../../../assets/images/Welcome1.png'),
    title: 'External phone control',
    text: 'A VoIP network that lets you make calls over the Internet.',
  },
  {
    image: require('../../../assets/images/Welcome2.png'),
    title: 'Remote control',
    text: 'If you have lost, stolen or damaged your phone you can remotely lock or delete it',
  },
  {
    image: require('../../../assets/images/Welcome3.png'),
    title: 'Your data is always safe',
    text: "MobileyMe's servers are located in Canada, where data protection laws apply",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const introSliderRef = useRef<FlatList<IntroData> | null>(null);
  const [_, setIsFirstTime] = useIsFirstTime();

  const renderIntroView = ({ item }: { item: IntroData }) => {
    return (
      <View
        className={`flex items-center  px-[10vw] pt-12 `}
        style={{
          width: screenWidth,
        }}
      >
        <Image
          source={item.image}
          style={{ width: imageWidth, height: imageWidth }}
          resizeMode="contain"
        />
        <Text className=" mb-5 mt-7 font-roboto-bold text-2xl text-black">
          {item.title} TTT
        </Text>
        <Text className="text-center font-roboto-regular text-base text-gray-500/50">
          {item.text}
        </Text>
      </View>
    );
  };

  const goToNextPage = () => {
    if (currentIndex < introData.length - 1) {
      introSliderRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      setIsFirstTime(false);
      router.push('/auth/login');
    }
  };

  return (
    <SafeAreaView className="flex">
      <View className="flex-1 flex-row">
        <FlatList
          data={introData}
          ref={introSliderRef}
          renderItem={renderIntroView}
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const realValue =
              e.nativeEvent.contentOffset.x /
              (e.nativeEvent.layoutMeasurement.width * 1.0);
            const index = Math.floor(realValue);
            if (realValue === index) {
              setCurrentIndex(index);
            }
          }}
          horizontal
        />
      </View>
      <View className=" my-5 flex-row items-center justify-center">
        {Array.from(Array(introData.length).keys()).map((key, index) => (
          <View
            className=" ml-2.5 h-2.5 w-2.5 rounded-full bg-[#6BC4EA]"
            style={[{ opacity: currentIndex === index ? 1 : 0.4 }]}
            key={index}
          />
        ))}
      </View>
      <View className=" mb-12 mt-5 px-[8vw]">
        <ActionButton
          onPress={goToNextPage}
          title={currentIndex === introData.length - 1 ? 'GET STARTED' : 'NEXT'}
        />
      </View>
    </SafeAreaView>
  );
}
