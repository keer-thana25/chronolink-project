import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { PostsService, Post } from '../../services/posts.service';
import { GSAPService } from '../../services/gsap.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-chronolink-primary font-display">ChronoLink</h1>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Navigation -->
              <nav class="hidden md:flex space-x-6">
                <a routerLink="/home" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">Home</a>
                <a routerLink="/connect" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">Connect</a>
                <a routerLink="/ai-recommendations" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">AI Recommendations</a>
                <a routerLink="/profile" class="text-chronolink-primary font-medium">Profile</a>
              </nav>
              <button class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">
                <i class="fas fa-bell text-xl"></i>
              </button>
              <button class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">
                <i class="fas fa-cog text-xl"></i>
              </button>
              <div class="w-8 h-8 bg-chronolink-primary rounded-full flex items-center justify-center cursor-pointer" (click)="goToProfile()">
                <span class="text-white text-sm font-medium">{{ getInitials(currentUser?.username) }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-chronolink-primary font-display">Profile</h1>
          <div class="flex space-x-3">
            <button
              (click)="createPost()"
              class="px-4 py-2 bg-chronolink-primary text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 flex items-center space-x-2">
              <i class="fas fa-plus"></i>
              <span>Create Post</span>
            </button>
            <button
              (click)="editProfile()"
              class="btn-secondary flex items-center space-x-2">
              <i class="fas fa-edit"></i>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Profile Info -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <!-- Profile Picture -->
              <div class="profile-picture-container mb-6">
                <div class="w-32 h-32 bg-chronolink-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-4xl font-medium">{{ getInitials(currentUser?.username) }}</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">{{ currentUser?.username }}</h2>
                <p class="text-gray-600">Member since {{ formatDate(currentUser?.createdAt || '') }}</p>
              </div>

              <!-- Stats -->
              <div class="stats-container grid grid-cols-3 gap-4 mb-6">
                <div class="stat-item text-center">
                  <div class="text-2xl font-bold text-chronolink-primary">{{ userStats.posts }}</div>
                  <div class="text-sm text-gray-600">Posts</div>
                </div>
                <div class="stat-item text-center">
                  <div class="text-2xl font-bold text-chronolink-primary">{{ userStats.followers }}</div>
                  <div class="text-sm text-gray-600">Followers</div>
                </div>
                <div class="stat-item text-center">
                  <div class="text-2xl font-bold text-chronolink-primary">{{ userStats.following }}</div>
                  <div class="text-sm text-gray-600">Following</div>
                </div>
              </div>

            </div>
          </div>

          <!-- User's Posts -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">My Posts</h3>

              <div *ngIf="userPosts.length === 0 && !isLoading" class="text-center py-12">
                <i class="fas fa-pen-fancy text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">No posts yet. Share your first story!</p>
                <button class="btn-primary mt-4">Create Post</button>
              </div>

              <div class="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let post of userPosts; trackBy: trackByPostId"
                     class="post-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                  <!-- Post Image -->
                  <div class="relative">
                    <img [src]="post.imageUrl || post.mediaUrl" [alt]="post.caption"
                         class="w-full h-48 object-cover" (error)="onImageError($event)">
                    <div class="absolute top-2 right-2">
                      <span class="px-2 py-1 bg-black bg-opacity-50 text-white rounded-full text-xs font-medium">
                        {{ post.generation === 'young' ? 'Young' : post.generation === 'old' ? 'Old' : 'User' }}
                      </span>
                    </div>
                  </div>

                  <!-- Post Content -->
                  <div class="p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">{{ post.title || post.caption }}</h4>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ post.content || post.caption }}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span class="px-2 py-1 bg-gray-100 rounded">{{ post.category }}</span>
                      <span>{{ formatDate(post.createdAt) }}</span>
                    </div>
                    <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <button (click)="likePost(post)" class="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200">
                        <i class="far fa-heart"></i>
                        <span>{{ post.likeCount || 0 }}</span>
                      </button>
                      <span class="flex items-center space-x-1">
                        <i class="far fa-comment"></i>
                        <span>{{ post.commentCount || 0 }}</span>
                      </span>
                      <span class="flex items-center space-x-1">
                        <i class="far fa-eye"></i>
                        <span>{{ post.views || 0 }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .stat-item {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.5rem;
      transition: transform 0.2s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
    }

    .post-card {
      transition: all 0.2s ease;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userPosts: Post[] = [];
  userStats = {
    posts: 0,
    followers: 0,
    following: 0
  };
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private usersService: UsersService,
    private gsapService: GSAPService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserPosts();
    this.loadUserStats();
    this.animateEntry();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.currentUser = user;
      });
  }

  private loadUserPosts(): void {
    if (!this.currentUser?.id) return;

    this.isLoading = true;
    this.postsService.getFeed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            this.userPosts = response.posts;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error loading user posts:', error);
        }
      });
  }

  private loadUserStats(): void {
    if (!this.currentUser?.id) return;

    // Count user's posts from the loaded posts
    this.userStats.posts = this.userPosts.length;
    this.userStats.followers = 0; // Simplified - no followers system yet
    this.userStats.following = 0; // Simplified - no following system yet
  }

  getInitials(username: string | undefined): string {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  createPost(): void {
    this.router.navigate(['/create-post']);
  }

  editProfile(): void {
    this.router.navigate(['/edit-profile']);
  }

  likePost(post: Post): void {
    this.postsService.likePost(post.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Update the post in the userPosts array
            const postIndex = this.userPosts.findIndex(p => p.id === post.id);
            if (postIndex !== -1) {
              this.userPosts[postIndex].likeCount = response.likes;
            }
          }
        },
        error: (error: any) => {
          console.error('Error liking post:', error);
        }
      });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Fallback to a placeholder image
    target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
  }

  private animateEntry(): void {
    this.gsapService.animateFrom('header', {
      duration: 0.6,
      y: -50,
      opacity: 0,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.profile-picture-container', {
      duration: 0.8,
      scale: 0.8,
      opacity: 0,
      delay: 0.2,
      ease: 'back.out(1.7)'
    });

    this.gsapService.animateFrom('.stat-item', {
      duration: 0.6,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      delay: 0.4,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.post-card', {
      duration: 0.6,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      delay: 0.6,
      ease: 'power2.out'
    });
  }
}
