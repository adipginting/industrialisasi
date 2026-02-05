import React, { useState, useEffect } from "react";
import { Link } from "react-router";

const Header = () => {
  const [loggedInUser, setLoggedInUser] = useState("");

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // For now, just set a generic username
      setLoggedInUser('User');
    }
  }, []);

  const logout = (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    setLoggedInUser('');
    window.location.reload();
  };

  return (
    <div className="flex flex-row gap-x-3">
      <Link to="/">
        <span role="img" aria-label="factory">
          🏭
        </span>
      </Link>

      <div className="">
        <Link to="/">Home</Link>
      </div>
      
      {(!loggedInUser || loggedInUser === "") && (
        <>
          <div className="">
            <Link to="/register">Register</Link>
          </div>
          <div className="">
            <Link to="/login">Login</Link>
          </div>
        </>
      )}

      {loggedInUser && loggedInUser !== "" && (
        <>
          <div className="">
            <Link to="/create-post" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              Create Post
            </Link>
          </div>
          <div className="nav-link" onClick={logout}>
            Logout {loggedInUser}
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
