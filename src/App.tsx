import { useState } from "react";
import "./App.css";
import { ReactishDarling } from "./reactishDarling/ReactishDarling";
import { Reactish } from "./reactish/Reactish";

function App() {
  const [toggle, setToggle] = useState(true);
  return (
    <div className="App">
      <button onClick={() => setToggle(!toggle)}>
        {toggle ? "Use Reactish" : "Use Darling"}
      </button>
      {toggle ? <ReactishDarling /> : <Reactish />}
    </div>
  );
}

export default App;
