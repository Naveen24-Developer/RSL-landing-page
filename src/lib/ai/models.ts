import "server-only";

import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { ChatModel } from "app-types/chat";

// Type for language model returned by providers
type LanguageModel = ReturnType<typeof google>;


const staticModels = {
  google: {
    /* "gemini-2.5-flash-lite": google("gemini-2.5-flash-lite"), */
    "gemini-2.0-flash": google("gemini-2.0-flash"),
    "gemini-2.5-flash": google("gemini-2.5-flash"),
    "gemini-2.5-pro": google("gemini-2.5-pro"),
  }
};

const staticUnsupportedModels = new Set([
  staticModels.google["gemini-2.0-flash"],
]);

const staticSupportImageInputModels = {
  ...staticModels.google,
};

const allModels = { ...staticModels };

const allUnsupportedModels = new Set([
  ...staticUnsupportedModels,
  ...staticUnsupportedModels,
]);

export const isToolCallUnsupportedModel = (model: LanguageModel) => {
  return allUnsupportedModels.has(model);
};

const isImageInputUnsupportedModel = (model: LanguageModel) => {
  return !Object.values(staticSupportImageInputModels).includes(model);
};

const fallbackModel = staticModels.google["gemini-2.0-flash"];

export const customModelProvider = {
  modelsInfo: Object.entries(allModels).map(([provider, models]) => ({
    provider,
    models: Object.entries(models).map(([name, model]) => ({
      name,
      isToolCallUnsupported: isToolCallUnsupportedModel(model),
      isImageInputUnsupported: isImageInputUnsupportedModel(model),
    })),
    hasAPIKey: checkProviderAPIKey(provider as keyof typeof staticModels),
  })),
  getModel: (model?: ChatModel): LanguageModel => {
    if (!model) return fallbackModel;
    const providerModels = allModels[model.provider as keyof typeof allModels];
    return (providerModels?.[model.model as keyof typeof providerModels] as LanguageModel) || fallbackModel;
  },
};

function checkProviderAPIKey(provider: keyof typeof staticModels) {
  let key: string | undefined;
  switch (provider) {
    case "google":
      key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      break;
    default:
      return true; // assume the provider has an API key
  }
  return !!key && key != "****";
}
