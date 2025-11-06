// app/index.js
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>홈</Text>
      <Text style={styles.desc}>여기는 홈 화면입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:24, fontWeight:'700', marginBottom:8 },
  desc: { color:'#666' }
});
