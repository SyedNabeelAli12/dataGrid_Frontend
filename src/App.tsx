import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CarDetail from "./pages/CarDetail";
import { SnackbarProvider } from "./components/snackbar";


function App() {
  return (
    <SnackbarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view/:id" element={<CarDetail />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;

