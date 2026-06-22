import { newsApi } from "@/api/newsApi";
import { ApiResponse } from "@/api/types";
import { News, NewsFilters, NewsFormCreate, NewsListDataResponse, PublicNewsItem } from "@/dataHelper/news.dataHelper";
import { HOMEPAGE_QUERY_OPTIONS, PUBLIC_STATIC_QUERY_OPTIONS } from "@/lib/queryCache";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// get all news
export const useNewsQuery = (data: NewsFilters) => {
    return useQuery<ApiResponse<NewsListDataResponse>, Error>({
        queryKey: ['news', data],
        queryFn: async () => {
            const response = await newsApi.getNews(data);
            return response;
        }
    });
}

// get news by id
export const useNewsByIdQuery = (id: number) => {
    return useQuery<ApiResponse<News>, Error>({
        queryKey: ['news', id],
        queryFn: async () => {
            const response = await newsApi.getNewsById(id);
            return response;
        }
    });
}

// create news
export const useCreateNewsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<News>, Error, NewsFormCreate>({
        mutationFn: (data: NewsFormCreate) => newsApi.createNews(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }
    });
}

// update news
export const useUpdateNewsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<News>, Error, News>({
        mutationFn: (data: News) => newsApi.updateNews(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }
    });
}

// delete news
export const useDeleteNewsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<string>, Error, number>({
        mutationFn: (id: number) => newsApi.deleteNews(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }
    });
}

// latest public news
export const useLatestNewsQuery = (limit = 6, enabled = true) => {
    return useQuery<ApiResponse<PublicNewsItem[]>, Error>({
        queryKey: ['news-latest', limit],
        queryFn: async () => newsApi.getLatestNews({ limit }),
        enabled,
        ...HOMEPAGE_QUERY_OPTIONS,
    });
}

// news detail public
export const useNewsDetailPublicQuery = (id: number) => {
    return useQuery<ApiResponse<News>, Error>({
        queryKey: ['news-detail-public', id],
        queryFn: async () => newsApi.getNewsDetailPublic(id),
        enabled: id > 0,
        ...PUBLIC_STATIC_QUERY_OPTIONS,
    });
}

// news list public
export const useListNewsPublicQuery = (data: NewsFilters) => {
    return useQuery<ApiResponse<NewsListDataResponse>, Error>({
        queryKey: ['news-list-public', data],
        queryFn: async () => newsApi.getListNewsPublic(data),
        ...PUBLIC_STATIC_QUERY_OPTIONS,
    });
}
