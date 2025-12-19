

import logger from '@/lib/logger';
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, LanguageModel, smoothStream, streamText, UIMessage } from 'ai';
import { chatApiSchemaRequestBodySchema, ChatMetadata } from 'app-types/chat';
import { customModelProvider } from 'lib/ai/models';
import { getSystemPrompt } from 'lib/ai/prompt';
import { generateUUID } from 'lib/utils';
import { handleError } from './shared.chat';

export async function POST(req: Request) {
  try {
    logger.info('Chat API POST request received');
    const json = await req.json();
    const {
      id,
      messages,
      chatModel,
    } = chatApiSchemaRequestBodySchema.parse(json);
    const model: LanguageModel = customModelProvider.getModel(chatModel);

    const metadata: ChatMetadata = {
      toolChoice: "auto",
      toolCount: 0,
      chatModel: chatModel,
    };

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {

        const result = streamText({
          system: await getSystemPrompt(),
          model,
          messages: convertToModelMessages(messages),
          experimental_transform: smoothStream({ chunking: "word" }),
          maxRetries: 1,
          /* tools: allTools,
          toolChoice: "auto", */
        });

        dataStream.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              if (part.type == "finish") {
                metadata.usage = part.totalUsage;
                return metadata;
              }
            },
          }),
        );
      },

      generateId: generateUUID,
      onFinish: async ({ responseMessage }) => {
      },
      onError: handleError,
      originalMessages: messages,
    });

    return createUIMessageStreamResponse({
      stream,
    });
    
  } catch (error) {
    logger.error('Error processing Chat API request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}