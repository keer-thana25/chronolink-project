import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  category: 'spiritual' | 'tech' | 'blend';
  createdBy: string;
  title?: string;
  content?: string;
  mediaType: 'text' | 'image' | 'video';
  mediaUrl?: string;
  mediaBase64?: string;
  generation: 'young' | 'old';
  author?: {
    id: string;
    username: string;
    generation: string;
    profilePicture?: string;
  };
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  comments: Array<{
    user: {
      id: string;
      username: string;
      profilePicture?: string;
    };
    text: string;
    createdAt: string;
  }>;
  isFeatured: boolean;
  views: number;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  mediaType?: 'text' | 'image' | 'video';
  mediaUrl?: string;
  mediaBase64?: string;
  category: string;
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    generation?: string;
  }): Observable<PostsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.generation) httpParams = httpParams.set('generation', params.generation);
    }

    return this.http.get<PostsResponse>(`${this.apiUrl}/posts`, { params: httpParams });
  }

  getPostById(id: string): Observable<{ success: boolean; post: Post }> {
    return this.http.get<{ success: boolean; post: Post }>(`${this.apiUrl}/posts/${id}`);
  }

  createPost(postData: CreatePostRequest, imageFile?: File): Observable<{ success: boolean; post: Post }> {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('category', postData.category);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<{ success: boolean; post: Post }>(`${this.apiUrl}/posts`, formData);
  }

  updatePost(id: string, postData: Partial<CreatePostRequest>): Observable<{ success: boolean; post: Post }> {
    return this.http.put<{ success: boolean; post: Post }>(`${this.apiUrl}/posts/${id}`, postData);
  }

  deletePost(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/posts/${id}`);
  }

  likePost(id: string): Observable<{ success: boolean; likes: number; isLiked: boolean }> {
    return this.http.post<{ success: boolean; likes: number; isLiked: boolean }>(`${this.apiUrl}/posts/${id}/like`, {});
  }

  addComment(id: string, text: string): Observable<{ success: boolean; comments: any[] }> {
    return this.http.post<{ success: boolean; comments: any[] }>(`${this.apiUrl}/posts/${id}/comment`, { text });
  }

  getFeed(): Observable<{ success: boolean; posts: Post[] }> {
    return this.http.get<{ success: boolean; posts: Post[] }>(`${this.apiUrl}/posts/feed`);
  }

  getFeaturedPosts(): Observable<{ success: boolean; posts: Post[] }> {
    return this.http.get<{ success: boolean; posts: Post[] }>(`${this.apiUrl}/posts/featured`);
  }

  getGenerationConnection(): Observable<{ success: boolean; posts: Post[] }> {
    return this.http.get<{ success: boolean; posts: Post[] }>(`${this.apiUrl}/posts/generation-connection`);
  }

  getRecommendations(userId?: string): Observable<{ success: boolean; posts: Post[]; basedOn: string }> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<{ success: boolean; posts: Post[]; basedOn: string }>(`${this.apiUrl}/posts/recommendations`, { params });
  }
}
