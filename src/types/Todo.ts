export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export enum Errors {
  'titleError' = 'Title should not be empty',
  'addTodoError' = 'Unable to add a todo',
  'updateTodoError' = 'Unable to update a todo',
  'loadTodoError' = 'Unable to load todos',
  'deleteTodoError' = 'Unable to delete a todo'
}
