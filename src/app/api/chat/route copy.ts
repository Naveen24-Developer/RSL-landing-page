import logger from '@/lib/logger';
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, LanguageModel, smoothStream, streamText } from 'ai';
import { chatApiSchemaRequestBodySchema, ChatMetadata, ThinkingStep } from 'app-types/chat';
import { customModelProvider } from 'lib/ai/models';
import { getSystemPrompt } from 'lib/ai/prompt';
import { tripPlanningTools } from 'lib/ai/tools';
import { generateUUID } from 'lib/utils';
import { handleError } from './shared.chat';
import { ItineraryItem } from '@/types/trip';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    logger.info('Chat API POST request received');
    const json = await req.json();
    const {
      id,
      messages,
      chatModel,
      preferences,
    } = chatApiSchemaRequestBodySchema.parse(json);

    const model: LanguageModel = customModelProvider.getModel(chatModel);

    const metadata: ChatMetadata = {
      toolChoice: "auto",
      toolCount: 0,
      chatModel: chatModel,
      thinkingSteps: [],
    };

    // Track data across tool calls
    let fetchedActivities: any[] = [];
    let analyzedPreferences: any = preferences;
    const thinkingSteps: ThinkingStep[] = [];

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {

        const result = streamText({
          system: await getSystemPrompt(),
          model,
          messages: convertToModelMessages(messages),
          experimental_transform: smoothStream({ chunking: "word" }),
          maxRetries: 2,
          tools: tripPlanningTools,
          toolChoice: "auto",
        });

        // Wait for the stream to complete first
        const finalText = await result.text;
        const toolCalls = await result.toolCalls;
        const toolResults = await result.toolResults;

        logger.info(`✅ Completed with ${toolCalls.length} tool calls`);

        // Build thinking steps from tool results
        for (let i = 0; i < toolCalls.length; i++) {
          const toolCall = toolCalls[i];
          const toolResult: any = toolResults[i];

          const stepType = toolCall.toolName === 'analyzePreferences' ? 'analyze_preferences'
            : toolCall.toolName === 'fetchActivities' ? 'fetch_activities'
              : 'generate_itinerary';

          const stepTitle = toolCall.toolName === 'analyzePreferences' ? 'Analyze User Preferences'
            : toolCall.toolName === 'fetchActivities' ? 'Retrieve Resources'
              : 'Generate Itinerary';

          const step: ThinkingStep = {
            id: generateUUID(),
            step: stepType,
            title: stepTitle,
            status: 'completed',
            result: toolResult.result,
            timestamp: new Date(),
          };

          // Extract meaningful descriptions
          if (toolCall.toolName === 'analyzePreferences' && toolResult.result?.success) {
            step.description = toolResult.result.summary;
            analyzedPreferences = toolResult.result.preferences;
          } else if (toolCall.toolName === 'fetchActivities' && toolResult.result?.success) {
            const count = toolResult.result.count || 0;
            step.description = `Selected ${count} recommended attractions`;
            fetchedActivities = toolResult.result.activities || [];

            if (toolResult.result.budgetAlternatives) {
              step.description += ' (showing alternatives at different price points)';
            }
          } else if (toolCall.toolName === 'generateItinerary' && toolResult.result?.success) {
            step.description = toolResult.result.summary;
          }

          thinkingSteps.push(step);
        }

        metadata.thinkingSteps = thinkingSteps;
        metadata.toolCount = toolCalls.length;

        // Build final itinerary if generateItinerary was successful
        const generateResult: any = toolResults.find(
          (tr: any) => tr.toolName === 'generateItinerary'
        );

        if (generateResult && generateResult.result?.success) {
          logger.info('🏗️ Building final itinerary from tool results');

          const dayDistribution = generateResult.result.dayDistribution;
          const itinerary: ItineraryItem[] = [];

          // Transform day distribution into full itinerary items
          for (const day of dayDistribution) {
            for (let i = 0; i < day.activityIds.length; i++) {
              const activityId = day.activityIds[i];
              const timeSlot = day.timeSlots[i];

              // Find the full activity data
              const activity = fetchedActivities.find(a => a._id === activityId);

              if (activity) {
                const itineraryItem: ItineraryItem = {
                  id: `${day.day}-${i + 1}`,
                  day: day.day,
                  dayTitle: day.title,
                  title: activity.name,
                  type: 'activity',
                  timeOfDay: timeSlot,
                  sequence: i + 1,
                  location: {
                    lat: activity.latitude || 0,
                    lng: activity.longitude || 0,
                    address: `${activity.cityName || ''}, ${activity.countryName || ''}`.trim(),
                  },
                  startTime: timeSlot === 'Morning' ? '09:00'
                    : timeSlot === 'Afternoon' ? '13:00'
                      : '17:00',
                  duration: activity.duration || 120,
                  cost: activity.price || activity.startingPrice,
                  rating: activity.rating,
                  description: activity.description,
                  image: activity.image,
                  activityId: activity._id,
                  activityType: activity.type,
                  label: activity.label,
                  reviews: activity.reviews,
                  backgroundImages: activity.backgroundImage,
                  mobileBackgroundImages: activity.mobileBackgroundImage,
                  choices: activity.choices,
                  detailInfo: activity.detailInfo,
                  tags: activity.tags,
                  currency: activity.currency,
                  startingPrice: activity.startingPrice,
                  availability: activity.availability,
                  countryName: activity.countryName,
                  cityName: activity.cityName,
                  isDiscount: activity.isDiscount,
                };

                itinerary.push(itineraryItem);
              }
            }
          }

          // Add itinerary and stats to metadata
          (metadata as any).itinerary = itinerary;
          (metadata as any).itineraryStats = generateResult.result.stats;
          (metadata as any).analyzedPreferences = analyzedPreferences;

          logger.info(`✅ Itinerary built: ${itinerary.length} activities across ${dayDistribution.length} days`);
        }

        // Now merge the AI text stream with metadata already populated
        dataStream.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              if (part.type === "finish") {
                metadata.usage = part.totalUsage;
                return metadata;
              }
            },
          }),
        );
      },

      generateId: generateUUID,
      onFinish: async ({ responseMessage }) => {
        logger.info('Chat stream finished');
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
