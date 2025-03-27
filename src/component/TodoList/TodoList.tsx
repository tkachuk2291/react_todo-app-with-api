import { Todo } from '../../types/Todo';
import React from 'react';
import { TodoItem } from '../TodoItem/TodoItem';

export interface TodoListProps {
  filteredTodos: Todo[];
  tempTodo: Todo | null;
  isLoading: boolean;
  loadingTodoIds: number[];
  deleteTodo: (todoId: number) => void;
  setTodos : React.Dispatch<React.SetStateAction<Todo[]>>;
  setIsLoading : React.Dispatch<React.SetStateAction<boolean>>;


}

export const TodoList: React.FC<TodoListProps> = ({
  filteredTodos,
  tempTodo,
  isLoading,
  deleteTodo,
  loadingTodoIds,setTodos , setIsLoading

}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      <div data-cy="Todo" className="todo">
        <label className="todo__status-label">
          <input
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
          />
        </label>

        {/* This form is shown instead of the title and remove button */}
        <form>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value="Todo is being edited now"
          />
        </form>

        <div data-cy="TodoLoader" className="modal overlay">
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      </div>
      {/*This is a completed todo */}
      {filteredTodos.map(todo => {
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              deleteTodo={deleteTodo}
              isLoading={loadingTodoIds.includes(todo.id)}
              setTodos={setTodos}
              setIsLoading={setIsLoading}
            />
          );

        }
      )
      }
      {tempTodo !== null && (
        <TodoItem
          key={tempTodo.id}
          todo={tempTodo}
          isLoading={isLoading}
          setTodos={setTodos}
          setIsLoading={setIsLoading}
        />
      )}

    </section>
  );
};
