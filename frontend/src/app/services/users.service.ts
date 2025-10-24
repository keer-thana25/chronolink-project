import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService, User } from './auth.service';

export interface UsersResponse {
  success: boolean;
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserProfile extends User {
  postCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(params?: {
    page?: number;
    limit?: number;
    generation?: string;
  }): Observable<UsersResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.generation) httpParams = httpParams.set('generation', params.generation);
    }

    return this.http.get<UsersResponse>(`${this.apiUrl}/users`, { params: httpParams });
  }

  getUserById(id: string): Observable<{ success: boolean; user: UserProfile }> {
    return this.http.get<{ success: boolean; user: UserProfile }>(`${this.apiUrl}/users/${id}`);
  }

  searchUsers(query: string, generation?: string): Observable<{ success: boolean; users: User[]; query: string }> {
    let params = new HttpParams().set('q', query);
    if (generation) {
      params = params.set('generation', generation);
    }

    return this.http.get<{ success: boolean; users: User[]; query: string }>(`${this.apiUrl}/users/search`, { params });
  }

  followUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/users/${id}/follow`, {});
  }

  unfollowUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/users/${id}/follow`);
  }

  getFollowers(id: string): Observable<{ success: boolean; followers: User[] }> {
    return this.http.get<{ success: boolean; followers: User[] }>(`${this.apiUrl}/users/${id}/followers`);
  }

  getFollowing(id: string): Observable<{ success: boolean; following: User[] }> {
    return this.http.get<{ success: boolean; following: User[] }>(`${this.apiUrl}/users/${id}/following`);
  }

  updateProfile(profileData: {
    bio?: string;
    interests?: string[];
    achievements?: string[];
  }): Observable<{ success: boolean; user: any }> {
    return this.http.put<{ success: boolean; user: any }>(`${this.apiUrl}/users/profile`, profileData);
  }
}
