type TranslateMessage = {
  type: "translate";
  id: string;
  targetLanguage: string;
  texts: string[];
};

type WorkerMessage = TranslateMessage;

type TranslationResult = {
  translation_text?: string;
};

type BrowserTranslator = (
  text: string,
  options: { src_lang: string; tgt_lang: string; max_new_tokens: number }
) => Promise<TranslationResult[]>;

type BrowserPipeline = (
  task: "translation",
  model: string,
  options: { progress_callback: (progress: unknown) => void }
) => Promise<BrowserTranslator>;

const MODEL_ID = "Xenova/m2m100_418M";
const TRANSFORMERS_BROWSER_MODULE = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm";
let translatorPromise: Promise<BrowserTranslator> | null = null;

function emit(payload: unknown) {
  self.postMessage(payload);
}

async function loadBrowserPipeline() {
  const transformers = await import(/* webpackIgnore: true */ TRANSFORMERS_BROWSER_MODULE) as { pipeline: BrowserPipeline };
  return transformers.pipeline;
}

function getTranslator() {
  if (!translatorPromise) {
    emit({ type: "status", status: "downloading", detail: "正在下載本機翻譯模型 / Downloading local model" });
    translatorPromise = loadBrowserPipeline().then((pipeline) => pipeline("translation", MODEL_ID, {
      progress_callback: (progress) => {
        if (typeof progress === "object" && progress) {
          const event = progress as { file?: string; progress?: number; status?: string };
          emit({
            type: "progress",
            progress: typeof event.progress === "number" ? Math.round(event.progress) : null,
            detail: event.file || event.status || "Preparing local model",
          });
        }
      },
    }));
  }
  return translatorPromise;
}

self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  if (message.type !== "translate") return;

  try {
    const translator = await getTranslator();
    emit({ type: "status", status: "translating", detail: "正在於你的裝置翻譯 / Translating on your device" });

    const translations: string[] = [];
    for (const text of message.texts) {
      const output = await translator(text, {
        src_lang: "zh",
        tgt_lang: message.targetLanguage,
        max_new_tokens: 512,
      });
      translations.push(output[0]?.translation_text || text);
    }

    emit({ type: "result", id: message.id, translations });
    emit({ type: "status", status: "ready", detail: "本機翻譯模型已就緒 / Local model ready" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Local translation could not start.";
    emit({ type: "error", id: message.id, detail });
  }
});
