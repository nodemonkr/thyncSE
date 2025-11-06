// app/projects/index.js
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Projects() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>프로젝트</Text>
      <Text style={styles.desc}>프로젝트 목록(임시)</Text>
      <Button title="새 프로젝트" onPress={() => { /* 네비 동작 테스트용 */ }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:20, fontWeight:'700', marginBottom:8 },
  desc: { color:'#666' }
});
