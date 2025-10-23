// Simple development environment setup
// This file provides a minimal setup for development outside Telegram

interface Telegram {
  WebApp: {
    initData: string;
    initDataUnsafe: {
      user: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        language_code: string;
      };
      auth_date: number;
      hash: string;
    };
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: {
      accent_text_color: string;
      bg_color: string;
      button_color: string;
      button_text_color: string;
      text_color: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    ready: () => void;
    expand: () => void;
    close: () => void;
    onEvent: (event: string, callback: () => void) => void;
    offEvent: (event: string, callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

if (import.meta.env.DEV) {
  // Set up a basic window.Telegram.WebApp for development
  if (typeof window !== "undefined" && !window.Telegram?.WebApp) {
    // Mock launch parameters for development
    const mockLaunchParams = new URLSearchParams([
      ["tgWebAppPlatform", "tdesktop"],
      ["tgWebAppVersion", "8.4"],
      ["tgWebAppStartParam", "dev"],
      [
        "tgWebAppData",
        new URLSearchParams([
          ["auth_date", Math.floor(Date.now() / 1000).toString()],
          ["hash", "mock-hash"],
          [
            "user",
            JSON.stringify({
              id: 1,
              first_name: "Test",
              last_name: "User",
              username: "testuser",
              language_code: "en",
            }),
          ],
        ]).toString(),
      ],
    ]);

    // Set up mock launch parameters in URL
    if (!window.location.search.includes("tgWebAppPlatform")) {
      const currentUrl = new URL(window.location.href);
      mockLaunchParams.forEach((value, key) => {
        currentUrl.searchParams.set(key, value);
      });
      // Don't actually change the URL, just provide the mock data
    }

    window.Telegram = {
      WebApp: {
        initData: mockLaunchParams.get("tgWebAppData") || "",
        initDataUnsafe: {
          user: {
            id: 1,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            language_code: "en",
          },
          auth_date: Math.floor(Date.now() / 1000),
          hash: "mock-hash",
        },
        version: "8.4",
        platform: "tdesktop",
        colorScheme: "dark",
        themeParams: {
          accent_text_color: "#6ab2f2",
          bg_color: "#17212b",
          button_color: "#5288c1",
          button_text_color: "#ffffff",
          text_color: "#f5f5f5",
        },
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        ready: () => console.log("Telegram WebApp ready (dev)"),
        expand: () => console.log("Telegram WebApp expand (dev)"),
        close: () => console.log("Telegram WebApp close (dev)"),
        onEvent: () => {},
        offEvent: () => {},
      },
    };

    console.log("🔧 Development Telegram WebApp mock loaded");
  }
}
