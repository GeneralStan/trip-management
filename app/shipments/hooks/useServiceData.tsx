import React from 'react';
import {getDatesService, getDispatchersService} from "@/services/REST";
import {ToastStatus} from "@/components/Toast";

interface ServiceData {
    dates: string[],
    dispatchers: string[],
    delivery_types: string[]

    is_loading: boolean
}


export function useServiceData(setToastMessage: (status: ToastStatus, msg: string) => void): ServiceData {
    const [is_loading, setIsLoading] = React.useState<boolean>(true)

    const [dates, setDates] = React.useState<string[]>([]);
    const [dispatchers, setDispatchers] = React.useState<string[]>([]);
    const [delivery_types, setDeliveryTypes] = React.useState<string[]>([]);

    React.useEffect(() => {
        setIsLoading(true);
        Promise.all([
            getDatesService().then(res => {
                setDates(res.data?.dates || []);
                return res
            }),
            getDispatchersService().then(res => {
                setDispatchers(res.data?.dispatchers || []);
                setDeliveryTypes(res.data?.delivery_types || []);
                return res
            })
        ]).then(responses => {
            responses.filter((item) => item.error)
                .forEach(response => {
                    setToastMessage("error",`Error fetching data: ${response.error || 'Unknown error'}`);
                });
        }).catch(error => {
            setToastMessage("error",`Error fetching data: ${error.message || 'Unknown error'}`);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    return {
        dates,
        dispatchers,
        delivery_types,
        is_loading
    }
}
