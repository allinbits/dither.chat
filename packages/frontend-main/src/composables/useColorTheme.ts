import { useStorage } from '@vueuse/core';
import { watch } from 'vue';

export type ColorTheme = 'light' | 'dark' | 'atomone';

const THEME_STORAGE_KEY = 'dither-color-theme';

let themeInstance: ReturnType<typeof createThemeInstance> | null = null;

function createThemeInstance() {
  const theme = useStorage<ColorTheme>(THEME_STORAGE_KEY, 'light');
  const html = document.documentElement;

  function applyTheme(newTheme: ColorTheme) {
    html.classList.remove('light', 'dark', 'atomone');
    html.classList.add(newTheme);
    theme.value = newTheme;

    if (typeof window !== 'undefined') {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        if (newTheme === 'dark' || newTheme === 'atomone') {
          metaThemeColor.setAttribute('content', '#1a1a1a');
        } else {
          metaThemeColor.setAttribute('content', '#ffffff');
        }
      }
    }
  }

  function cycleTheme() {
    const themes: ColorTheme[] = ['light', 'dark', 'atomone'];
    const currentIndex = themes.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    applyTheme(themes[nextIndex]);
  }

  if (typeof window !== 'undefined') {
    applyTheme(theme.value);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const currentClass = html.className;
          const hasTheme = currentClass.includes('light') || currentClass.includes('dark') || currentClass.includes('atomone');

          if (!hasTheme) {
            requestAnimationFrame(() => {
              applyTheme(theme.value);
            });
          } else {
            const currentTheme = theme.value;
            if (!currentClass.includes(currentTheme)) {
              requestAnimationFrame(() => {
                applyTheme(currentTheme);
              });
            }
          }
        }
      });
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ['class'],
    });

    if (window.location) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (...args) {
        originalPushState.apply(history, args);
        requestAnimationFrame(() => applyTheme(theme.value));
      };

      history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        requestAnimationFrame(() => applyTheme(theme.value));
      };

      window.addEventListener('popstate', () => {
        requestAnimationFrame(() => applyTheme(theme.value));
      });
    }
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  }, { immediate: true });

  return {
    theme,
    cycleTheme,
    setTheme: applyTheme,
  };
}

export function useColorTheme() {
  if (!themeInstance) {
    themeInstance = createThemeInstance();
  }
  return themeInstance;
}
