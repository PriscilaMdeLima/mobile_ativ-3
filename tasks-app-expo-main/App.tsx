import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SectionList, 
  SafeAreaView, 
  Platform, 
  StatusBar as RNStatusBar, 
  Image, 
  Button, 
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { addTask, deleteTask, getAllTasks, updateTask, TaskItem as TaskItemType } from './src/utils/handle-api';
import { Feather, AntDesign } from '@expo/vector-icons';

/**
 * 1. Componente <TaskItem />
 * Extraído da lógica visual individual de uma tarefa.
 */
const TaskItem = ({ item, updateMode, deleteToDo }: { 
  item: TaskItemType, 
  updateMode: () => void, 
  deleteToDo: () => void 
}) => (
  <View style={styles.todo}>
    <Text style={styles.text}>{item.text}</Text>
    <View style={styles.icons}>
      <TouchableOpacity onPress={updateMode}>
        <Feather name="edit" size={20} color="#fff" style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={deleteToDo}>
        <AntDesign name="delete" size={20} color="#fff" style={styles.icon} />
      </TouchableOpacity>
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
  // Para o bônus da SectionList, vamos categorizar as tarefas.
  // Como o modelo original não tem 'status', vamos simular baseado em alguma lógica ou apenas mostrar a FlatList.
  // Se preferir FlatList simples:
  /*
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TaskItem 
          item={item} 
          updateMode={() => updateMode(item._id, item.text)} 
          deleteToDo={() => deleteToDo(item._id)} 
        />
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa encontrada.</Text>}
    />
  );
  */

  // Implementando SectionList como Bônus:
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
            // 2. Melhorias no TextInput
            maxLength={50}
            keyboardType="default"
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={
              isUpdating
                ? () => updateTask(taskId, text, setTasks, setText, setIsUpdating)
                : () => addTask(text, setText, setTasks)
            }
          >
            <Text style={styles.addButtonText}>
              {isUpdating ? "Atualizar" : "Adicionar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Uso do componente <TaskList /> que implementa SectionList/FlatList */}
        <View style={styles.listContainer}>
          <TaskList 
            tasks={tasks} 
            updateMode={updateMode} 
            deleteToDo={(id) => deleteTask(id, setTasks)} 
          />
        </View>

        {/* 2. Botão Nativo <Button /> */}
        <View style={styles.footer}>
          <Button 
            title="Limpar Lista" 
            onPress={handleDeleteAll} 
            color="#ff4444"
          />
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
    backgroundColor: '#007AFF',
    height: 45,
    paddingHorizontal: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  text: {
    color: '#333',
    fontSize: 16,
    flex: 1,
  },
  icons: {
    flexDirection: 'row',
    gap: 15,
    marginLeft: 15,
  },
  icon: {
    padding: 4,
  },
  footer: {
    marginVertical: 20,
  }
});
