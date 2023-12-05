import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Snake from "./Snake";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/snake" element={<Snake />} />
      </Routes>
    </Router>
  );
}
export default App;