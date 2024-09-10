import * as React from 'react';
import { StyleSheet, SafeAreaView, View, Text, Button, Alert, Image } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Cropper, { Photo } from './components/Cropper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as DDN from 'vision-camera-dynamsoft-document-normalizer';

const Separator = () => (
  <View style={styles.separator} />
);

export default function App() {
  const [showCropper, setShowCropper] = React.useState(false);
  const [photo, setPhoto] = React.useState<Photo|undefined>(undefined);
  const [croppedImageURL, setCroppedImageURL] = React.useState('');
  const [initializing,setInitializing] = React.useState(true);
  const pickAndCrop = async () => {
    const response = await launchImageLibrary({ mediaType: 'photo'});
    if (response && response.assets) {
      if (response.assets[0]!.uri) {
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
  React.useEffect(() => {
    const initLicense = async () => {
      let result = await DDN.initLicense('DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==');
      if (result === false) {
        Alert.alert('','License invalid');
      }else{
        setInitializing(false);
      }
    };
    initLicense();
  }, []);

  const displayCroppedImage = (path:string) => {
    setShowCropper(false);
    setCroppedImageURL(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!showCropper && (
        <View style={styles.home}>
          <Text style={styles.title}>
            Dynamsoft Document Normalizer Demo
          </Text>
          <Separator />
          <Button
            title="Pick an image and crop"
            onPress={() => pickAndCrop()}
          />
          {initializing && (
            <>
              <Separator />
              <Text>
                Initializing...
              </Text>
            </>
          )}
          {croppedImageURL !== '' && (
            <>
              <Separator />
              <Text>
                  Image:
                </Text>
              <Image
                style={styles.image}
                source={{
                  uri: 'file://' + croppedImageURL,
                }}
              />
            </>
          )}
        </View>
      )}
      {showCropper && (
        <>
          <GestureHandlerRootView>
            <Cropper photo={photo} onCanceled={()=>setShowCropper(false)} onConfirmed={(path) => displayCroppedImage(path)}/>
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
  image: {
    resizeMode:'contain',
    height: 300,
    width: 300,
  },
});
