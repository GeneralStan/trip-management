import React from "react";
import {ShipmentOrder} from "@/types/shipment";
import {getStringsService} from "@/services/REST";
import {ToastStatus} from "@/components/Toast";

interface UseOrdersResponse {
    orders: ShipmentOrder[];
    is_loading: boolean;
    // refetchOrders: () => void;
}

export function useOrders(
    date: string | undefined, dispatcher: string | undefined, delivery_type: string | undefined,
    setToastMessage: (status: ToastStatus, msg: string) => void
): UseOrdersResponse {
    const [orders, setOrders] = React.useState<ShipmentOrder[]>([]);
    const [is_loading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        console.log("Fetching orders with params:", {date, dispatcher, delivery_type});
        setIsLoading(true)
        getStringsService({
            date: date,
            dispatcher: dispatcher,
            delivery_type: delivery_type
        }).then(res => {
            setOrders(res.data?.results ?? []);
            console.log("Fetched orders:", res.data?.results);
            if (res.error) {
                setToastMessage("error", "Error fetching orders: " + res.error);
            }
        }).catch(err => {
            setToastMessage("error", "Error fetching orders: " + err.error?.message || err.message);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [date, delivery_type, dispatcher]);


    return { orders, is_loading  };
}
