import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { PostsService, Post } from '../../services/posts.service';
import { GSAPService } from '../../services/gsap.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-chronolink-primary font-display">ChronoLink</h1>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Navigation -->
              <nav class="hidden md:flex space-x-6">
                <a routerLink="/home" class="text-chronolink-primary font-medium">Home</a>
                <a routerLink="/connect" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">Connect</a>
                <a routerLink="/ai-recommendations" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">AI Recommendations</a>
                <a routerLink="/profile" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">Profile</a>
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

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar -->
          <aside class="lg:col-span-1">
            <nav class="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <a href="#" class="sidebar-link active flex items-center space-x-3 px-4 py-3 rounded-lg">
                <i class="fas fa-home text-chronolink-primary"></i>
                <span>Home</span>
              </a>
              <a href="#" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                <i class="fas fa-sync-alt text-gray-600"></i>
                <span>Connecting Generations</span>
              </a>
              <a href="#" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                <i class="fas fa-robot text-gray-600"></i>
                <span>AI Recommendations</span>
              </a>
              <a href="#" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                <i class="fas fa-user text-gray-600"></i>
                <span>Profile</span>
              </a>
            </nav>
          </aside>

          <!-- Main Feed -->
          <main class="lg:col-span-3 space-y-6">
            <!-- Welcome Section -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {{ currentUser?.username }}! 👋
                  </h2>
                  <p class="text-gray-600">
                    Discover timeless stories and connect with different generations
                  </p>
                </div>
                <button
                  (click)="createPost()"
                  class="px-6 py-3 bg-chronolink-primary text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 flex items-center space-x-2">
                  <i class="fas fa-plus"></i>
                  <span>Create Post</span>
                </button>
              </div>
            </div>

            <!-- Posts Feed -->
            <div class="space-y-6">
              <div *ngIf="posts.length === 0 && !isLoading" class="text-center py-12">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">No posts yet. Be the first to share a story!</p>
              </div>

              <div *ngFor="let post of posts; trackBy: trackByPostId" class="post-card bg-white rounded-lg shadow-sm p-6">
                <!-- Post Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-chronolink-primary rounded-full flex items-center justify-center">
                      <span class="text-white text-sm font-medium">{{ post.createdBy === 'system' ? 'CL' : getInitials(post.author?.username) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ post.createdBy === 'system' ? 'ChronoLink' : post.author?.username }}</p>
                      <p class="text-sm text-gray-500">{{ post.createdBy === 'system' ? 'System' : 'Member' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 bg-older-generation-100 text-older-generation-800 rounded-full text-xs font-medium">
                      {{ post.category }}
                    </span>
                    <button class="text-gray-400 hover:text-gray-600">
                      <i class="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>

                <!-- Post Content -->
                <div class="mb-4">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ post.title }}</h3>
                  <p class="text-gray-700 leading-relaxed">{{ post.content }}</p>
                </div>

                <!-- Post Actions -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center space-x-6">
                    <button
                      (click)="likePost(post.id)"
                      [class.text-red-500]="isPostLiked(post)"
                      class="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors duration-200">
                      <i class="far fa-heart"></i>
                      <span>{{ post.likeCount || 0 }}</span>
                    </button>
                    <button class="flex items-center space-x-2 text-gray-600 hover:text-chronolink-primary transition-colors duration-200">
                      <i class="far fa-comment"></i>
                      <span>{{ post.commentCount || 0 }}</span>
                    </button>
                    <button class="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors duration-200">
                      <i class="far fa-share-square"></i>
                      <span>Share</span>
                    </button>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ post.views || 0 }} views • {{ formatDate(post.createdAt) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div *ngIf="posts.length > 0" class="text-center">
              <button class="btn-primary">Load More Stories</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .sidebar-link {
      transition: all 0.2s ease;
    }

    .sidebar-link.active {
      background: linear-gradient(135deg, #8B5A3C 0%, #A0674A 100%);
      color: white;
    }

    .sidebar-link.active i {
      color: white;
    }

    .post-card {
      transition: all 0.3s ease;
    }

    .post-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  posts: Post[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private gsapService: GSAPService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    // Check if user is authenticated before loading posts
    if (this.authService.isAuthenticated()) {
      this.loadPosts();
    } else {
      // Redirect to auth page if not authenticated
      this.router.navigate(['/auth']);
      return;
    }

    this.animateEntry();

    // Listen for new post creation
    window.addEventListener('postCreated', () => {
      this.loadPosts();
    });
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

  private loadPosts(): void {
    this.isLoading = true;
    this.postsService.getFeed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            this.posts = response.posts;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error loading posts:', error);
        }
      });
  }

  likePost(postId: string): void {
    this.postsService.likePost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            const post = this.posts.find((p: Post) => p.id === postId);
            if (post) {
              post.likes = Array(response.likes).fill(null).map((_, i) => ({
                user: `user${i}`,
                createdAt: new Date().toISOString()
              }));
              post.likeCount = response.likes;
            }
          }
        },
        error: (error: any) => {
          console.error('Error liking post:', error);
        }
      });
  }

  isPostLiked(post: Post): boolean {
    // Simplified - in real app, check if current user liked the post
    return Math.random() > 0.7; // Random for demo
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

  private animateEntry(): void {
    this.gsapService.animateFrom('header', {
      duration: 0.6,
      y: -50,
      opacity: 0,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.sidebar-link', {
      duration: 0.5,
      x: -30,
      opacity: 0,
      stagger: 0.1,
      delay: 0.3,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.post-card', {
      duration: 0.6,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      delay: 0.5,
      ease: 'power2.out'
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // Implement scroll-triggered animations for posts
    const posts = document.querySelectorAll('.post-card');
    posts.forEach((post, index) => {
      const rect = post.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        this.gsapService.animate(post, {
          duration: 0.6,
          y: 0,
          opacity: 1,
          delay: index * 0.1,
          ease: 'power2.out'
        });
      }
    });
  }
}
