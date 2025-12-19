import { ItineraryLayout } from "@/components/trip-planner/itinerary-layout";

type Props = {
    params: Promise<{
        deviceId: string;
    }>;
};

export default async function ItineraryPage({ params }: Props) {
    const { deviceId } = await params;

    return <ItineraryLayout deviceId={deviceId} />;
}
