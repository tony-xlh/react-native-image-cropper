/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import { BackHandler, useWindowDimensions} from 'react-native';
import { Canvas, Fill, Image, Points, Rect, SkPoint, useImage, vec  } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';

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
  const selectedIndex = useSharedValue(-1);
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

    return () => backHandler.remove();
  }, []);


  const panGesture = Gesture.Pan()
    .onChange((e) => {
      let index = selectedIndex.value;
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
            selectedIndex.value = index;
            break;
          }
        }
      };
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
          points={polygonPoints}
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

