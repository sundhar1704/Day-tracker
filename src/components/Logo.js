import React from 'react';
import { Image } from 'react-native';

// Your own logo: assets/image.png
export default function Logo({ size = 40, style }) {
  return <Image source={require('../../assets/image.png')} style={[{ width: size, height: size }, style]} resizeMode="contain" />;
}
