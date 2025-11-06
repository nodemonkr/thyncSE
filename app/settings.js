// app/settings.js
import { StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>설정</Text>
      <Text style={styles.desc}>환경설정 화면(임시)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:20, fontWeight:'700', marginBottom:8 },
  desc: { color:'#666' }
});
