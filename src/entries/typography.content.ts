import { createBackgroundMessage } from "@/messaging/background";
import "./core/typography.css";
import { fetchTranslateApi } from "@/api";
import { TOKEN } from "@/constants";

const TEXT_TAGS = [
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "main",
  "article",
  "section",
  "figure",
  "li",
];

function removeElement(container: HTMLElement, el: HTMLElement) {
  if (container.contains(el)) {
    container.removeChild(el);
  }
}

async function onTranslateTypography(target: HTMLElement) {
  const text = target.textContent?.trim();
  if (!text) {
    return;
  }

  const parent = target.parentElement;
  if (!parent) {
    return;
  }

  const token = await storage.getItem<string>(TOKEN);
  if (!token) {
    return;
  }

  const { result } = await fetchTranslateApi(token, { text });

  const translationEl = document.createElement("div");
  translationEl.innerHTML = `<div class='word-wise-typography-translation'>${result}</div>`;

  parent.insertBefore(translationEl, target.nextSibling);
}

function createTypographyTranslatorElement() {
  const el = document.createElement("div");
  el.className = "word-wise-typography-hover";
  el.appendChild(document.createTextNode("W"));
  return el;
}

function showTypographyTranslatorElement(target: HTMLElement) {
  const typographyTranslatorEl = createTypographyTranslatorElement();
  target.appendChild(typographyTranslatorEl);

  typographyTranslatorEl.addEventListener("click", () =>
    onTranslateTypography(target),
  );

  const mouseOut = () => {
    removeElement(target, typographyTranslatorEl);
    target.removeEventListener("mouseout", debounceMouseOut);
    target.removeEventListener("mouseover", debounceMouseOut.cancel);
  };

  const debounceMouseOut = debounce(mouseOut, 500);
  target.addEventListener("mouseout", debounceMouseOut);
  target.addEventListener("mouseover", debounceMouseOut.cancel);

  typographyTranslatorEl.addEventListener("mouseout", debounceMouseOut);
  typographyTranslatorEl.addEventListener("mouseover", debounceMouseOut.cancel);
}

function onTypographyMove(e: MouseEvent) {
  const { clientX, clientY } = e;
  const currentEl = document.elementFromPoint(clientX, clientY);
  if (!currentEl) {
    return;
  }

  if (!TEXT_TAGS.includes(currentEl.tagName.toLowerCase())) {
    return;
  }

  const text = currentEl.textContent?.trim();
  if (!text) {
    return;
  }

  if (!/\s/.test(text)) {
    return;
  }

  const target = currentEl as HTMLElement;
  if (target.dataset.wordWise) {
    return;
  }

  const isTranslated = target.querySelector(
    ".word-wise-typography-translation",
  );
  if (isTranslated) {
    return;
  }

  if (target.classList.contains("word-wise-typography-translation")) {
    return;
  }

  showTypographyTranslatorElement(target);
}

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  cssInjectionMode: "manifest",
  main: async () => {
    const bgs = createBackgroundMessage();
    const user = await bgs.getUser();

    if (!user) {
      return;
    }

    document.addEventListener("mousemove", debounce(onTypographyMove, 500));
  },
});
