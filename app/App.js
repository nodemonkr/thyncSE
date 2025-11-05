// app/Main.js
import { useState } from 'react';
import { Alert, Button, FlatList, Platform, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import CreateProjectModal from '../components/CreateProjectModal';
import ProjectCard from '../components/ProjectCard';
import useProjects from '../hooks/useProjects';

export default function MainWrapper() {
  // SafeAreaProvider는 앱 루트에 한 번만 있어도 되지만,
  // 이 파일만 수정해서 안전영역을 적용하려면 여기서 감싸는 것이 가장 빠름.
  return (
    <SafeAreaProvider>
      <MainContent />
    </SafeAreaProvider>
  );
}

function MainContent() {
  const { projects, loading, create } = useProjects();
  const [createVisible, setCreateVisible] = useState(false);
  const insets = useSafeAreaInsets();

  async function handleCreate(payload) {
    const created = await create(payload);
    return created;
  }

  function onModalClose(created, err) {
    setCreateVisible(false);
    if (err) {
      Alert.alert('오류', err.message || '프로젝트 생성에 실패했습니다.');
      return;
    }
    if (created) {
      Alert.alert('생성 완료', `프로젝트가 생성되었습니다.\n고유 코드: ${created.code}`);
    }
  }

  const renderItem = ({ item }) => (
    <ProjectCard
      project={item}
      onPress={(p) => Alert.alert(p.name, `코드: ${p.code}`)}
    />
  );

  return (
    // SafeAreaView로 상/하 영역을 자동으로 피하면서 전체 배경을 잡음
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }} edges={['top', 'bottom']}>
      {/* 상단 여백: insets.top을 반영해 콘텐츠가 상태바/노치와 겹치지 않도록 한다 */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12 + (Platform.OS === 'android' ? insets.top : 0) }}>
        <Button title="프로젝트 생성" onPress={() => setCreateVisible(true)} />
      </View>

      {loading ? (
        <Text style={{ padding: 16 }}>로딩중...</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          // FlatList 컨테이너 패딩에 하단 insets를 포함시켜 소프트바 위로 리스트가 올라오지 않게 함
          contentContainerStyle={{
            paddingHorizontal: 4,
            paddingTop: 12,
            paddingBottom: 30 + insets.bottom,
          }}
          ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#666' }}>생성된 프로젝트가 없습니다. 버튼으로 새 프로젝트를 만들어보세요.</Text>
            </View>
          )}
        />
      )}

      <CreateProjectModal
        visible={createVisible}
        onClose={(created, err) => onModalClose(created, err)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}
