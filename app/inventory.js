// app/inventory.js
import { StyleSheet, Text, View } from 'react-native';

export default function Inventory() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>재고관리</Text>
      <Text style={styles.desc}>재고 목록 / 관리 UI를 여기에 구현하세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:20, fontWeight:'700', marginBottom:8 },
  desc: { color:'#666' }
});
