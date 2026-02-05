export const createPost = async (title: string, content: string) => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://172.17.0.3:4000';
  const response = await fetch(`${apiUrl}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
};

export const fetchPosts = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://172.17.0.3:4000';
  const response = await fetch(`${apiUrl}/posts`);
  return response.json();
};
