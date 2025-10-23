import { createApp } from "vue";
import { retrieveLaunchParams } from "@tma.js/sdk-vue";
import { VueQueryPlugin } from "@tanstack/vue-query";

import App from "./App.vue";
import router from "./router";
import { errorHandler } from "./errorHandler";
import { init } from "./init";
import { TonConnectUIPlugin } from "./tonconnect";
import { publicUrl } from "./lib/publicUrl";

import "./style.css";

// Ensure dark mode is the default
document.documentElement.classList.add("dark");

// Mock the environment in case, we are outside Telegram.
// Only import mock environment in development
if (import.meta.env.DEV) {
  import("./mockEnv");
}

// Wait for mock environment to be set up before initializing
const initializeApp = async () => {
  let launchParams;
  let platform = "tdesktop"; // Default platform for development

  try {
    launchParams = retrieveLaunchParams();
    platform = launchParams.tgWebAppPlatform || "tdesktop";
  } catch (error) {
    console.warn(
      "Failed to retrieve launch parameters, using defaults:",
      error,
    );
    // Use default launch parameters for development
    launchParams = {
      tgWebAppPlatform: "tdesktop",
      tgWebAppStartParam: "",
    };
  }

  const debug =
    (launchParams.tgWebAppStartParam || "").includes("debug") ||
    import.meta.env.DEV;

  // Configure all application dependencies.
  await init({
    debug,
    eruda: debug && ["ios", "android"].includes(platform),
    mockForMacOS: platform === "macos",
  });

  const app = createApp(App);
  app.config.errorHandler = errorHandler;
  app.use(router);
  app.use(VueQueryPlugin);
  app.use(TonConnectUIPlugin, {
    manifestUrl: publicUrl("tonconnect-manifest.json"),
  });
  app.mount("#app");
};

// Initialize the app
initializeApp().catch(console.error);
