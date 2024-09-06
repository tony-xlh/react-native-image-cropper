/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { BackHandler, Image, SafeAreaView, StyleSheet, Text} from 'react-native';


export interface CropperProps{
  photoUri:string|undefined;
  onCanceled?: () => void;
  onConfirmed?: (base64:string) => void;
}

export default function Cropper(props:CropperProps) {

  React.useEffect(() => {
    const backAction = () => {
      if (props.onCanceled) {
        props.onCanceled();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {props.photoUri !== undefined && (
        <>
          <Image
            style={styles.image}
            source={{uri:props.photoUri}}
          />
        </>
      )}
      {props.photoUri === undefined && (
        <Text>No image selected</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  image: {
    flex:1,
    resizeMode:'contain',
  },
});
