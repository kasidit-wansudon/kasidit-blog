---
title: "Building a Multilingual AI Assistant for Spanish, Thai, English, Chinese"
date: "2026-06-03"
excerpt: "How to build a multilingual AI assistant that answers well in Spanish, Thai, English, and Chinese: language detection, a term glossary, and per-language tests."
tags: ["ai", "llm", "multilingual", "i18n", "testing"]
---

The team I work with in Mexico mainly uses Spanish, but it also includes Thai speakers, Chinese speakers, and people who communicate in English. When I built an AI sales agent that answers through DingTalk, the goal was not just "make the AI answer" but to build a multilingual AI assistant that answers equally well in Spanish, Thai, English, and Chinese.

Modern LLMs are already good at many languages, but "good in a test" and "good in real use" are very different. This post collects what I learned getting it to work in practice.

## Common Problems in Multilingual Systems

- The user asks in Spanish but gets an English answer
- Product model names or business terms get translated until nobody recognizes them
- Questions in Thai or Chinese fail to find information because the source documents are in English
- Answer quality in one language drops after a prompt change and nobody notices

All four can be fixed with three main things: language detection, a glossary, and per-language testing.

## Language Detection: Do Not Let the Model Guess

The easiest approach is to write "answer in the same language as the user" in the prompt, which works almost every time. But "almost" is not enough when the question is very short or has English product names mixed in, such as a three-word Spanish question with a two-word model name.

So I detect the language in code first, then pass the result to the model as an explicit instruction.

```typescript
type Lang = "es" | "th" | "en" | "zh";

export function detectLanguage(text: string, fallback: Lang = "es"): Lang {
  const thai = (text.match(/[฀-๿]/g) ?? []).length;
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  if (thai > 0 && thai >= cjk) return "th";
  if (cjk > 0) return "zh";

  const lower = text.toLowerCase();
  const spanishHints = /[ñáéíóú¿¡]|\b(cuánto|cuántos|ventas|mes|tienda|qué|cómo|dónde)\b/;
  if (spanishHints.test(lower)) return "es";

  const latinWords = lower.match(/[a-z]+/g) ?? [];
  return latinWords.length > 0 ? "en" : fallback;
}
```

Thai and Chinese are easy to detect from Unicode ranges. Spanish and English are harder because they share the same alphabet. I use hint words and special characters, and set the fallback to the main language of the largest user group. A better option is to store the language the user chose in their profile and use detection only as a supplement.

Then I put it directly in the system prompt, such as `Respond in: es`, instead of telling the model to guess.

## Glossary: Terms Never to Translate, and Terms to Translate One Way

The fastest way to make users distrust an AI is wrong terminology. I split the glossary into two groups.

**Never translate:** product model names, internal system names, report names, and codes. These must stay unchanged in every language.

**Always translate the same way:** business terms such as sell-in, sell-out, stock, and purchase order. Define the translation the team really uses in each language, and do not let the model pick synonyms at random.

I keep the glossary as a JSON file and insert only the section for the detected language into the prompt, not all four languages, to save tokens and reduce confusion.

The glossary also helps retrieval. When a user asks with Thai or Chinese terms, the system maps them back to English keywords before searching, so documents are found even when the source is in a different language.

## Number, Date, and Currency Formats

This is a small thing users notice immediately. For example, Spanish in Mexico and Thai display numbers and dates differently. I do not let the model format them. Instead, tools return raw values, and I format them with `Intl.NumberFormat` and `Intl.DateTimeFormat` for the locale before passing them to the model. This is both more accurate and reduces the chance of the model inventing wrong numbers.

## Test Per Language

This is the step most teams skip, and it is the most important. I built a test set with the same questions in all four languages and measure the results separately.

- Is the answer in the correct language?
- Are glossary terms used exactly as defined?
- Do the numbers in the answer match the tool results?
- Are the length and tone appropriate?

The first three can be checked automatically. The last needs someone who really uses the language. In a team working in four languages, I ask each person to review only their own language, a few cases per week. That works better than having one person read every language through machine translation.

Every time the prompt changes, run all four languages, because a change that improves one language sometimes makes another worse without you noticing. On using traces to find where things break, I wrote about it in [Reviewing LLM Answer Quality from Traces](/en/blog/trace-based-llm-answer-quality).

## Lessons From Working in Multiple Languages

Working with a four-language team showed me that language is not just translation, it is also about expectations. In some languages users prefer short, to-the-point answers, and in others they expect more politeness. A good prompt should include a little tone guidance per language. It does not need to be long, but it needs to be there. On working with people in several languages within a team, I wrote about it in [Leading a Team in Four Languages](/en/blog/leading-team-in-four-languages).

## Summary

A multilingual AI assistant answers well when we do not let the model guess important things. Detect the language in code and instruct it clearly, use a glossary to control terms in both answers and search, format numbers before passing them to the model, and test every language each time the prompt changes. These four practices give users of every language a similar experience.
