/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { BackHandler, useWindowDimensions} from 'react-native';
import { Canvas, Fill, Image, Points, Rect, useImage, vec  } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

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
  const [points,setPoints] = useState<[Point,Point,Point,Point]>([{x:100,y:50},{x:200,y:50},{x:200,y:100},{x:100,y:100}]);

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

  const getPoints = () => {
    let newPoints = [
      vec(points[0].x,points[0].y),
      vec(points[1].x,points[1].y),
      vec(points[2].x,points[2].y),
      vec(points[3].x,points[3].y),
      vec(points[0].x,points[0].y),
    ];
    return newPoints;
  };

  const panGesture = Gesture.Pan()
    .onChange((e) => {
      console.log(e);
      console.log(points);
      let newPoints:[Point,Point,Point,Point] = points;
      newPoints[0].x = newPoints[0].x + e.changeX;
      newPoints[0].y = newPoints[0].y + e.changeY;
      runOnJS(setPoints)(newPoints);
    });

  const tapGesture = Gesture.Tap()
    .onBegin((e) => {
      console.log(e);
    });

  const composed = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composed}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Image image={image} fit="contain" x={0} y={0} width={width} height={height} />
        <Points
          points={getPoints()}
          mode="polygon"
          color="lightblue"
          style="fill"
          strokeWidth={4}
        />
        <Rect style="stroke" strokeWidth={4} x={points[0].x - 10} y={points[0].y - 10} width={10} height={10} color="lightblue" />
      </Canvas>
    </GestureDetector>
  );
}

