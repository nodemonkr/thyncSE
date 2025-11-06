// app/projects/_layout.jsx
import { Stack } from "expo-router";

export default function ProjectsLayout() {
  // 빈 Stack 반환: 각 페이지에서 제목을 직접 설정하도록 변경 (더 안전)
  return <Stack screenOptions={{ headerShown: false }} />;
}
