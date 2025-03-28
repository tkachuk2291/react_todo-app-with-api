/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  deleteTodos,
  getTodos,
  updateTodosCheckbox,
  updateTodoTitleOnServer,
  USER_ID,
} from './api/todos';
import { Errors } from './types/Todo';
import { TodoHeader } from './component/TodoHeader/TodoHeader';
import { TodoFooter } from './component/TodoFooter/TodoFooter';
import { Status } from './types/Status';
import { TodoList } from './component/TodoList/TodoList';
import { TodoErrorNotification } from './component/TodoErrorNotification/TodoErrorNotification';

export const App: React.FC = () => {
  interface Todo {
    id: number;
    userId: number;
    title: string;
    completed: boolean;
  }

  const [hasTitleError, setHasTitleError] = useState(false);
  const [loadTodoError, setLoadTodoError] = useState(false);
  const [addTodoError, setAddTodoError] = useState(false);
  const [deleteTodoError, setDeleteTodoError] = useState(false);
  const [updateTodoError, setUpdateTodoError] = useState(false);


  function handleError(type: string, boolean: boolean) {
    switch (type) {
      case 'hasTitleError':
        setHasTitleError(boolean);
        break;
      case 'loadTodoError':
        setLoadTodoError(boolean);
        break;
      case 'addTodoError':
        setAddTodoError(boolean);
        break;
      case 'deleteTodoError':
        setDeleteTodoError(boolean);
        break;
      case 'updateTodoError':
        setUpdateTodoError(boolean);
        break;
      default:
        console.error('Unknown error type');
    }
  }

  function handleResetError() {
    handleError('hasTitleError', false);
    handleError('loadTodoError', false);
    handleError('addTodoError', false);
    handleError('deleteTodoError', false);
    handleError('updateTodoError', false);


  }

  const [status, setStatus] = useState('all');
  // const [checkboxStatus, setCheckboxStatus] = useState(false);
  // const [currentTodo , setCrurentTodo] = useState<Todo| null>(null);
  const errorTimerRef = useRef<number | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [inputRefTarget, setInputRefTarget] = useState<HTMLInputElement | null>(
    null,
  );

  if (!USER_ID) {
    return <UserWarning />;
  }

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        handleError('loadTodoError', true);
        resetError();
      });
  }, []);

  const resetError = () => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = window.setTimeout(() => {
      handleResetError();
      errorTimerRef.current = null;
    }, 3000);
  };

  const hideErrors = () => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    handleResetError();
  };

  const getErrorMessage = () => {
    if (hasTitleError) return Errors.titleError;
    if (loadTodoError) return Errors.loadTodoError;
    if (addTodoError) return Errors.addTodoError;
    if (deleteTodoError) return Errors.deleteTodoError;
    if (updateTodoError)  return  Errors.updateTodoError
    return '';
  };

  const isErrorHidden = () =>
    !hasTitleError && !loadTodoError && !addTodoError && !deleteTodoError && !updateTodoError;

  function updateTodoTitle(todo: Todo, newTitle: string): Promise<void> {
    setLoadingTodoIds(prevState => [...prevState, todo.id]);

    return updateTodoTitleOnServer(todo, newTitle) // Функция API для обновления title
      .then(updatedTodo => {
        setTodos?.(currentTodos => {
          const newTodos = [...currentTodos];
          const index = newTodos.findIndex(prevTodo => prevTodo.id === todo.id);
          if (index !== -1) {
            newTodos.splice(index, 1, updatedTodo);
          }
          return newTodos;
        });
      })
      .finally(() => {
        setLoadingTodoIds(prevState =>
          prevState.filter(prevTodo => prevTodo !== todo.id),
        );
      })
      .catch(() => {
        handleError('updateTodoTitleError', true);
      });
  }

  function updateTodo(todo: Todo) {
    setLoadingTodoIds(prevState => [...prevState, todo.id]);

    const newStatus = !todo.completed;
    updateTodosCheckbox(todo, newStatus)
      .then(todo => {
        setTodos?.(currentPost => {
          const newTodos = [...currentPost];
          const index = newTodos.findIndex(prevTodo => prevTodo.id === todo.id);
          newTodos.splice(index, 1, todo);
          return newTodos;
        });
      })
      .finally(() => {
        setLoadingTodoIds(prevState =>
          prevState.filter(prevTodo => prevTodo !== todo.id),
        );
      })
      .catch(() => {
        handleError('updateTodoError', true);
      });
  }

  const filteredTodos = todos.filter(todo => {
    if (status === Status.active) {
      return !todo.completed;
    }
    if (status === Status.completed) {
      return todo.completed;
    }
    return true;
  });

  function deleteTodo(todoId: number) {
    setLoadingTodoIds(prevState => [...prevState, todoId]);

    return deleteTodos(todoId)
      .then(() => {
        setTodos(currentPosts =>
          currentPosts.filter(todo => todo.id !== todoId),
        );
        inputRefTarget?.focus();
      })
      .catch(() => {
        handleError('deleteTodoError', true);
        resetError();
        inputRefTarget?.focus();
        return;
      })
      .finally(() => {
        setIsLoading(false);
        setLoadingTodoIds(prevState =>
          prevState.filter(todo => todo !== todoId),
        );
      });
  }

  function deleteCompletedTodo() {
    const filteredTodos = todos.filter(todo => todo.completed);
    Promise.all(filteredTodos.map(todo => deleteTodo(todo.id))).catch(() => {
      handleError('deleteTodoError', true);
    });
  }

  const allCompleted = todos.every(todo => todo.completed);

  function updateAllTodo() {
    const todoToUpdate = allCompleted
      ? todos
      : todos.filter(todo => !todo.completed);
    const loadingIds = todoToUpdate.map(todo => todo.id);
    setLoadingTodoIds(prevState => [...prevState, ...loadingIds]);
    const newStatus = !allCompleted;
    Promise.all(todoToUpdate.map(todo => updateTodosCheckbox(todo, newStatus)))
      .then(todos => {
        const todosIds = todos.map((todo: Todo) => todo.id);
        setTodos(prevTodos =>
          prevTodos.map(todo => {
            if (todosIds.includes(todo.id)) {
              return { ...todo, completed: newStatus };
            }
            return todo;
          }),
        );
      })
      .finally(() =>
        setLoadingTodoIds(prevState =>
          prevState.filter(todo => !loadingIds.includes(todo)),
        ),
      )
      .catch(() => {
        handleError('updateTodoError', true);
      });
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <TodoHeader
          handleError={handleError}
          setTodos={setTodos}
          resetError={resetError}
          setTempTodo={setTempTodo}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          hasTitleError={hasTitleError}
          loadTodoError={loadTodoError}
          addTodoError={addTodoError}
          deleteTodoError={deleteTodoError}
          hideErrors={hideErrors}
          setInputRefTarget={setInputRefTarget}
          inputRefTarget={inputRefTarget}
          updateAllTodo={updateAllTodo}
          allCompleted={allCompleted}
          todos={todos}
        />
        {(tempTodo || todos.length > 0) && (
          <>
            <TodoList
              filteredTodos={filteredTodos}
              tempTodo={tempTodo}
              isLoading={isLoading}
              deleteTodo={deleteTodo}
              loadingTodoIds={loadingTodoIds}
              onUpdateTodo={updateTodo}
              updateTodoTitle={updateTodoTitle}
            />
            <TodoFooter
              todos={todos}
              status={status}
              setStatus={setStatus}
              deleteCompletedTodo={deleteCompletedTodo}
            />
          </>
        )}
        {/* Hide the footer if there are no todos */}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <TodoErrorNotification
        getErrorMessage={getErrorMessage}
        isErrorHidden={isErrorHidden}
        hideErrors={hideErrors}
      />
    </div>
  );
};
