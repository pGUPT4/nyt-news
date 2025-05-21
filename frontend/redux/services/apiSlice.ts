import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';


const baseQuery = fetchBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/` });

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User'],
    endpoints: (builder) => ({}),
});