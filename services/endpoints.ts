export const HOST = "api"

interface EndpointSpecs {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export const ENDPOINTS = {
    LIST_DATES: {
        url: `${HOST}/dates`,
        method: 'GET',
    },
    SOLVE: {
        url: `${HOST}/solve`,
        method: 'POST',
    },
    SAVE_SOLVE: {
        url: `${HOST}/solve/save`,
        method: 'POST',
    },
    SOLVE_SUMMARY: {
        url: `${HOST}/solve/summary`,
        method: 'GET',
    },
    SOLVE_DETAILS: {
        url: `${HOST}/solve/details`,
        method: 'GET',
    },
    GET_STRINGS: {
        url: `${HOST}/strings`,
        method: 'GET',
    },
    GET_DISPATCHERS: {
        url: `${HOST}/dispatchers`,
        method: 'GET',
    }
} as const satisfies Record<string, EndpointSpecs>;
