"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { ChatMessage } from '@/types/trip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Bot, User as UserIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { DeepDiveThinking } from './DeepDiveThinking';
import { TripOverview } from './TripOverview';

const OverviewSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />

            {/* 3 days of skeleton blocks */}
            {[1, 2, 3].map((day) => (
                <div
                    key={day}
                    className="border rounded-xl p-4 bg-white space-y-4 shadow-sm"
                >
                    {/* Day Header */}
                    <div className="flex items-start gap-4">
                        {/* Day Number */}
                        <div className="text-center">
                            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse mt-1" />
                        </div>

                        {/* Destination */}
                        <div className="flex-1">
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Activities List */}
                    <div className="space-y-3">
                        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export function ChatbotInterface() {
    const { preferences, setChatMode, setPreferences, setItinerary, isGenerating } = useTripStore();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hello! I'm your AI travel assistant for ${preferences.destination}. Ask me anything about activities, restaurants, or itinerary planning!`,
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to newest message
    // Auto-scroll to newest message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/gen-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    preferences: {
                        destination: preferences.destination,
                        budget: preferences.budget,
                        tripType: preferences.tripType,
                        interests: preferences.interests,
                    },
                }),
            });

            const data = await response.json();

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Handle itinerary data (chat API now returns full itinerary)
            if (data.itinerary && data.itinerary.length > 0) {
                console.log("ChatbotInterface: Received itinerary with", data.itinerary.length, "items");
                setItinerary(data.itinerary);
            }

            // Handle preference updates (for conversation memory)
            if (data.updatedPreferences) {
                setPreferences(data.updatedPreferences);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 30);

        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setChatMode(false)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Form
                    </Button>
                    {/* <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Assistant
                    </Badge> */}
                </div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Trip Planning Assistant
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Planning your trip to {preferences.destination}
                </p>
            </div>

            {/* Chat Messages */}
            {
                isGenerating ?
                    <ScrollArea className="flex-1 p-4">
                        <DeepDiveThinking />
                        <OverviewSkeleton />
                    </ScrollArea> :
                    <ScrollArea className="flex-1 p-4">
                        <DeepDiveThinking />
                        <TripOverview />
                        <div className="space-y-4 mb-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                        }`}
                                >
                                    <div
                                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <UserIcon className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div
                                        className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'
                                            }`}
                                    >
                                        <Card
                                            className={`p-3 ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </Card>
                                        <p className="text-xs text-muted-foreground mt-1 px-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <Card className="p-3 bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </Card>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
            }


            {/* Input Area */}
            {
                !isGenerating &&
                <div className="p-4 border-t bg-background">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about your trip..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            size="icon"
                            className="shrink-0"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Ask about activities, restaurants, or itinerary planning
                    </p>
                </div>
            }

        </div>
    );
}
