import { ApiResponse } from "./types";
import axiosClient from "./axiosClient";
import {
  News,
  NewsFilters,
  NewsFormCreate,
  NewsListDataResponse,
  PublicNewsItem,
} from "@/dataHelper/news.dataHelper";

export const newsApi = {
  // Public latest news (home page)
  getLatestNews: async (params?: { limit?: number }): Promise<ApiResponse<PublicNewsItem[]>> =>
    axiosClient.get("home/news/latest", { params }),

  // Admin news endpoints
  getNews: async (data: NewsFilters): Promise<ApiResponse<NewsListDataResponse>> =>
    axiosClient.get("admin/news", { params: data }),
    // Get news by id
  getNewsById: async (id: number): Promise<ApiResponse<News>> =>
    axiosClient.get(`admin/news/${id}`),
    // Create news
  createNews: async (data: NewsFormCreate): Promise<ApiResponse<News>> =>
    axiosClient.post("admin/news", data),
    // Update news
  updateNews: async (id: number, data: News): Promise<ApiResponse<News>> =>
    axiosClient.put(`admin/news/${id}`, data),
    // delete news
  deleteNews: async (id: number): Promise<ApiResponse<string>> =>
    axiosClient.delete(`admin/news/${id}`),

  // Public news detail
  getNewsDetailPublic: async (id: number): Promise<ApiResponse<News>> =>
    axiosClient.get(`news/detail-news/${id}`),

  // Public news list
  getListNewsPublic: async (data: NewsFilters): Promise<ApiResponse<NewsListDataResponse>> =>
    axiosClient.get("news/list-news", { params: data }),
}
