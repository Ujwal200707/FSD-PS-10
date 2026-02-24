import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { getTheme } from "./utils/theme";

function App() {
  useEffect(() => {
    const theme = getTheme() === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return <AppRoutes />;
}

export default App;