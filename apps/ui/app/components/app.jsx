import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, Register, Login, Write, About, Header } from ".";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const App = () => {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Header />

        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/write" element={<Write />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
