"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Star, MapPin, Tag, TrendingDown, GripVertical } from 'lucide-react';
import { ItineraryItem } from '@/types/trip';
import { formatPriceRange, calculateDiscount } from '@/lib/activityUtils';;
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function ActivitySkeleton() {
    return (
        <div className="w-full bg-white rounded-xl border p-4 flex gap-4 animate-pulse">
            <div className="w-32 h-28 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 flex flex-col gap-3">
                <div className="w-40 h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                <div className="flex gap-4 mt-2">
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    <div className="w-14 h-4 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="flex items-end">
                <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
}

interface ActivityCardProps {
    activity: ItineraryItem;
    isLast: boolean;
    isOverlay?: boolean;
}

function ActivityCard({ activity, isLast, isOverlay }: ActivityCardProps) {
    const { selectedActivity, setSelectedActivity } = useTripStore();
    const isSelected = selectedActivity?.id === activity.id;
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (!isOverlay) {
            setSelectedActivity(activity);
        }
    }, [activity, setSelectedActivity, isOverlay]);

    const handleClick = useCallback(() => {
        if (!isOverlay) {
            setSelectedActivity(activity);
            // Scroll card into view if needed
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [activity, setSelectedActivity, isOverlay]);

    return (
        <div className={`flex gap-4 ${isOverlay ? 'opacity-90' : ''}`} ref={cardRef}>
            {/* Sequence Indicator */}
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                    {activity.sequence}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
            </div>

            {/* Activity Content */}
            <div className="flex-1 pb-6">
                <Card
                    className={`hover:shadow-md transition-all cursor-pointer mr-2 ${isSelected ? 'ring-2 ring-primary shadow-md' : ''
                        }`}
                    onMouseEnter={handleMouseEnter}
                    onClick={handleClick}
                >
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            {/* Activity Image */}
                            {activity.image && (
                                <div className="relative shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-muted">
                                    {/* Activity Image */}
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${activity.image}`}
                                        alt={activity.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />

                                    {/* Badge top-left */}
                                    {activity.activityType && (
                                        <Badge
                                            variant="outline"
                                            className="absolute top-2 left-2 text-[10px] bg-white/80 backdrop-blur-sm flex items-center gap-1"
                                        >
                                            <Tag className="h-3 w-3" />
                                            {activity.activityType}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Activity Details */}
                            <div className="flex-1 min-w-0">
                                {/* Time of Day Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                    {activity.timeOfDay && (
                                        <Badge variant="secondary">
                                            {activity.timeOfDay}
                                        </Badge>
                                    )}

                                    {activity.isDiscount && (
                                        <Badge variant="destructive" className="text-xs">
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                            Discount
                                        </Badge>
                                    )}
                                </div>

                                {/* Title */}
                                <h4 className="font-semibold text-base mt-2">{activity.title}</h4>

                                {/* Description */}
                                {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                        {activity.description}
                                    </p>
                                )}

                                {/* Location */}
                                {activity.location?.address && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{activity.location.address}</span>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className='flex items-center justify-between flex-wrap gap-4 mt-3 text-xs'>
                                    <div className="flex items-center flex-wrap gap-4 mt-3 text-xs">
                                        {activity.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{activity.rating}</span>
                                                {activity.reviews !== undefined && activity.reviews > 0 && (
                                                    <span className="text-muted-foreground">({activity.reviews})</span>
                                                )}
                                            </div>
                                        )}
                                        {activity.duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span className="font-medium">{activity.duration}min</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-4 text-xs">
                                        {activity.cost !== undefined && (
                                            <div className="flex items-center gap-2">
                                                {activity.choices && activity.choices.length > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-sm text-primary">
                                                            {formatPriceRange(activity.choices, activity.currency || 'AED')}
                                                        </span>
                                                        {activity.isDiscount && activity.startingPrice && activity.startingPrice > activity.cost && (
                                                            <span className="text-xs text-muted-foreground line-through">
                                                                {activity.currency || 'AED'} {activity.startingPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-sm text-primary">
                                                        {activity.currency || 'AED'} {activity.cost}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface SortableActivityCardProps extends ActivityCardProps {
    id: string;
}

function SortableActivityCard({ id, ...props }: SortableActivityCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-[-24px] top-8 p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
                <GripVertical className="h-5 w-5" />
            </div>
            <ActivityCard {...props} />
        </div>
    );
}

interface DayCardProps {
    dayNumber: number;
    dayTitle: string;
    activities: ItineraryItem[];
    destination: string;
}

function DayCard({ dayNumber, dayTitle, activities, destination }: DayCardProps) {
    const dayRef = useRef<HTMLDivElement>(null);
    const { setCurrentDay } = useTripStore();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        setCurrentDay(dayNumber);
                    }
                });
            },
            {
                threshold: [0.5],
                rootMargin: '-20% 0px -20% 0px',
            }
        );

        if (dayRef.current) {
            observer.observe(dayRef.current);
        }

        return () => {
            if (dayRef.current) {
                observer.unobserve(dayRef.current);
            }
        };
    }, [dayNumber, setCurrentDay]);

    return (
        <div className="mb-8 pl-4" ref={dayRef}>
            {/* Day Header */}
            <div className="mb-4">
                <h3 className="text-lg font-bold">
                    Day {dayNumber}: {dayTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {activities.length} activities planned
                </p>
            </div>

            {/* Activities */}
            <SortableContext
                items={activities.map(a => a.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-0">
                    {activities.map((activity, index) => (
                        <SortableActivityCard
                            key={activity.id}
                            id={activity.id}
                            activity={activity}
                            isLast={index === activities.length - 1}
                        />
                    ))}
                </div>
            </SortableContext>

            {/* Stay Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 ml-12">
                <MapPin className="h-4 w-4" />
                <span>→ Stay in {destination}</span>
            </div>
        </div>
    );
}

export function ItineraryFeed() {
    const { itinerary, isGenerating, preferences, reorderItinerary } = useTripStore();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group activities by day
    const groupedByDay = itinerary.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = {
                dayNumber: item.day,
                dayTitle: item.dayTitle || `Day ${item.day}`,
                activities: []
            };
        }
        acc[item.day].activities.push(item);
        return acc;
    }, {} as Record<number, { dayNumber: number; dayTitle: string; activities: ItineraryItem[] }>);

    // Sort activities within each day by sequence
    Object.values(groupedByDay).forEach(day => {
        day.activities.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    });

    const days = Object.values(groupedByDay).sort((a, b) => a.dayNumber - b.dayNumber);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            // Find which day the items belong to
            const activeItem = itinerary.find(item => item.id === active.id);
            const overItem = itinerary.find(item => item.id === over?.id);

            if (activeItem && overItem && activeItem.day === overItem.day) {
                // Reordering within the same day
                const dayActivities = groupedByDay[activeItem.day].activities;
                const oldIndex = dayActivities.findIndex(item => item.id === active.id);
                const newIndex = dayActivities.findIndex(item => item.id === over?.id);

                const newDayOrder = arrayMove(dayActivities, oldIndex, newIndex);

                // Update sequences
                const updatedDayActivities = newDayOrder.map((item, index) => ({
                    ...item,
                    sequence: index + 1
                }));

                // Create new full itinerary
                const newItinerary = itinerary.map(item => {
                    if (item.day === activeItem.day) {
                        return updatedDayActivities.find(a => a.id === item.id) || item;
                    }
                    return item;
                });

                reorderItinerary(newItinerary);
            }
        }
    };

    const activeItem = activeId ? itinerary.find(item => item.id === activeId) : null;

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    if (!isGenerating && itinerary.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground text-center p-8">
                <div>
                    <p className="text-lg font-medium mb-2">No itinerary yet</p>
                    <p className="text-sm">Fill out the form on the left to generate your trip plan.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 flex flex-col px-4 pt-4 pb-0">
            {/* Header with Overview */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Your Itinerary</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    {days.length} {days.length === 1 ? 'day' : 'days'} of adventure in {preferences.destination}
                </p>

                {/* Quick Stats */}
                {!isGenerating && itinerary.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <Card className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Total Days</div>
                            <div className="text-2xl font-bold">{days.length}</div>
                        </Card>
                        <Card className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Activities</div>
                            <div className="text-2xl font-bold">{itinerary.length}</div>
                        </Card>
                        <Card className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Per Day</div>
                            <div className="text-2xl font-bold">
                                {Math.round(itinerary.length / days.length * 10) / 10}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Content */}
            {isGenerating ? (
                <div className="flex flex-col gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ActivitySkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 min-h-0">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <ScrollArea className="flex-1 min-h-0 -mx-4 px-4 pb-4">
                            <div className="space-y-8">
                                {days.map((day) => (
                                    <DayCard
                                        key={day.dayNumber}
                                        dayNumber={day.dayNumber}
                                        dayTitle={day.dayTitle}
                                        activities={day.activities}
                                        destination={preferences.destination}
                                    />
                                ))}
                            </div>
                        </ScrollArea>

                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeItem ? (
                                <ActivityCard
                                    activity={activeItem}
                                    isLast={false}
                                    isOverlay
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}

            {/* Sticky Bottom Action Bar */}
            {!isGenerating &&
                <div className="sticky bottom-0 left-0 right-0 bg-background border-t z-30">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            {itinerary.length} activities · {days.length} days
                        </div>

                        <Button
                            size="lg"
                            className="px-8"
                            onClick={() => {
                                console.log('Save itinerary clicked', itinerary, groupedByDay, days);
                                // TODO: API call / modal / navigation
                            }}
                        >
                            Save Itinerary
                        </Button>
                    </div>
                </div>
            }


        </div>
    );
}
