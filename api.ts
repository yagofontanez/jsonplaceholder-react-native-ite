import axios from "axios";

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 7000,
});

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export const getPostById = async (id: number): Promise<Post> => {
  const { data } = await api.get<Post>(`/posts/${id}`);
  return data;
};

export const getCommentsByPostId = async (
  postId: number
): Promise<Comment[]> => {
  const { data } = await api.get<Comment[]>(`/posts/${postId}/comments`);
  return data;
};

export default api;
