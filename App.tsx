import * as React from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';

export default function App() {

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Demo</Text>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
