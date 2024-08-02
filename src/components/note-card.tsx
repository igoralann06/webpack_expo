import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

// import { NOTE_CATEGORIES } from '@/app/(app)/edit-note';
import { deleteNote } from '@/firebase/firestore';
import { type INote, NOTE_CATEGORIES } from '@/types';

const colorList = [
  '#66CCCC',
  '#36465D',
  '#00A68C',
  '#660033',
  '#666699',
  '#33CCCC',
  '#999966',
  '#996633',
  '#336633',
  '#990066',
  '#33CC99',
  '#CCFFCC',
  '#003300',
  '#660000',
  '#33CC99',
  '#00A68C',
];

export const NoteCard = ({ data }: { data: INote }) => {
  const router = useRouter();
  const monthList = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const cardColor = useMemo(() => {
    const categoryIndex = NOTE_CATEGORIES.findIndex(
      (e) => e.value === data.category
    );
    return colorList[
      categoryIndex === -1 || categoryIndex >= colorList.length
        ? 0
        : categoryIndex
    ];
  }, [data]);

  const onDeleteNote = () => {
    Alert.alert(
      'Are you sure you want to delete this note ?',
      "This note will be deleted immediately, you can't undo this action.",
      [
        { text: 'Cancel', onPress: () => {} },
        { text: 'OK', onPress: () => deleteNote(data.id) },
      ],
      { cancelable: false }
    );
  };

  return (
    <TouchableOpacity
      onPress={() => {
        router.navigate({ pathname: '/edit-note', params: { id: data.id } });
      }}
      onLongPress={onDeleteNote}
      style={[styles.card, { backgroundColor: cardColor }]}
    >
      <Text style={styles.create}>
        {data.createdAt.toDate().getDate()}
        {monthList[data.createdAt.toDate().getMonth()]}
      </Text>
      <Text numberOfLines={1} style={styles.title}>
        {data.title}
      </Text>
      <Text numberOfLines={1} style={styles.category}>
        {data.category}
      </Text>
      <Text numberOfLines={4} style={styles.note}>
        {data.note}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
    // shadowRadius: 5,
    // shadowOpacity: 0.4,
    borderRadius: 5,
    margin: 20,
    paddingRight: 20,
    width: 138,
    height: 136,
    color: '#fff',
  },
  create: {
    fontSize: 11,
    alignSelf: 'flex-end',
    color: '#fff',
    right: -10,
    top: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    top: 10,
    left: 10,
  },
  category: {
    color: '#FFFBFB',
    fontSize: 10,
    top: 8,
    left: 10,
  },
  note: {
    color: '#fff',
    fontSize: 12,
    top: 10,
    left: 10,
  },
});
