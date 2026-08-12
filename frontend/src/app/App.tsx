import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

