import * as React from 'react';
import { StyleSheet, SafeAreaView, View, Text, Button } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Cropper, { Photo } from './components/Cropper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Separator = () => (
  <View style={styles.separator} />
);

export default function App() {
  const [showCropper, setShowCropper] = React.useState(false);
  const [photo, setPhoto] = React.useState<Photo|undefined>(undefined);
  const pickAndCrop = async () => {
    const response = await launchImageLibrary({ mediaType: 'photo'});
    if (response && response.assets) {
      if (response.assets[0]!.uri) {
        console.log(response.assets[0]!.uri);
        setPhoto(
          {
            photoUri:response.assets[0]!.uri,
            photoWidth:response.assets[0]!.width as number,
            photoHeight:response.assets[0]!.height as number,
          }
        );
        setShowCropper(true);
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {!showCropper && (
        <View style={styles.home}>
          <Text style={styles.title}>
            Dynamsoft Barcode Reader Demo
          </Text>
          <Separator />
          <Button
            title="Pick an image and crop"
            onPress={() => pickAndCrop()}
          />
        </View>
      )}
      {showCropper && (
        <>
          <GestureHandlerRootView>
            <Cropper photo={photo} onCanceled={()=>setShowCropper(false)}/>
          </GestureHandlerRootView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  home:{
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  separator: {
    marginVertical: 4,
  },
});
