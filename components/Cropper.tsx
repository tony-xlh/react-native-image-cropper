/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import { BackHandler, useWindowDimensions} from 'react-native';
import { Canvas, Fill, Image, Points, Rect, SkPoint, useImage, vec  } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export interface Photo {
  photoUri:string;
  photoWidth:number;
  photoHeight:number;
}

export interface CropperProps{
  photo?:Photo,
  onCanceled?: () => void;
  onConfirmed?: (base64:string) => void;
}
export interface Point {
  x: number;
  y: number;
}

export default function Cropper(props:CropperProps) {
  const image = useImage(props.photo!.photoUri);
  const { width, height } = useWindowDimensions();
  const x1 = useSharedValue(100);
  const y1 = useSharedValue(50);
  const x2 = useSharedValue(200);
  const y2 = useSharedValue(50);
  const x3 = useSharedValue(200);
  const y3 = useSharedValue(100);
  const x4 = useSharedValue(100);
  const y4 = useSharedValue(100);
  const selectedIndex = useSharedValue(-1);
  const rectWidth = 10;
  const rect1X = useDerivedValue(() => {
    return x1.value - rectWidth;
  },[x1]);
  const rect1Y = useDerivedValue(() => {
    return y1.value - rectWidth;
  },[y1]);
  const rect2X = useDerivedValue(() => {
    return x2.value;
  },[x2]);
  const rect2Y = useDerivedValue(() => {
    return y2.value - rectWidth;
  },[y2]);
  const rect3X = useDerivedValue(() => {
    return x3.value;
  },[x3]);
  const rect3Y = useDerivedValue(() => {
    return y3.value;
  },[y3]);
  const rect4X = useDerivedValue(() => {
    return x4.value - rectWidth;
  },[x4]);
  const rect4Y = useDerivedValue(() => {
    return y4.value;
  },[y4]);
  const points = useDerivedValue(() => {
    let newPoints = [
      vec(x1.value,y1.value),
      vec(x2.value,y2.value),
      vec(x3.value,y3.value),
      vec(x4.value,y4.value),
      vec(x1.value,y1.value),
    ];
    return newPoints;
  },[x1,y1,x2,y2,x3,y3,x4,y4]);

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

    return () => backHandler.remove();
  }, []);


  const panGesture = Gesture.Pan()
    .onChange((e) => {
      let x,y;
      if (selectedIndex.value === 0) {
        x = x1;
        y = y1;
      }else if (selectedIndex.value === 1) {
        x = x2;
        y = y2;
      }else if (selectedIndex.value === 2) {
        x = x3;
        y = y3;
      }else if (selectedIndex.value === 3) {
        x = x4;
        y = y4;
      }
      if (x && y) {
        x.value = x.value + e.changeX;
        y.value = y.value + e.changeY;
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin((e) => {
      console.log(e);
      const selectRect = () => {
        let rectList = [{x:rect1X,y:rect1Y},{x:rect2X,y:rect2Y},{x:rect3X,y:rect3Y},{x:rect4X,y:rect4Y}];
        for (let index = 0; index < 4; index++) {
          const rect = rectList[index];
          console.log(rect);
        }
      };
      selectedIndex.value = 3;
      selectRect();
    });

  const composed = Gesture.Simultaneous(tapGesture, panGesture);

  const rects = () => {
    let rectList = [{x:rect1X,y:rect1Y},{x:rect2X,y:rect2Y},{x:rect3X,y:rect3Y},{x:rect4X,y:rect4Y}];
    const items = rectList.map((rect,index) =>
      <Rect key={'rect-' + index}  style="stroke" strokeWidth={4} x={rect.x} y={rect.y} width={rectWidth} height={rectWidth} color="lightblue" />
    );
    return items;
  };

  return (
    <GestureDetector gesture={composed}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Image image={image} fit="contain" x={0} y={0} width={width} height={height} />
        <Points
          points={points}
          mode="polygon"
          color="lightblue"
          style="fill"
          strokeWidth={4}
        />
        {rects()}
      </Canvas>
    </GestureDetector>
  );
}

