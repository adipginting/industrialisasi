import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, getCanUserPost } from "./api";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const loggedInUser = useSelector((state) => state.login.loggedInUser);
  const navigate = useNavigate();
  const can_user_post = useQuery({
    queryKey: ["canUserPost"],
    queryFn: getCanUserPost,
  });

  const canUserPost = can_user_post;

  useEffect(() => {
    if (loggedInUser === "") {
      navigate("/login");
    }
  }, [loggedInUser, navigate]);

  const titleHandler = (event) => {
    setTitle(event.target.value);
    event.preventDefault();
  };

  const contentHandler = (event) => {
    setContent(event.target.value);
    event.preventDefault();
  };

  const onSubmitHandler = (event) => {
    const postThePost = async () => {
      try {
        const post = {
          title: title,
          content: content,
        };
        const { data } = await api.post("/post", post);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };

    postThePost();
    event.preventDefault();
  };

  return (
    <div>
      <Form onSubmit={onSubmitHandler}>
        {canUserPost ? (
          <p className="mt-2">Write new post. </p>
        ) : (
          <p className="mt-2">
            You are currently restricted from writing new post. Contact
            adi.industrialisasi@gmail.com for more information.
          </p>
        )}
        <Form.Group className="mb-2">
          <Form.Label>Post title </Form.Label>
          <Form.Control
            type="text"
            placeholder="title"
            onChange={titleHandler}
            value={title}
            disabled={!canUserPost}
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label> Post content: </Form.Label>
          <Form.Control
            as="textarea"
            rows={12}
            placeholder="start typing content"
            onChange={contentHandler}
            value={content}
            disabled={!canUserPost}
          ></Form.Control>
        </Form.Group>
        <Button type="submit" disabled={!canUserPost}>
          Publish post
        </Button>
      </Form>
    </div>
  );
};
export default Write;
