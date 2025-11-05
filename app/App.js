// App.js (최소 진입점)
import React from 'react';
import { SafeAreaView, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ApiProvider } from '../contexts/ApiProvider';
import useProjects from '../hooks/useProjects';
function HomeScreenInner(){
  const { projects, loading, create, update, load } = useProjects();

  return (
    <SafeAreaView style={styles.container}>
      <Button title="새 샘플 생성" onPress={() => create({ name: '새 병원', ward_count:1 })}/>
      <Button title="새로고침" onPress={load}/>
      {loading && <Text style={styles.info}>로딩중...</Text>}
      <FlatList
        data={projects}
        keyExtractor={i=>String(i.id)}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => update({...item, progress_stage: (item.progress_stage+1)%6})}
            style={styles.card}
          >
            <Text style={styles.title}>{item.name} <Text style={styles.code}>({item.code})</Text></Text>
            <Text>병동: {item.ward_count} / 병상: {item.bed_count} / GW: {item.gateway_count}</Text>
            <Text style={styles.stage}>단계: {item.progress_stage}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text style={styles.info}>프로젝트가 없습니다. 새로 만들기를 눌러보세요.</Text>}
      />
    </SafeAreaView>
  );
}

export default function App(){
  return (
    <ApiProvider useMock={true}>
      <HomeScreenInner />
    </ApiProvider>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, padding:12, backgroundColor:'#f6f7fb'},
  card:{padding:12, backgroundColor:'#fff', borderRadius:8, marginBottom:10, elevation:2},
  title:{fontWeight:'700', fontSize:16},
  code:{fontSize:12, color:'#666'},
  stage:{marginTop:8, color:'#0077cc', fontWeight:'600'},
  info:{padding:12, textAlign:'center', color:'#666'}
});
