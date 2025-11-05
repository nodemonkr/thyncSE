// components/ProjectCard.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProjectCard({ project, onPress }) {
  const firstChar = project.name ? project.name.charAt(0).toUpperCase() : '?';
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onPress && onPress(project)}>
      <View style={styles.left}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{firstChar}</Text></View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.sub}>{project.createdAt ? new Date(project.createdAt).toLocaleString() : ''}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{project.code}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    // 안드로이드 그림자
    elevation: 3,
    // iOS 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginHorizontal: 8,
  },
  left: { marginRight: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#eaf0ff', alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#2b6ef6' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  sub: { fontSize: 12, color: '#777', marginTop: 4 },
  right: { marginLeft: 8 },
  codeBadge: { backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  codeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
