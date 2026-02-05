import * as React from "react";
import { fetchPosts } from "../api/createPost";

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  posted_at: string;
}

export default function Home() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">📝 Posts</h1>

      {loading && <p className="text-gray-500">Loading posts...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-10 bg-gray-100 rounded-lg">
          <p className="text-gray-500 text-lg">No posts yet.</p>
          <p className="text-gray-400">Login and create the first post!</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">
              {post.content}
            </p>
            <div className="text-sm text-gray-400 flex gap-4">
              <span>👤 {post.username}</span>
              <span>📅 {new Date(post.posted_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
