export interface ServiceResponse<RES> {
    success: boolean;
    data: RES | null;
    error?: string;
}

export async function makeServiceCall<REQ extends Record<string, any>, RES extends Object>
(endpoint: { url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' }, data?: REQ): Promise<ServiceResponse<RES>> {
    // filter out any undefined values from data
    if (data) {
        Object.keys(data).forEach(key => {
            if (data[key] === undefined) {
                delete data[key];
            }
        });
    }
    console.log(`Making service call to ${endpoint.method} ${endpoint.url} with data:`, data);
    try {
        const options: RequestInit = {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const url = new URL(endpoint.url)
        if (data) {
            if (endpoint.method === 'GET' || endpoint.method === 'DELETE') {
                // const url = new URL(endpoint.url);
                Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));
            } else {
                options.body = JSON.stringify(data);
            }
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            return {success: false, data: null, error: `HTTP error! status: ${response.status}`};
        }
        console.log(`Received response from ${endpoint.method} ${endpoint.url}:`, response);
        const responseData = await response.json() as RES;
        return {success: true, data: responseData};
    } catch (error) {
        console.error(error);
        return {success: false, data: null, error: (error as Error).message};
    }
}
