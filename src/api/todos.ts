import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 2462;




export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};



export function updateTodoTitleOnServer(  { id} : Todo  , newTitle : string)  {
  return client.patch<Todo>( `/todos/${id}` , {title : newTitle})
}



export function updateTodosCheckbox(  {id} : Todo , completed_status : boolean)  {
  return client.patch<Todo>(`/todos/${id}`, { completed : completed_status });
}


// const newTodo  = {
//   "id": 3,
//   "createdAt": "2025-03-18T11:24:45.695Z",
//   "updatedAt": "2025-03-25T16:58:31.750Z",
//   "userId": 2412,
//   "title": "e2e2",
//   "completed": false
// }
//
//
//
//
//
// updateTodosCheckbox(newTodo , true)


export function createTodo({title  , userId , completed} : Omit<Todo, "id">)  {
  return client.post<Todo>('/todos/' , {title , userId , completed})
}


export function deleteTodos(todoId : number)  {
  return client.delete(`/todos/${todoId}`)
}


// Add more methods here
