// app/projects/_layout.jsx
import { Stack } from 'expo-router';

export default function ProjectsLayout() {
  // headerShown: false 로 하면 각 화면이 자체적으로 제목(헤더)을 가질 수 있습니다.
  return <Stack screenOptions={{ headerShown: false }} />;
}
