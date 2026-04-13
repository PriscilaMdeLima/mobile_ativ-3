import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  SectionList, 
  SafeAreaView, 
  Platform, 
  StatusBar as RNStatusBar, 
  Image, 
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { addTask, deleteTask, getAllTasks, updateTask, TaskItem as TaskItemType } from './src/utils/handle-api';
import { Feather, AntDesign } from '@expo/vector-icons';

/**
 * 1. Componente <TaskItem />
 * Extraído da lógica visual individual de uma tarefa.
 * Atualizado para usar Pressable com efeitos de toque nos ícones.
 */
const TaskItem = ({ item, updateMode, deleteToDo }: { 
  item: TaskItemType, 
  updateMode: () => void, 
  deleteToDo: () => void 
}) => (
  <View style={styles.todo}>
    <Text style={styles.text}>{item.text}</Text>
    <View style={styles.icons}>
      <Pressable 
        onPress={updateMode}
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor: '#4CAF50',
            transform: [{ scale: pressed ? 0.92 : 1 }],
            opacity: pressed ? 0.8 : 1,
          }
        ]}
      >
        <Feather name="edit" size={18} color="#fff" />
      </Pressable>
      
      <Pressable 
        onPress={deleteToDo}
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor: '#f44336',
            transform: [{ scale: pressed ? 0.92 : 1 }],
            opacity: pressed ? 0.8 : 1,
          }
        ]}
      >
        <AntDesign name="delete" size={18} color="#fff" />
      </Pressable>
    </View>
  </View>
);

/**
 * 1. Componente <TaskList />
 * Responsável por conter a lista inteira.
 * Implementa SectionList (Bônus) para categorizar tarefas.
 */
const TaskList = ({ tasks, updateMode, deleteToDo }: { 
  tasks: TaskItemType[], 
  updateMode: (id: string, text: string) => void, 
  deleteToDo: (id: string) => void 
}) => {
  const sections = [
    {
      title: 'Suas Tarefas',
      data: tasks,
    }
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TaskItem 
          item={item} 
          updateMode={() => updateMode(item._id, item.text)} 
          deleteToDo={() => deleteToDo(item._id)} 
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa para exibir.</Text>}
    />
  );
};

export default function App() {
  const [tasks, setTasks] = useState<TaskItemType[]>([]);
  const [text, setText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskId, setTaskId] = useState("");

  useEffect(() => {
    getAllTasks(setTasks);
  }, []);

  const updateMode = (_id: string, text: string) => {
    setIsUpdating(true);
    setText(text);
    setTaskId(_id);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Excluir Tudo",
      "Tem certeza que deseja apagar todas as tarefas?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => setTasks([]), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* 2. Imagem de Cabeçalho */}
        <Image 
          source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }} 
          style={styles.logo}
        />

        <Text style={styles.header}>Minhas Tarefas</Text>
        
        {/* 3. Feedback Visual com <Text /> (Total de tarefas) */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>Total: {tasks.length} tarefas</Text>
        </View>

        <View style={styles.top}>
          <TextInput
            style={styles.input}
            placeholder="O que precisa ser feito?"
            value={text}
            onChangeText={(val) => setText(val)}
            maxLength={50}
            keyboardType="default"
            placeholderTextColor="#888"
          />

          <Pressable
            onPress={
              isUpdating
                ? () => updateTask(taskId, text, setTasks, setText, setIsUpdating)
                : () => addTask(text, setText, setTasks)
            }
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: isUpdating ? '#4CAF50' : '#007AFF',
                transform: [{ scale: pressed ? 0.98 : 1 }],
                elevation: pressed ? 2 : 5,
                shadowOffset: pressed ? { width: 0, height: 1 } : { width: 0, height: 3 },
              }
            ]}
          >
            <Text style={styles.addButtonText}>
              {isUpdating ? "Atualizar" : "Adicionar"}
            </Text>
          </Pressable>
        </View>

        {/* 1. Uso do componente <TaskList /> que implementa SectionList/FlatList */}
        <View style={styles.listContainer}>
          <TaskList 
            tasks={tasks} 
            updateMode={updateMode} 
            deleteToDo={(id) => deleteTask(id, setTasks)} 
          />
        </View>

        {/* 2. Botão Modernizado com Pressable substituindo o <Button /> Nativo */}
        <View style={styles.footer}>
          <Pressable 
            onPress={handleDeleteAll}
            style={({ pressed }) => [
              styles.clearButton,
              {
                transform: [{ scale: pressed ? 0.98 : 1 }],
                elevation: pressed ? 1 : 3,
                backgroundColor: pressed ? '#d32f2f' : '#ff4444',
              }
            ]}
          >
            <Text style={styles.clearButtonText}>Limpar Lista</Text>
          </Pressable>
        </View>

      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginTop: 20,
  },
  header: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  top: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addButton: {
    height: 45,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
  todo: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    color: '#333',
    fontSize: 16,
    flex: 1,
  },
  icons: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 15,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  clearButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
