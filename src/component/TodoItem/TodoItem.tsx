import { Todo } from '../../types/Todo';
import cls from 'classnames';
import React, { useState } from 'react';
import { TodoLoader } from '../TodoLoader/TodoLoader';
import { updateTodosCheckbox } from '../../api/todos';

export interface TodoItemProps {
  todo: Todo;
  isLoading?: boolean;
  deleteTodo?: (todoId: number) => void;
  setTodos : React.Dispatch<React.SetStateAction<Todo[]>>;
  setIsLoading : React.Dispatch<React.SetStateAction<boolean>>;


}



export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isLoading,
  deleteTodo, setTodos , setIsLoading
}) => {

  const [status  , setStatus] = useState(false)
  const [statusTodo , setStatusTodo] = useState(todo.completed)
  function updateCheckbox(updatedTodo : Todo , completed_status : boolean){
    setStatus(true)
    setIsLoading(true);
    return updateTodosCheckbox(updatedTodo , completed_status)
      .then((todo: Todo) => setTodos?.((currentPost) => {
        const newTodos = [...currentPost]
          const index = newTodos.findIndex(todo => todo.id === updatedTodo.id )
          newTodos.splice(index , 1 , todo )
          return newTodos
        })
      )
      .finally(() => setStatus(false))
  }

  console.log(isLoading , "ЧТО ПРИШЛО")



  return (
    <div data-cy="Todo" className={cls('todo', { completed: todo.completed })}>
      {(isLoading  || status)&& <TodoLoader />}

      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={statusTodo}
          disabled={isLoading}
          onChange={() => {
            setStatusTodo((prevState) => {
              const newStatus = !prevState;
              updateCheckbox(todo, newStatus)
                ?.then(() => {
                  setStatusTodo(newStatus);
                  console.log('успешно' , todo)
                })
                .catch((error) => console.error("Update failed", error));
              return newStatus;
            });
          }}
        />
      </label>


      <span data-cy="TodoTitle" className="todo__title">
        {todo.title}
      </span>

      {/* Remove button appears only on hover */}
      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => deleteTodo?.(todo.id)}
      >
        ×
      </button>

      {/* overlay will cover the todo while it is being deleted or updated */}
      <div data-cy="TodoLoader" className="modal overlay">
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
