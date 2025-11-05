// app/Main.js
import { useState } from 'react';
import { Alert, Button, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectCard from '../components/ProjectCard';
import useProjects from '../hooks/useProjects';

export default function Main() {
  const { projects, loading, create } = useProjects();
  const [createVisible, setCreateVisible] = useState(false);

  async function handleCreate(payload) {
    const created = await create(payload);
    return created;
  }

  function onModalClose(created, err) {
    setCreateVisible(false);
    if (err) return Alert.alert('오류', err.message || '프로젝트 생성에 실패했습니다.');
    if (created) Alert.alert('생성 완료', `고유 코드: ${created.code}`);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <Button title="프로젝트 생성" onPress={() => setCreateVisible(true)} />
      </View>

      {loading ? <Text style={{ padding: 16 }}>로딩중...</Text> : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 30, paddingTop: 12 }}
          renderItem={({ item }) => <ProjectCard project={item} />}
          ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#666' }}>생성된 프로젝트가 없습니다.</Text>
            </View>
          )}
        />
      )}

      <CreateProjectModal visible={createVisible} onClose={onModalClose} onCreate={handleCreate} />
    </SafeAreaView>
  );
}
