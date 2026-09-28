// Platformlar arası iletişim kutuları.
//
// react-native-web'de `Alert.alert` hiçbir şey yapmaz: ne kutu çıkar ne de
// düğmelerin onPress'i çalışır. Ayarlar'daki "Koç hafızasını sıfırla" bu
// yüzden web'de sessizce hiçbir şey silmiyordu. Web'de tarayıcının yerel
// alert/confirm'üne düşüyoruz; native'de Alert.alert olduğu gibi kalıyor.
import { Alert, Platform } from 'react-native';

export function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(opts: {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return Promise.resolve(false);
    return Promise.resolve(window.confirm(`${opts.title}\n\n${opts.message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      opts.title,
      opts.message,
      [
        { text: opts.cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: opts.confirmText, style: opts.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
