// components/ProjectCard.js
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ORANGE = '#ff7a18';

export default function ProjectCard({ item, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(item)}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>코드: <Text style={{ fontWeight: '700' }}>{item.code}</Text></Text>
          <Text style={styles.meta}>{item.wards} 병동 · {item.beds} 병상 · {item.gateways} 게이트웨이</Text>
        </View>
        <View style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => onDelete && onDelete(item)} style={styles.delBtn}>
            <MaterialIcons name="delete-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: ORANGE,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#666', fontSize: 13 },
  meta: { color: '#999', marginTop: 6, fontSize: 12 },
  delBtn: {
    backgroundColor: ORANGE,
    padding: 8,
    borderRadius: 8,
  },
});
