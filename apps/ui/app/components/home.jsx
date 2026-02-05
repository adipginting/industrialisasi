import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { retrieveSomeNumberOfPosts } from "./api";
import { v4 } from "uuid";

const Post = ({ title, author, postedAt, lastEditAt, content }) => {
  const [isContracted, setIsContracted] = useState(true);
  const jsDate = (pgDate) => {
    return new Date(pgDate).toLocaleDateString();
  };

  const contentArray = content.split("\n");

  function expandPost(event) {
    setIsContracted(false);
    event.preventDefault();
  }

  return (
    <div>
      <h2>{title}</h2>
      <p>
        An article by {author} on {jsDate(postedAt)}{" "}
        {lastEditAt !== null && (
          <span>(last edit on {jsDate(lastEditAt)})</span>
        )}
      </p>
      {isContracted === true && (
        <div>
          <p>
            {contentArray[0]} <span className='assist' onClick={expandPost}>(more)</span>
          </p>
        </div>
      )}

      {isContracted === false && (
        <div>
          {contentArray.map((paragraph) => {
            if (paragraph !== "") {
              const id = v4();
              return <p key={id}>{paragraph}</p>;
            }
            return "";
          })}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [noPosts, setNoPosts] = useState(5);

  const { mutateAsync: getPosts } = useMutation(retrieveSomeNumberOfPosts);

  useEffect(() => {
    const retrievePostsAsync = async () => {
      const data = await getPosts(noPosts);
      setPosts(data);
    };
    retrievePostsAsync();
  }, [noPosts, setPosts, getPosts]);

  const morePosts = (event) => {
    setNoPosts(noPosts + 5);
    event.preventDefault();
  };

  return (
    <>
      {posts.map((post) => {
        return (
          <Post
            key={post.postid}
            title={post.title}
            author={post.username}
            postedAt={post.postedat}
            lastEditAt={post.lasteditedat}
            content={post.content}
          />
        );
      })}
      {posts.length >= noPosts && (
        <Button onClick={morePosts} className="mt-4">
          Load more posts{" "}
        </Button>
      )}
    </>
  );
};

export default Home;
