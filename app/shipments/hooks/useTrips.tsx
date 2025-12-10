import {ShipmentTrip} from "@/types/shipment";
import React from "react";
import {getSolveSummaryService} from "@/services/REST";
import {ToastStatus} from "@/components/Toast";

interface UseTripsResponse {
    trips: ShipmentTrip[];
    is_loading: boolean;
    // refetchTrips: () => void;
}

export function useTrips(date: string,setToastMessage: (status: ToastStatus,msg: string) => void): UseTripsResponse {
    const [trips, setTrips] = React.useState<ShipmentTrip[]>([]);
    const [is_loading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        setIsLoading(true);
        getSolveSummaryService({date}).then(res => {
            setTrips(res.data?.results ?? []);
            console.log("Fetched trips:", res.data?.results);
            if (res.error) {
                setToastMessage("error", "Error fetching trips: " + res.error);
            }
        })
        .catch(err => {
            setToastMessage("error", "Error fetching trips: " + (err.error?.message || err.message));
            console.error("Error fetching trips:", err);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [date]);

    return { trips, is_loading  };
}
