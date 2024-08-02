/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { Picker as RNPickerSelect } from '@react-native-picker/picker';
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
import * as Progress from 'react-native-progress';
import Feather from 'react-native-vector-icons/Feather';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useServerStore } from '@/core/hooks/use-server-data';
import type { INote } from '@/types';

import { editNote } from '../../firebase/firestore';

export const NOTE_CATEGORIES = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Work', value: 'Work' },
  { label: 'Wishlist', value: 'Wishlist' },
];

const EditNoteScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { id: noteId } = useLocalSearchParams<{ id?: string }>();
  const { serverNotes } = useServerStore();
  const noteData = noteId
    ? serverNotes?.find((item) => item.id === noteId)
    : undefined;
  const { user } = useAuthStore();

  const [title, setTitle] = useState(noteData ? noteData.title : '');
  const [note, setNote] = useState(noteData ? noteData.note : '');
  const [category, setCategory] = useState(noteData ? noteData.category : '');
  const [changed, setChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSaveData = useCallback(async () => {
    if (user) {
      setSaving(true);

      const newNoteData: Partial<INote> = {
        title,
        note,
        category,
      };
      await editNote(noteData ? noteData.id : null, user.uid, newNoteData);

      setSaving(false);
      setChanged(false);
      setTimeout(() => {
        router.back();
      }, 500);
    }
  }, [user, title, note, category, noteData, router]);

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () =>
  //       saving ? (
  //         <Progress.Circle
  //           indeterminate
  //           size={20}
  //           style={{ marginRight: 20 }}
  //           color={'gray'}
  //         />
  //       ) : (
  //         <TouchableOpacity
  //           style={{ marginRight: 20 }}
  //           onPress={() => onSaveData()}
  //         >
  //           <Feather name="check" size={24} color="#6BC4EA" />
  //         </TouchableOpacity>
  //       ),
  //     title: noteData ? 'Edit Note' : 'Add Note',
  //   });
  // }, [navigation, noteData, title, note, category, saving, onSaveData]);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (!changed) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          'Discard changes?',
          'You have unsaved changes. Are you sure to discard them and leave the screen?',
          [
            { text: "Don't leave", style: 'cancel', onPress: () => {} },
            {
              text: 'Discard',
              style: 'destructive',
              // If the user confirmed, then we dispatch the action we blocked earlier
              // This will continue the action that had triggered the removal of the screen
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation, changed]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen
        options={{
          headerRight: () =>
            saving ? (
              <Progress.Circle
                indeterminate
                size={20}
                style={{ marginRight: 20 }}
                color={'gray'}
              />
            ) : (
              <TouchableOpacity
                style={{ marginRight: 20 }}
                onPress={() => onSaveData()}
              >
                <Feather name="check" size={24} color="#6BC4EA" />
              </TouchableOpacity>
            ),
          title: noteData ? 'Edit Note' : 'Add Note',
        }}
      />
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 20 }}>
        <TextInput
          placeholder="Add a title"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setChanged(true);
          }}
          style={{ fontSize: 18 }}
        />
        <View
          style={{
            marginVertical: 10,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: 'gray',
          }}
        >
          <RNPickerSelect
            onValueChange={(value) => {
              setChanged(true);
              setCategory(value);
            }}
            // items={NOTE_CATEGORIES}
            selectedValue={category}
            placeholder={'Select a category'}
            style={
              {
                // inputAndroid: {
                //   backgroundColor: 'transparent',
                // },
                // inputIOS: {
                //   minHeight: 45,
                //   paddingLeft: 10,
                // },
              }
            }
          >
            {NOTE_CATEGORIES.map((item) => (
              <RNPickerSelect.Item label={item.label} value={item.value} />
            ))}
          </RNPickerSelect>
        </View>
        <TextInput
          placeholder="Add a note"
          value={note}
          onChangeText={(value) => {
            setNote(value);
            setChanged(true);
          }}
          multiline={true}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditNoteScreen;
