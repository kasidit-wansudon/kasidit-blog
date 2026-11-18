---
title: "Mobile HR App with Vue 3 + Vant: 4-Language i18n, Forms, Offline"
date: "2026-02-25"
excerpt: "Lessons from building a mobile-first HR app with Vue 3 and Vant: 4-language i18n, forms that are easy to fill in on a phone, and patterns for poor networks."
tags: ["vue", "vant", "i18n", "mobile", "frontend"]
---

The internal HR system I maintain at OPPO Mexico uses Laravel as the backend and Vue 3 + Vant as the frontend. Most users open it from their phones, many of them in warehouses or stores with poor signal, and it has to support 4 languages (Spanish, English, Chinese, Thai). This post summarizes what I learned building a mobile HR app with Vue 3 + Vant in three areas: i18n, forms, and offline-friendly patterns.

## Why Vue 3 + Vant

Vant is a component library designed directly for mobile. It has components like `van-field`, `van-picker`, `van-calendar`, `van-uploader`, and `van-pull-refresh` that are easy to use with a finger, small in size, and come with built-in support for multiple locales. Paired with the Vue 3 Composition API, it makes reusable logic easy to write.

For an internal app that doesn't need to go on an app store, building a mobile web app (or opening it inside the company's chat app) is much faster than going native.

## 4-Language i18n: Set the Structure Up on Day One

I use `vue-i18n` together with Vant's locales. The important thing is to switch both at the same time, otherwise our text is in Spanish but the buttons in the date picker are still in English.

```javascript
// i18n.js
import { createI18n } from "vue-i18n";
import { Locale } from "vant";
import esES from "vant/es/locale/lang/es-ES";
import enUS from "vant/es/locale/lang/en-US";
import zhCN from "vant/es/locale/lang/zh-CN";
import thTH from "vant/es/locale/lang/th-TH";
import es from "./locales/es.json";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import th from "./locales/th.json";

const vantLocales = { es: ["es-ES", esES], en: ["en-US", enUS], zh: ["zh-CN", zhCN], th: ["th-TH", thTH] };

export const i18n = createI18n({
  legacy: false,
  locale: "es",
  fallbackLocale: "en",
  messages: { es, en, zh, th },
});

export function setLanguage(lang) {
  i18n.global.locale.value = lang;
  const [code, pack] = vantLocales[lang] ?? vantLocales.en;
  Locale.use(code, pack);
  document.documentElement.lang = lang;
  try { localStorage.setItem("lang", lang); } catch {}
}
```

Lessons on i18n:

- **Use meaningful keys** such as `leave.form.startDate`, not `text1`, so translators understand the context.
- **Set the fallback to English.** If a translation is incomplete, users see English instead of the raw key.
- **Watch text length.** Spanish is usually longer than English, while Chinese is very short. Test the layout in every language, especially buttons and tabs.
- **Use `Intl` for dates and numbers.** Don't format them yourself, because each country orders day/month differently.
- **Error messages from the backend:** have the backend send an error code and let the frontend translate it, instead of sending a message in one language.
- **Thai and Chinese fonts:** check that the font you use renders both languages well and doesn't fall back to a mix of system fonts.

For the people side of working with a multilingual team, I wrote about it in [leading a team in 4 languages](/en/blog/leading-team-in-four-languages).

## Mobile Forms: Minimize Typing as Much as Possible

HR forms, such as leave requests, document requests, and personal data changes, are the heart of the app. The principles I use:

- **Select instead of type.** Use `van-picker`, `van-calendar`, and `van-radio-group` wherever possible.
- **Set the input `type` correctly:** `tel`, `number`, `email`, so the phone shows the right keyboard.
- **Use `van-form` with `rules`.** Validate on blur and show the message right under that field, not one combined alert when submitting.
- **A large submit button at the bottom**, easy to reach with a thumb.
- **Prevent double submission.** Use `loading` on the button while submitting, and send an idempotency key with the request.
- **Photo upload:** use `van-uploader` and compress the image on the client before sending, because phone camera photos are very large.
- **Personal data:** the backend encrypts sensitive data before storing it, and we don't keep that data in the device's local storage.

## Offline-Friendly Patterns

I didn't make the app fully offline-capable, because that is more complex than necessary, but I made it "not break on a poor network" with these patterns.

**1. Automatic drafts.** Save entered values to local storage while typing (non-sensitive data only). If the connection drops or the app is closed, the data is still there when the user returns.

```javascript
// useDraft.js
import { ref, watch } from "vue";

export function useDraft(key, initial) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
  const form = ref({ ...initial, ...(saved ?? {}) });

  watch(form, (val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, { deep: true });

  const clear = () => { try { localStorage.removeItem(key); } catch {} };
  return { form, clear };
}
```

**2. Retry with user feedback.** If sending fails because of the network, show a "waiting to send" status and a retry button, instead of throwing an error and clearing the form.

**3. Cache read-only data**, such as remaining leave days and the holiday list. Show the most recently cached value along with its update time, then refresh in the background.

**4. Check network status.** Use `navigator.onLine` and the `online`/`offline` events to show a small warning bar at the top.

**5. Service worker for assets.** Cache JS/CSS files so the app opens quickly even with bad signal.

## Test on Real Devices, Not Just DevTools

DevTools' mobile mode helps to a degree, but it isn't the same as a real device. I test on the budget phones employees actually use, because they expose problems that powerful devices hide, such as a large bundle making things slow to open, the keyboard popping up and covering the submit button, or a date picker that stutters. I also throttle the network to 3G level to see whether drafts and retry behave as designed.

## Summary

Vue 3 + Vant is a very good fit for an internal mobile HR app. The places to put effort are setting up i18n from day one and switching Vant's locale at the same time, designing forms to select instead of type and validate immediately, and using offline-friendly patterns such as automatic drafts, retry that informs the user, and caching read-only data. That makes the app genuinely usable where the network is poor and users speak different languages.
