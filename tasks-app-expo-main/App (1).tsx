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
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Checkbox from 'expo-checkbox';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { addTask, deleteTask, getAllTasks, updateTask, TaskItem as TaskItemType } from './src/utils/handle-api';
import { Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Componente <TaskItem />
 * Atualizado para mostrar o status de conclusão e a data limite.
 */
const TaskItem = ({ item, updateMode, deleteToDo }: { 
  item: TaskItemType, 
  updateMode: () => void, 
  deleteToDo: () => void 
}) => (
  <View style={[styles.todo, item.completed && styles.todoCompleted]}>
    <View style={styles.todoContent}>
      <View style={styles.todoHeader}>
        <MaterialCommunityIcons 
          name={item.completed ? "checkbox-marked-circle" : "circle-outline"} 
          size={20} 
          color={item.completed ? "#4CAF50" : "#999"} 
        />
        <Text style={[styles.text, item.completed && styles.textCompleted]}>
          {item.text}
        </Text>
      </View>
      
      {item.dueDate && (
        <View style={styles.dateBadge}>
          <Feather name="calendar" size={12} color="#666" />
          <Text style={styles.dateText}>
            {new Date(item.dueDate).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}
    </View>

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
  updateMode: (id: string, text: string, completed: boolean, dueDate: string | null) => void, 
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
          updateMode={() => updateMode(item._id, item.text, item.completed || false, item.dueDate || null)} 
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
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    getAllTasks(setTasks);
  }, []);

  const openAddModal = () => {
    setIsUpdating(false);
    setText("");
    setCompleted(false);
    setDueDate(null);
    setModalVisible(true);
  };

  const updateMode = (_id: string, text: string, completed: boolean, dueDateStr: string | null) => {
    setIsUpdating(true);
    setText(text);
    setCompleted(completed);
    setDueDate(dueDateStr ? new Date(dueDateStr) : null);
    setTaskId(_id);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (text.trim() === "") {
      Alert.alert("Atenção", "O texto da tarefa não pode estar vazio.");
      return;
    }

    const dueDateISO = dueDate ? dueDate.toISOString() : null;

    if (isUpdating) {
      updateTask(taskId, text, completed, dueDateISO, setTasks, setText, setIsUpdating);
    } else {
      addTask(text, completed, dueDateISO, setText, setTasks);
    }
    setModalVisible(false);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
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

        <View style={styles.listContainer}>
          <TaskList 
            tasks={tasks} 
            updateMode={updateMode} 
            deleteToDo={(id) => deleteTask(id, setTasks)} 
          />
        </View>

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
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isUpdating ? "Editar Tarefa" : "Nova Tarefa"}
                  </Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </Pressable>
                </View>

                <Text style={styles.label}>O que precisa ser feito?</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Estudar React Native"
                  value={text}
                  onChangeText={setText}
                  maxLength={50}
                  placeholderTextColor="#999"
                />

                <View style={styles.formRow}>
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      value={completed}
                      onValueChange={setCompleted}
                      color={completed ? '#4CAF50' : undefined}
                      style={styles.checkbox}
                    />
                    <Text style={styles.checkboxLabel}>Concluída</Text>
                  </View>
                </View>

                <Text style={styles.label}>Data Limite</Text>
                <Pressable 
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerTrigger}
                >
                  <Feather name="calendar" size={18} color="#007AFF" />
                  <Text style={styles.datePickerText}>
                    {dueDate ? dueDate.toLocaleDateString('pt-BR') : "Selecionar Data"}
                  </Text>
                  {dueDate && (
                    <Pressable onPress={() => setDueDate(null)}>
                      <Ionicons name="close-circle" size={18} color="#999" />
                    </Pressable>
                  )}
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}

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
              </ScrollView>
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
    paddingBottom: 100,
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
  todoCompleted: {
    backgroundColor: '#f9f9f9',
    opacity: 0.8,
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    color: '#333',
    fontSize: 16,
    flex: 1,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginLeft: 30,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#666',
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    borderRadius: 4,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 30,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
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
    fontWeight: 'bold',
  },
  modalBtnTextSave: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
