import "./style.css";

import { createApp } from "vue";
import { retrieveLaunchParams } from "@tma.js/sdk-vue";

import App from "./App.vue";
import router from "./router";
import { errorHandler } from "./errorHandler";
import { init } from "./init";
import { TonConnectUIPlugin } from "./tonconnect";
import { publicUrl } from "./lib/publicUrl";

// Ensure dark mode is the default and Telegram theme integration
document.documentElement.classList.add("dark");

// Telegram theme integration
const applyTelegramTheme = () => {
  // Check if we're in Telegram environment
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    // Apply Telegram's color scheme
    if (tg.themeParams) {
      const root = document.documentElement;

      // Apply Telegram theme colors as CSS custom properties
      if (tg.themeParams.bg_color) {
        root.style.setProperty("--tg-theme-bg-color", tg.themeParams.bg_color);
      }
      if (tg.themeParams.text_color) {
        root.style.setProperty(
          "--tg-theme-text-color",
          tg.themeParams.text_color,
        );
      }
      if (tg.themeParams.hint_color) {
        root.style.setProperty(
          "--tg-theme-hint-color",
          tg.themeParams.hint_color,
        );
      }
      if (tg.themeParams.link_color) {
        root.style.setProperty(
          "--tg-theme-link-color",
          tg.themeParams.link_color,
        );
      }
      if (tg.themeParams.button_color) {
        root.style.setProperty(
          "--tg-theme-button-color",
          tg.themeParams.button_color,
        );
      }
      if (tg.themeParams.button_text_color) {
        root.style.setProperty(
          "--tg-theme-button-text-color",
          tg.themeParams.button_text_color,
        );
      }
    }
  }
};

// Apply theme immediately
applyTelegramTheme();

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
  app.use(TonConnectUIPlugin, {
    manifestUrl: publicUrl("tonconnect-manifest.json"),
  });
  app.mount("#app");
};

// Initialize the app
initializeApp().catch(console.error);
