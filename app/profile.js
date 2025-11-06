// app/profile.js
import { StyleSheet, Text, View } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>내정보</Text>
      <Text style={styles.desc}>여기에 사용자 프로필 정보를 표시하세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:20, fontWeight:'700', marginBottom:8 },
  desc: { color:'#666' }
});
