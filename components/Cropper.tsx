/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { Alert, BackHandler, StyleSheet, Text, TouchableOpacity, useWindowDimensions} from 'react-native';
import { Canvas, Fill, Image, Points, Rect, useImage, vec } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import * as DDN from 'vision-camera-dynamsoft-document-normalizer';

export interface Photo {
  photoUri:string;
  photoWidth:number;
  photoHeight:number;
}

export interface CropperProps{
  photo?:Photo,
  onCanceled?: () => void;
  onConfirmed?: (path:string) => void;
}
export interface Point {
  x: number;
  y: number;
}

let defaultPoints = [{x:100,y:50},{x:200,y:50},{x:200,y:100},{x:100,y:100}];

export default function Cropper(props:CropperProps) {
  const image = useImage(props.photo!.photoUri);
  const { width, height } = useWindowDimensions();
  const points = useSharedValue(defaultPoints);
  const polygonPoints = useDerivedValue(() => {
    return [vec(points.value[0].x,points.value[0].y),
    vec(points.value[1].x,points.value[1].y),
    vec(points.value[2].x,points.value[2].y),
    vec(points.value[3].x,points.value[3].y),
    vec(points.value[0].x,points.value[0].y)];
  },[points]);
  const [selectedIndex,setSelectedIndex] = useState(-1);
  const rectWidth = 10;
  const rect1X = useDerivedValue(() => {
    return points.value[0].x - rectWidth;
  },[points]);
  const rect1Y = useDerivedValue(() => {
    return points.value[0].y - rectWidth;
  },[points]);
  const rect2X = useDerivedValue(() => {
    return points.value[1].x;
  },[points]);
  const rect2Y = useDerivedValue(() => {
    return points.value[1].y - rectWidth;
  },[points]);
  const rect3X = useDerivedValue(() => {
    return points.value[2].x;
  },[points]);
  const rect3Y = useDerivedValue(() => {
    return points.value[2].y;
  },[points]);
  const rect4X = useDerivedValue(() => {
    return points.value[3].x - rectWidth;
  },[points]);
  const rect4Y = useDerivedValue(() => {
    return points.value[3].y;
  },[points]);


  React.useEffect(() => {
    console.log(props.photo);
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
    detectDocument();
    return () => backHandler.remove();
  }, []);

  const detectDocument = async () => {
    if (props.photo?.photoUri) {
      let results = await DDN.detectFile(props.photo.photoUri);
      let detected = false;
      for (let index = 0; index < results.length; index++) {
        const detectedResult = results[index];
        if (detectedResult.confidenceAsDocumentBoundary > 50) {
          points.value = scaledPoints(detectedResult.location.points);
          detected = true;
          break;
        }
      }
      if (!detected) {
        Alert.alert('','No documents detected');
      }
    }
  };

  const scaledPoints = (detectedPoints:[Point,Point,Point,Point]) => {
    let photoWidth:number = props.photo!.photoWidth;
    let photoHeight:number = props.photo!.photoHeight;
    let newPoints = [];
    let {displayedWidth, displayedHeight} = getDisplayedSize();
    let widthDiff = (width - displayedWidth) / 2;
    let heightDiff = (height - displayedHeight) / 2;
    let xRatio = displayedWidth / photoWidth;
    let yRatio = displayedHeight / photoHeight;
    for (let index = 0; index < detectedPoints.length; index++) {
      const point = detectedPoints[index];
      const x = point.x * xRatio + widthDiff;
      const y = point.y * yRatio + heightDiff;
      newPoints.push({x:x,y:y});
    }
    return newPoints;
  };

  const pointsScaledBack = () => {
    let photoWidth:number = props.photo!.photoWidth;
    let photoHeight:number = props.photo!.photoHeight;
    let newPoints = [];
    let {displayedWidth, displayedHeight} = getDisplayedSize();
    let widthDiff = (width - displayedWidth) / 2;
    let heightDiff = (height - displayedHeight) / 2;
    let xRatio = displayedWidth / photoWidth;
    let yRatio = displayedHeight / photoHeight;
    for (let index = 0; index < points.value.length; index++) {
      const point = points.value[index];
      const x = Math.ceil((point.x - widthDiff) / xRatio);
      const y = Math.ceil((point.y - heightDiff) / yRatio);
      newPoints.push({x:x,y:y});
    }
    return newPoints as [Point,Point,Point,Point];
  };

  const getDisplayedSize = () => {
    let displayedWidth = width;
    let displayedHeight = height;
    if (props.photo!.photoHeight / props.photo!.photoWidth > height / width) {
      displayedWidth = props.photo!.photoWidth * (height / props.photo!.photoHeight);
    }else{
      displayedHeight = props.photo!.photoHeight * (width / props.photo!.photoWidth);
    }
    return {displayedWidth:displayedWidth,displayedHeight:displayedHeight};
  };


  const panGesture = Gesture.Pan()
    .onChange((e) => {
      let index = selectedIndex;
      if (index !== -1) {
        let newPoints = JSON.parse(JSON.stringify(points.value));
        newPoints[index].x = newPoints[index].x + e.changeX;
        newPoints[index].y = newPoints[index].y + e.changeY;
        points.value = newPoints;
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin((e) => {
      const selectRect = () => {
        let rectList = [{x:rect1X,y:rect1Y},{x:rect2X,y:rect2Y},{x:rect3X,y:rect3Y},{x:rect4X,y:rect4Y}];
        for (let index = 0; index < 4; index++) {
          const rect = rectList[index];
          let diffX = Math.abs(e.absoluteX - rect.x.value);
          let diffY = Math.abs(e.absoluteY - rect.y.value);
          if (diffX < 20 && diffY < 20) {
            runOnJS(setSelectedIndex)(index);
            break;
          }
        }
      };
      selectRect();
    });

  const composed = Gesture.Simultaneous(tapGesture, panGesture);

  const cancel = () => {
    if (props.onCanceled) {
      props.onCanceled();
    }
  };

  const confirm = async () => {
    if (props.onConfirmed) {
      let location = {points:pointsScaledBack()};
      try {
        let normalizedImageResult = await DDN.normalizeFile(props.photo!.photoUri, location, {saveNormalizationResultAsFile:true});
        if (normalizedImageResult.imageURL) {
          props.onConfirmed(normalizedImageResult.imageURL);
        }
      } catch (error) {
        Alert.alert('','Incorrect Selection');
      }
    }
  };

  const rects = () => {
    let rectList = [{x:rect1X,y:rect1Y},{x:rect2X,y:rect2Y},{x:rect3X,y:rect3Y},{x:rect4X,y:rect4Y}];
    const items = rectList.map((rect,index) =>
      <Rect key={'rect-' + index}  style="stroke" strokeWidth={(index === selectedIndex) ? 6 : 4} x={rect.x} y={rect.y} width={rectWidth} height={rectWidth} color="lightblue" />
    );
    return items;
  };

  return (
    <>
      <GestureDetector gesture={composed}>
        <Canvas style={{ flex: 1 }}>
          <Fill color="white" />
          <Image image={image} fit="contain" x={0} y={0} width={width} height={height} />
          <Points
            points={polygonPoints}
            mode="polygon"
            color="lightblue"
            style="fill"
            strokeWidth={4}
          />
          {rects()}
        </Canvas>
      </GestureDetector>
      <TouchableOpacity
        style={[styles.button,styles.cancel]}
        onPress={cancel}
      >
        <Text>✕</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button,styles.confirm]}
        onPress={confirm}
      >
        <Text>✓</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position:'absolute',
    padding: 5,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  confirm:{
    backgroundColor: 'lightgreen',
    right: 25,
    bottom: 50,
  },
  cancel:{
    backgroundColor: 'red',
    right: 25,
    bottom: 125,
  },
});
