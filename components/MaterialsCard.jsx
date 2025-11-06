// components/MaterialsCard.jsx
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * 항목들: 유비쿼스 8포트 / 24포트 / 48포트 (요청대로)
 * 동작: 로컬 상태(임시)로 저장 → 나중에 upsert 로직으로 대체 가능
 */

const DEFAULT_ITEMS = [
  { key: "ubiquoss_8", label: "유비쿼스 8포트 스위치", qty: 0 },
  { key: "ubiquoss_24", label: "유비쿼스 24포트 스위치", qty: 0 },
  { key: "ubiquoss_48", label: "유비쿼스 48포트 스위치", qty: 0 },
];

export default function MaterialsCard({ projectCode }) {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    // 임시: 프로젝트별로 로컬 초기값을 다르게 하고 싶으면 여기서 분기 가능
    setItems(DEFAULT_ITEMS);
  }, [projectCode]);

  const inc = (k) => setItems((s) => s.map(i => i.key === k ? {...i, qty: i.qty + 1} : i));
  const dec = (k) => setItems((s) => s.map(i => i.key === k ? {...i, qty: Math.max(0, i.qty - 1)} : i));
  const setQty = (k, value) => {
    const n = parseInt(value || "0");
    setItems((s)=> s.map(i=> i.key===k ? {...i, qty: isNaN(n)?0:n} : i));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>납품 자재</Text>
        <TouchableOpacity onPress={()=> setEditing(!editing)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>{editing ? "완료" : "편집"}</Text>
        </TouchableOpacity>
      </View>

      {items.map(item => (
        <View key={item.key} style={styles.row}>
          <View style={{flex:1}}>
            <Text style={styles.label}>{item.label}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={()=>dec(item.key)} disabled={!editing} style={styles.qtyBtn}><Text style={styles.qtyTxt}>−</Text></TouchableOpacity>

            <TextInput
              value={String(item.qty)}
              editable={editing}
              keyboardType="number-pad"
              onChangeText={(t) => setQty(item.key, t)}
              style={styles.qtyInput}
            />

            <TouchableOpacity onPress={()=>inc(item.key)} disabled={!editing} style={styles.qtyBtn}><Text style={styles.qtyTxt}>＋</Text></TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.note}>※ 임시 데이터(저장 시 DB 연동 로직으로 대체 가능)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:"#fff", borderRadius:12, padding:12, shadowColor:"#000", shadowOpacity:0.06, elevation:2, marginBottom:12 },
  cardHeader: {flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:8},
  cardTitle:{fontSize:16,fontWeight:"700"},
  editBtn:{paddingHorizontal:8,paddingVertical:4,borderRadius:8,backgroundColor:"#eef2ff"},
  editBtnText:{color:"#3730a3",fontWeight:"600"},

  row:{flexDirection:"row",alignItems:"center",paddingVertical:10,borderBottomWidth:1,borderBottomColor:"#f1f1f1"},
  label:{fontSize:14},

  controls:{flexDirection:"row",alignItems:"center"},
  qtyBtn:{width:36,height:36,borderRadius:8,alignItems:"center",justifyContent:"center",backgroundColor:"#f3f4f6",marginHorizontal:6},
  qtyTxt:{fontSize:20,fontWeight:"600"},
  qtyInput:{width:56,textAlign:"center",fontSize:14,padding:8,borderRadius:8,backgroundColor:"#fafafa"},

  footer:{marginTop:8,alignItems:"flex-start"},
  note:{fontSize:12,color:"#777"}
});
