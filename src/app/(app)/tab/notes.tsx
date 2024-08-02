/* eslint-disable react-native/no-inline-styles */
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, TouchableHighlight, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

import { NoteCard } from '@/components/note-card';
import { useServerStore } from '@/core/hooks/use-server-data';

const NotesScreen = () => {
  const router = useRouter();
  const { serverNotes } = useServerStore();

  const onNewNote = () => {
    router.push('/edit-note');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <FlatList
        data={serverNotes}
        keyExtractor={(item, index) => `${index}`}
        numColumns={2}
        renderItem={({ item }) => <NoteCard data={item} />}
      />
      <TouchableHighlight
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          borderRadius: 25,
        }}
        onPress={onNewNote}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#6BC4EA',
            justifyContent: 'center',
            elevation: 3,
            alignItems: 'center',
            shadowColor: 'black',
            shadowOffset: {
              width: 0,
              height: -0.5,
            },
            shadowRadius: 4,
            shadowOpacity: 0.4,
          }}
        >
          <Entypo name="plus" size={26} color="white" />
        </View>
      </TouchableHighlight>
    </SafeAreaView>
  );
};

export default NotesScreen;
