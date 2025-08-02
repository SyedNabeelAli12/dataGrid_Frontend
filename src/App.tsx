import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CarDetail from "./pages/CarDetail";
import { SnackbarProvider } from "./components/snackbar";
import { LOVProvider } from "./components/Context/lov";


function App() {
  return (
    <SnackbarProvider>
      <LOVProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view/:id" element={<CarDetail />} />
        </Routes>
      </Router>
      </LOVProvider>
    </SnackbarProvider>
  );
}

export default App;

