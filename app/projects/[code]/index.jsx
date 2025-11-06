// app/projects/[code]/index.jsx
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialsCard from "../../../components/MaterialsCard";

export default function ProjectDetail() {
  const params = useLocalSearchParams() || {};
  const navigation = useNavigation();

  // 안전하게 파라미터 읽기
  const codeFromParams = params?.code ?? params?.projectCode ?? null;
  const nameFromParams = params?.projectName ?? null;

  // 방어적 초기값
  const [project, setProject] = useState({
    code: codeFromParams ?? "TEST001",
    name: nameFromParams ?? "임시 프로젝트",
  });

  useEffect(() => {
    // params가 바뀌면 업데이트 (비동기 fetch 대체 가능)
    setProject((p) => ({
      code: codeFromParams ?? p.code,
      name: nameFromParams ?? p.name,
    }));
  }, [codeFromParams, nameFromParams]);

  // 안전하게 네비 타이틀 설정
  useLayoutEffect(() => {
    try {
      navigation.setOptions?.({ title: project?.name ?? "프로젝트 상세" });
    } catch (e) {
      // 네비가 없거나 setOptions가 없으면 무시
    }
  }, [project?.name, navigation]);

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{project?.name ?? "프로젝트 상세"}</Text>
        <Text style={styles.subtitle}>코드: {project?.code ?? "—"}</Text>
      </View>

      <MaterialsCard projectCode={project?.code ?? "TEST001"} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#f6f7fb" },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
});
