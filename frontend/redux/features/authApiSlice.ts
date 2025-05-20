import { apiSlice } from '../services/apiSlice';



export const userApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			query: ({email, password}) => ({
				url: `auth/login`,
				method: 'POST',
				body: {email, password},
			}),
		}),
		logout: builder.mutation({
			query: () => ({
				url: `auth/logout`,
				method: 'POST',
			}),
		}),
		signup: builder.mutation({
			query: ({email, password, re_password}) => ({
				url: `auth/signup`,
				method: 'POST',
				body: {email, password, re_password},
			}),
		}),
		check: builder.query({
			query: () => `auth/check`,
		}),
	}),
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useSignupMutation,
	useCheckQuery,
} = userApiSlice;