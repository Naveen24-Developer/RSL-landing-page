"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTripStore } from "@/store/useTripStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { generateUUID, countDaysInclusive } from "lib/utils";
import { ChatApiSchemaRequestBody, ChatModel } from "app-types/chat";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Markdown } from "../markdown";
import { Textarea } from "ui/textarea";
import { ThinkingSteps } from "./thinking-steps";
import { useSearchParams } from "next/navigation";

const toDateStringSafe = (value?: string | Date | null) => {

    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? "" : date.toDateString();
};


export const ChatInterface = ({ deviceId }: { deviceId: string }) => {
    const {
        preferences,
        setItinerary,
        setPreferences,
        thinkingSteps,
        setThinkingSteps,
        clearThinkingSteps,
        setGenerating,
    } = useTripStore();

    // const deviceId = useSearchParams().get("deviceId");
    const hasInitialMessageSent = useRef(false);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const onFinish = useCallback((message: any) => {
        console.log("Chat session finished.", message);
        // setGenerating(false);

        // Extract itinerary and thinking steps from metadata
        const metadata = message?.message?.metadata;

        if (metadata?.thinkingSteps) {
            setThinkingSteps(metadata.thinkingSteps);
        }

        if (metadata?.itinerary) {
            console.log('📋 Setting itinerary:', metadata.itinerary);
            setItinerary(metadata.itinerary);

            // Update preferences if they were analyzed
            if (metadata.analyzedPreferences) {
                setPreferences(metadata.analyzedPreferences);
            }
        }
    }, [setItinerary, setThinkingSteps, setPreferences, setGenerating]);

    const {
        messages,
        status,
        error,
        sendMessage,
    } = useChat({
        id: `${deviceId}`,
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        transport: new DefaultChatTransport({
            prepareSendMessagesRequest: ({ messages, body, id }) => {
                const lastMessage = messages.at(-1)!;

                const requestBody: ChatApiSchemaRequestBody = {
                    ...body,
                    id,
                    chatModel: { provider: 'google', model: 'gemini-2.0-flash' } as ChatModel,
                    preferences: preferences,
                    message: lastMessage,
                    messages: messages,
                };
                return { body: requestBody };
            },
        }),
        messages: [],
        generateId: generateUUID,
        experimental_throttle: 100,
        onFinish,
        onError(error) {
            console.error('Chat error:', error);
            setGenerating(false);
        },
    });

    const isLoading = useMemo(
        () => status === "streaming" || status === "submitted",
        [status],
    );

    useEffect(() => {
        setGenerating(isLoading);
    }, [isLoading]);

    // Initialize input with preferences
    useEffect(() => {
        if (hasInitialMessageSent.current) return;
        hasInitialMessageSent.current = true;

        if (preferences.destination && preferences.dates?.from && preferences.dates?.to) {
            const numberOfDays = countDaysInclusive(preferences.dates.from, preferences.dates.to);


            setInput(
                `I want to go to ${preferences.destination} from ${toDateStringSafe(preferences.dates.from)} to ${toDateStringSafe(preferences.dates.to)} (${numberOfDays} days)` +
                `${preferences.budget !== "all" ? `. My budget is ${preferences.budget}` : ""}. ` +
                `My trip type is ${preferences.tripType}` +
                `${preferences.interests.length ? ` and I am interested in ${preferences.interests.join(", ")}` : ""}. ` +
                `Please help me plan my trip!`
            );
        }
    }, [preferences]);



    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Clear previous thinking steps when sending new message
        clearThinkingSteps();
        // setGenerating(true);

        sendMessage({
            role: "user",
            parts: [
                {
                    type: "text",
                    text: input,
                },
            ],
        });
        setInput("");
    };

    return (
        <div className="flex flex-col h-full border-r overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 overflow-hidden">
                <div className="space-y-4 p-4">
                    {messages.map((message, messageIndex) => (
                        <div key={message.id}>
                            <div
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 h-full ${message.role === "user"
                                        ? "bg-muted rounded-lg rounded-tr-none"
                                        : "bg-muted rounded-lg rounded-tl-none"
                                        }`}
                                >
                                    {message.parts.map((part, index) => {
                                        const key = `message-${messageIndex}-part-${part.type}-${index}`;
                                        return part.type === 'text' ? <Markdown key={key}>{part.text}</Markdown> : null;
                                    }
                                    )}
                                </div>
                                {message.role === "user" && (
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Show thinking steps after assistant message */}
                            {message.role === "assistant" && messageIndex === messages.length - 1 && thinkingSteps.length > 0 && (
                                <div className="ml-11 mt-3">
                                    <ThinkingSteps steps={thinkingSteps} isStreaming={isLoading} />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            </div>
                            <Card className="bg-muted px-4 py-2">
                                <p className="text-sm text-muted-foreground">Thinking...</p>
                            </Card>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="shrink-0 border-t p-4 bg-card h-auto">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                        placeholder="Ask me anything about your trip..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                        rows={3}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="self-end"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
