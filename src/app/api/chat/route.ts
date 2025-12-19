// import logger from '@/lib/logger';
// import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, LanguageModel, smoothStream, streamText } from 'ai';
// import { chatApiSchemaRequestBodySchema, ChatMetadata, ThinkingStep } from 'app-types/chat';
// import { customModelProvider } from 'lib/ai/models';
// import { getSystemPrompt } from 'lib/ai/prompt';
// import { tripPlanningTools } from 'lib/ai/tools';
// import { generateUUID } from 'lib/utils';
// import { handleError } from './shared.chat';
// import { ItineraryItem } from '@/types/trip';
// import getOrCreateTripPlannerState from '@/lib/getOrCreateTripPlannerState';

// export const maxDuration = 60;

// // const tripPlannerState = {
// //   id: null as any,
// //   preferences: null as any,
// //   activitiesMap: new Map<string, any>(),
// //   dayDistribution: null as any[] | null,
// //   stats: null as any,
// // };

// export async function POST(req: Request) {
//   try {
//     logger.info('Chat API POST request received');
//     const json = await req.json();
//     const {
//       id,
//       messages,
//       chatModel,
//       preferences,
//     } = chatApiSchemaRequestBodySchema.parse(json);

//     const model: LanguageModel = customModelProvider.getModel(chatModel);


//     const tripPlannerState = getOrCreateTripPlannerState(id);

//     // optional: stable planner/session id
//     tripPlannerState.id = `${id}`;


//     const metadata: ChatMetadata = {
//       toolChoice: "auto",
//       toolCount: 0,
//       chatModel: chatModel,
//       thinkingSteps: [],
//     };

//     // Track data across tool calls
//     let fetchedActivities: any[] = [];
//     let analyzedPreferences: any = preferences;
//     const thinkingSteps: ThinkingStep[] = [];

//     // Hydrate fetchedActivities from history
//     if (messages && messages.length > 0) {
//       messages.forEach((msg: any) => {
//         if (msg.role === 'assistant' && msg.toolInvocations) {
//           msg.toolInvocations.forEach((toolInvocation: any) => {
//             if (toolInvocation.toolName === 'fetchActivities' && toolInvocation.state === 'result') {
//               const result = toolInvocation.result;
//               const activities = result?.activities || result?.output?.activities || result?.result?.activities || [];
//               if (activities.length > 0) {
//                 logger.info(`🔄 Hydrated ${activities.length} activities from history (msg: ${msg.id})`);
//                 fetchedActivities = [...fetchedActivities, ...activities];
//               }
//             }
//           });
//         }
//       });
//     }

//     // Deduplicate fetchedActivities
//     fetchedActivities = Array.from(new Map(fetchedActivities.map(item => [item._id, item])).values());
//     logger.info(`📊 Total unique activities available: ${fetchedActivities.length}`);

//     const stream = createUIMessageStream({
//       execute: async ({ writer: dataStream }) => {

//         const result = streamText({
//           system: await getSystemPrompt(),
//           model,
//           messages: convertToModelMessages(messages),
//           experimental_transform: smoothStream({ chunking: "word" }),
//           maxRetries: 2,
//           tools: tripPlanningTools,
//           toolChoice: "auto",
//         });

//         // Wait for the stream to complete first
//         // const finalText = await result.text;
//         const toolCalls = await result.toolCalls;
//         const toolResults = await result.toolResults;

//         logger.info(`✅ Completed with ${toolCalls.length} tool calls`);

//         // Build thinking steps from tool results
//         for (let i = 0; i < toolCalls.length; i++) {
//           const toolCall = toolCalls[i];
//           const toolResult: any = toolResults[i];

//           const stepType = toolCall.toolName === 'analyzePreferences' ? 'analyze_preferences'
//             : toolCall.toolName === 'fetchActivities' ? 'fetch_activities'
//               : 'generate_itinerary';

//           const stepTitle = toolCall.toolName === 'analyzePreferences' ? 'Analyze User Preferences'
//             : toolCall.toolName === 'fetchActivities' ? 'Retrieve Resources'
//               : 'Generate Itinerary';

//           const step: ThinkingStep = {
//             id: generateUUID(),
//             step: stepType,
//             title: stepTitle,
//             status: 'completed',
//             result: toolResult.result,
//             timestamp: new Date(),
//           };

//           // Extract meaningful descriptions
//           const resultData = toolResult.result || toolResult.output;

//           if (toolCall.toolName === 'analyzePreferences' && resultData?.success) {
//             step.description = resultData.summary;
//             analyzedPreferences = resultData.preferences;
//             tripPlannerState.preferences = resultData.preferences;
//             // OPTIONAL: if fetchActivities ALSO returns dayDistribution
//             // if (resultData.dayDistribution && !tripPlannerState.dayDistribution) {
//             //   tripPlannerState.dayDistribution = resultData.dayDistribution;
//             //   tripPlannerState.stats = resultData.stats || null;
//             // }
//           } else if (toolCall.toolName === 'fetchActivities' && resultData?.success) {
//             tripPlannerState.activitiesMap = resultData.activities

//             const count = resultData.count || 0;
//             step.description = `Selected ${count} recommended attractions`;
//             fetchedActivities = [...fetchedActivities, ...(resultData.activities || [])];

//             if (resultData.budgetAlternatives) {
//               step.description += ' (showing alternatives at different price points)';
//             }
//           } else if (toolCall.toolName === 'generateItinerary' && resultData?.success) {
//             step.description = resultData.summary;
//             tripPlannerState.dayDistribution = resultData.dayDistribution;
//             tripPlannerState.stats = resultData.stats;
//           }

//           thinkingSteps.push(step);
//         }

//         metadata.thinkingSteps = thinkingSteps;
//         metadata.toolCount = toolCalls.length;
//         const { activitiesMap, dayDistribution } = tripPlannerState;

//         if (dayDistribution && activitiesMap.length > 0) {
//           logger.info('🏗️ Building final itinerary (single execution)');

//           const itinerary: ItineraryItem[] = [];

//           for (const day of dayDistribution) {

//             day.activityIds.forEach((activityId: string, index: number) => {
//               const activity = activitiesMap.get(activityId);
//               // const activity = activitiesMap.find((a: any) => a._id === activityId);

//               if (!activity) return;

//               const timeSlot = day.timeSlots[index];

//               const itineraryItem: ItineraryItem = {
//                 id: `${day.day}-${index + 1}`,
//                 day: day.day,
//                 dayTitle: day.title,
//                 title: activity.name,
//                 type: 'activity',
//                 timeOfDay: timeSlot,
//                 sequence: index + 1,
//                 location: {
//                   lat: activity.latitude || 0,
//                   lng: activity.longitude || 0,
//                   address: `${activity.cityName || ''}, ${activity.countryName || ''}`.trim(),
//                 },
//                 startTime: timeSlot === 'Morning' ? '09:00'
//                   : timeSlot === 'Afternoon' ? '13:00'
//                     : '17:00',
//                 duration: activity.duration || 120,
//                 cost: activity.price || activity.startingPrice,
//                 rating: activity.rating,
//                 description: activity.description,
//                 image: activity.image,
//                 activityId: activity._id,
//                 activityType: activity.type,
//                 label: activity.label,
//                 reviews: activity.reviews,
//                 backgroundImages: activity.backgroundImage,
//                 mobileBackgroundImages: activity.mobileBackgroundImage,
//                 choices: activity.choices,
//                 detailInfo: activity.detailInfo,
//                 tags: activity.tags,
//                 currency: activity.currency,
//                 startingPrice: activity.startingPrice,
//                 availability: activity.availability,
//                 countryName: activity.countryName,
//                 cityName: activity.cityName,
//                 isDiscount: activity.isDiscount,
//               };

//               itinerary.push(itineraryItem);
//             });
//           }

//           (metadata as any).itinerary = itinerary;
//           (metadata as any).itineraryStats = tripPlannerState.stats;
//           (metadata as any).analyzedPreferences = tripPlannerState.preferences;
//           (metadata as any).plannerId = tripPlannerState.id;
//           (metadata as any).threadId = id;

//           logger.info(`✅ Final itinerary built: ${itinerary.length} items`);
//         }

//         // Now merge the AI text stream with metadata already populated
//         dataStream.merge(
//           result.toUIMessageStream({
//             messageMetadata: ({ part }) => {
//               if (part.type === "finish") {
//                 metadata.usage = part.totalUsage;
//                 return metadata;
//               }
//             },
//           }),
//         );
//       },

//       generateId: generateUUID,
//       onFinish: async ({ responseMessage }) => {
//         logger.info('Chat stream finished');
//       },
//       onError: handleError,
//       originalMessages: messages,
//     });

//     return createUIMessageStreamResponse({
//       stream,
//     });

//   } catch (error) {
//     logger.error('Error processing Chat API request:', error);
//     return new Response('Internal Server Error', { status: 500 });
//   }
// }

import logger from '@/lib/logger';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  LanguageModel,
  smoothStream,
  streamText,
} from 'ai';
import { chatApiSchemaRequestBodySchema, ChatMetadata, ThinkingStep } from 'app-types/chat';
import { customModelProvider } from 'lib/ai/models';
import { getSystemPrompt } from 'lib/ai/prompt';
import { tripPlanningTools } from 'lib/ai/tools';
import { generateUUID, countDaysInclusive } from 'lib/utils';
import { handleError } from './shared.chat';
import { ItineraryItem } from '@/types/trip';
import getOrCreateTripPlannerState from '@/lib/getOrCreateTripPlannerState';

export const maxDuration = 60;

function upsertActivitiesIntoMap(
  map: Map<string, any>,
  activities: any[],
) {
  for (const a of activities || []) {
    if (!a?._id) continue;
    map.set(a._id, a);
  }
}




export async function POST(req: Request) {
  try {
    logger.info('Chat API POST request received');

    const json = await req.json();
    const { id, messages, chatModel, preferences } =
      chatApiSchemaRequestBodySchema.parse(json);

    const model: LanguageModel = customModelProvider.getModel(chatModel);

    // Planner state keyed by single id (your requirement)
    const tripPlannerState = getOrCreateTripPlannerState(id);

    const metadata: ChatMetadata = {
      toolChoice: 'auto',
      toolCount: 0,
      chatModel,
      thinkingSteps: [],
    };

    // Hydrate fetchedActivities from history (assistant tool invocations)
    let fetchedActivities: any[] = [];
    if (messages && messages.length > 0) {
      for (const msg of messages as any[]) {
        if (msg.role !== 'assistant' || !msg.toolInvocations) continue;

        for (const toolInvocation of msg.toolInvocations as any[]) {
          if (
            toolInvocation.toolName === 'fetchActivities' &&
            toolInvocation.state === 'result'
          ) {
            const result = toolInvocation.result;
            const activities =
              result?.activities ||
              result?.output?.activities ||
              result?.result?.activities ||
              [];

            if (activities.length > 0) {
              logger.info(`🔄 Hydrated ${activities.length} activities from history (msg: ${msg.id})`);
              fetchedActivities.push(...activities);
            }
          }
        }
      }
    }

    // Deduplicate by _id
    fetchedActivities = Array.from(
      new Map(fetchedActivities.filter(a => a?._id).map(a => [a._id, a])).values(),
    );

    // Persist hydrated activities into planner state's Map
    if (!(tripPlannerState.activitiesMap instanceof Map)) {
      // if older state shape exists, normalize
      tripPlannerState.activitiesMap = new Map<string, any>();
    }
    upsertActivitiesIntoMap(tripPlannerState.activitiesMap, fetchedActivities);

    logger.info(`📊 Total unique activities available: ${tripPlannerState.activitiesMap.size}`);

    const thinkingSteps: ThinkingStep[] = [];

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          system: await getSystemPrompt(),
          model,
          messages: convertToModelMessages(messages),
          experimental_transform: smoothStream({ chunking: 'word' }),
          maxRetries: 2,
          tools: tripPlanningTools,
          toolChoice: 'auto',
        });

        const toolCalls = await result.toolCalls;
        const toolResults = await result.toolResults;

        logger.info(`✅ Completed with ${toolCalls.length} tool calls`);

        for (let i = 0; i < toolCalls.length; i++) {
          const toolCall = toolCalls[i];
          const toolResult: any = toolResults?.[i];

          const resultData = toolResult?.result ?? toolResult?.output;

          const stepType =
            toolCall.toolName === 'analyzePreferences'
              ? 'analyze_preferences'
              : toolCall.toolName === 'fetchActivities'
                ? 'fetch_activities'
                : 'generate_itinerary';

          const stepTitle =
            toolCall.toolName === 'analyzePreferences'
              ? 'Analyze User Preferences'
              : toolCall.toolName === 'fetchActivities'
                ? 'Retrieve Resources'
                : 'Generate Itinerary';

          const step: ThinkingStep = {
            id: generateUUID(),
            step: stepType,
            title: stepTitle,
            status: 'completed',
            result: toolResult?.result,
            timestamp: new Date(),
          };

          if (toolCall.toolName === 'analyzePreferences' && resultData?.success) {
            step.description = resultData.summary;

            const nextPreferences = {
              ...(preferences ?? {}),
              ...(resultData.preferences ?? {}),
            };

            // ✅ If dates exist, derive numberOfDays from them
            if (nextPreferences.dates?.from && nextPreferences.dates?.to) {
              nextPreferences.numberOfDays = countDaysInclusive(
                nextPreferences.dates.from,
                nextPreferences.dates.to,
              );
            }

            // ❌ Ensure we do NOT keep stale numberOfDays if dates are missing
            if (!nextPreferences.dates) {
              delete nextPreferences.numberOfDays;
            }

            // 🧹 RESET STATE if user starts a new trip
            if (resultData.preferences?.userIntent === 'new_trip') {
              logger.info(`🧹 Resetting trip planner state for new trip (id: ${id})`);
              tripPlannerState.activitiesMap.clear();
              tripPlannerState.dayDistribution = null;
              tripPlannerState.stats = null;
              tripPlannerState.preferences = nextPreferences;
              fetchedActivities = []; // Clear local fetched activities
            } else {
              tripPlannerState.preferences = nextPreferences;
            }

            console.log(
              '✅ normalized preferences',
              nextPreferences,
            );
          }


          if (toolCall.toolName === 'fetchActivities' && resultData?.success) {
            const activities = resultData.activities || [];
            upsertActivitiesIntoMap(tripPlannerState.activitiesMap, activities);

            const count = resultData.count ?? activities.length;
            step.description = `Selected ${count} recommended attractions`;

            if (resultData.budgetAlternatives) {
              step.description += ' (showing alternatives at different price points)';
            }
          }

          if (toolCall.toolName === 'generateItinerary' && resultData?.success) {
            step.description = resultData.summary;
            tripPlannerState.dayDistribution = resultData.dayDistribution;
            tripPlannerState.stats = resultData.stats;
          }

          thinkingSteps.push(step);
        }

        metadata.thinkingSteps = thinkingSteps;
        metadata.toolCount = toolCalls.length;

        const activitiesMap = tripPlannerState.activitiesMap as Map<string, any>;
        const dayDistribution = tripPlannerState.dayDistribution;

        if (dayDistribution && activitiesMap.size > 0) {
          logger.info('🏗️ Building final itinerary (single execution)');

          const itinerary: ItineraryItem[] = [];

          for (const day of dayDistribution as any[]) {
            day.activityIds.forEach((activityId: string, index: number) => {
              const activity = activitiesMap.get(activityId);
              if (!activity) return;

              const timeSlot = day.timeSlots?.[index];

              const itineraryItem: ItineraryItem = {
                id: `${day.day}-${index + 1}`,
                day: day.day,
                dayTitle: day.title,
                title: activity.name,
                type: 'activity',
                timeOfDay: timeSlot,
                sequence: index + 1,
                location: {
                  lat: activity.latitude || 0,
                  lng: activity.longitude || 0,
                  address: `${activity.cityName || ''}, ${activity.countryName || ''}`.trim(),
                },
                startTime:
                  timeSlot === 'Morning'
                    ? '09:00'
                    : timeSlot === 'Afternoon'
                      ? '13:00'
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
            });
          }

          (metadata as any).itinerary = itinerary;
          (metadata as any).itineraryStats = tripPlannerState.stats;
          (metadata as any).analyzedPreferences = tripPlannerState.preferences;
          (metadata as any).plannerId = tripPlannerState.id;
          (metadata as any).threadId = id;

          logger.info(`✅ Final itinerary built: ${itinerary.length} items`);
        }

        dataStream.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              if (part.type === 'finish') {
                metadata.usage = part.totalUsage;
                return metadata;
              }
            },
          }),
        );
      },

      generateId: generateUUID,
      onFinish: async () => {
        logger.info('Chat stream finished');
      },
      onError: handleError,
      originalMessages: messages,
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    logger.error('Error processing Chat API request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
