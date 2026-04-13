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
  Alert,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { addTask, deleteTask, getAllTasks, updateTask, TaskItem as TaskItemType } from './src/utils/handle-api';
import { Feather, AntDesign, Ionicons } from '@expo/vector-icons';

/**
 * Componente <TaskItem />
 * Atualizado para abrir o modal ao editar.
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
 * Componente <TaskList />
 */
const TaskList = ({ tasks, updateMode, deleteToDo }: { 
  tasks: TaskItemType[], 
  updateMode: (id: string, text: string) => void, 
  deleteToDo: (id: string) => void 
}) => {
  const sections = [{ title: 'Suas Tarefas', data: tasks }];

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
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getAllTasks(setTasks);
  }, []);

  const openAddModal = () => {
    setIsUpdating(false);
    setText("");
    setModalVisible(true);
  };

  const updateMode = (_id: string, text: string) => {
    setIsUpdating(true);
    setText(text);
    setTaskId(_id);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (text.trim() === "") {
      Alert.alert("Atenção", "O texto da tarefa não pode estar vazio.");
      return;
    }

    if (isUpdating) {
      updateTask(taskId, text, setTasks, setText, setIsUpdating);
    } else {
      addTask(text, setText, setTasks);
    }
    setModalVisible(false);
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
        
        <Image 
          source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }} 
          style={styles.logo}
        />

        <Text style={styles.header}>Minhas Tarefas</Text>
        
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>Total: {tasks.length} tarefas</Text>
        </View>

        {/* Lista de Tarefas */}
        <View style={styles.listContainer}>
          <TaskList 
            tasks={tasks} 
            updateMode={updateMode} 
            deleteToDo={(id) => deleteTask(id, setTasks)} 
          />
        </View>

        {/* Área de Ações Inferior */}
        <View style={styles.footerActions}>
          <Pressable 
            onPress={openAddModal}
            style={({ pressed }) => [
              styles.actionButton,
              styles.newButton,
              { transform: [{ scale: pressed ? 0.98 : 1 }], elevation: pressed ? 2 : 4 }
            ]}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Nova Tarefa</Text>
          </Pressable>

          <Pressable 
            onPress={handleDeleteAll}
            style={({ pressed }) => [
              styles.actionButton,
              styles.clearAllButton,
              { transform: [{ scale: pressed ? 0.98 : 1 }], elevation: pressed ? 2 : 4 }
            ]}
          >
            <AntDesign name="delete" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Limpar Tudo</Text>
          </Pressable>
        </View>

        {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isUpdating ? "Editar Tarefa" : "Nova Tarefa"}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="O que precisa ser feito?"
                value={text}
                onChangeText={setText}
                maxLength={50}
                autoFocus={true}
                placeholderTextColor="#999"
              />

              <View style={styles.modalFooter}>
                <Pressable 
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                >
                  <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
                </Pressable>

                <Pressable 
                  onPress={handleSave}
                  style={({ pressed }) => [
                    styles.modalBtn, 
                    styles.modalBtnSave,
                    { opacity: pressed ? 0.8 : 1 }
                  ]}
                >
                  <Text style={styles.modalBtnTextSave}>
                    {isUpdating ? "Atualizar" : "Salvar"}
                  </Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

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
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 100, // Espaço para os botões fixos no rodapé
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
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  newButton: {
    backgroundColor: '#007AFF',
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // ESTILOS DO MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 25,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalBtnSave: {
    backgroundColor: '#007AFF',
  },
  modalBtnTextCancel: {
    color: '#666',
    fontWeight: '600',
  },
  modalBtnTextSave: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
