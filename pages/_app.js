import "../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect } from "react";
import Chart from "chart.js/auto";

Chart.register();
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
