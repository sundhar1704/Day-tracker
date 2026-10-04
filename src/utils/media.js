import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Returns a data-URI (so the photo survives app restarts) or null
export async function pickPhoto(source, { edit = true } = {}) {
  try {
    const opts = edit ? { allowsEditing: true, aspect: [1, 1], quality: 0.4, base64: true } : { quality: 0.35, base64: true };
    let r;
    if (source === 'camera') {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert('Camera permission needed', 'Allow camera access in your phone settings.'); return null; }
      r = await ImagePicker.launchCameraAsync(opts);
    } else {
      r = await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (r.canceled || !r.assets?.[0]?.base64) return null;
    return `data:image/jpeg;base64,${r.assets[0].base64}`;
  } catch (e) {
    Alert.alert('Could not open photos', 'Please try again.');
    return null;
  }
}

export function choosePhoto(onPicked, title = 'Profile photo', opts) {
  Alert.alert(title, 'Choose a source', [
    { text: 'Take Photo', onPress: async () => { const p = await pickPhoto('camera', opts); if (p) onPicked(p); } },
    { text: 'Choose from Gallery', onPress: async () => { const p = await pickPhoto('gallery', opts); if (p) onPicked(p); } },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
