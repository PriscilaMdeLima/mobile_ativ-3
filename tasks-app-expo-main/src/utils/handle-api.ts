import axios from 'axios';
import React from 'react';

const baseURL = 'https://todo-app-express-backend-rtbt.onrender.com';

export interface TaskItem {
  _id: string;
  text: string;
}

export const getAllTasks = (setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>) => {
  axios.get<TaskItem[]>(`${baseURL}`).then(({ data }) => {
    setTasks(data);
  }).catch((err) => console.log(err));
};

export const addTask = (
  text: string,
  setText: React.Dispatch<React.SetStateAction<string>>,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>
) => {
  axios
    .post(`${baseURL}/save`, { text })
    .then(() => {
      setText('');
      getAllTasks(setTasks);
    })
    .catch((err) => console.log(err));
};

export const updateTask = (
  taskId: string,
  text: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
  setText: React.Dispatch<React.SetStateAction<string>>,
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>
) => {
  axios
    .post(`${baseURL}/update`, { _id: taskId, text })
    .then(() => {
      setText('');
      setIsUpdating(false);
      getAllTasks(setTasks);
    })
    .catch((err) => console.log(err));
};

export const deleteTask = (
  _id: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>
) => {
  axios
    .post(`${baseURL}/delete`, { _id })
    .then(() => {
      getAllTasks(setTasks);
    })
    .catch((err) => console.log(err));
};
