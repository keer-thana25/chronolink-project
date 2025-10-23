import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { PostsService, Post } from '../../services/posts.service';
import { GSAPService } from '../../services/gsap.service';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="ai-recommendations-container min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                <a routerLink="/ai-recommendations" class="text-chronolink-primary font-medium">AI Recommendations</a>
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

      <!-- Page Header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-chronolink-primary mb-4 font-display">
            <i class="fas fa-robot mr-3 text-blue-600"></i>
            AI Recommendations
          </h1>
          <p class="text-xl text-gray-600">Personalized stories based on your interests and preferences</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- AI Insight Banner -->
        <div class="ai-insight-banner bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i class="fas fa-brain text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Smart Recommendations</h3>
                <p class="text-blue-100">Based on your preferences</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold">{{ posts.length }}</div>
              <div class="text-sm text-blue-100">Stories Found</div>
            </div>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="category-filter bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let category of categories"
              [class.active]="selectedCategory === category"
              class="category-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              (click)="selectCategory(category)">
              {{ category }}
            </button>
          </div>
        </div>

        <!-- Posts Grid -->
        <div class="posts-container">
          <div *ngIf="posts.length === 0 && !isLoading" class="text-center py-12">
            <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">No recommendations found. Try adjusting your filters!</p>
          </div>

          <div class="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let post of posts; trackBy: trackByPostId"
                 class="post-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
              <!-- Post Image/Media -->
              <div class="post-media h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 bg-chronolink-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="text-white text-xl font-medium">{{ post.createdBy === 'system' ? 'CL' : getInitials(post.author?.username) }}</span>
                  </div>
                  <div class="text-2xl">
                    <i class="fas fa-{{ getCategoryIcon(post.category) }} text-chronolink-primary"></i>
                  </div>
                </div>
              </div>

              <!-- Post Content -->
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {{ post.category }}
                  </span>
                  <span class="text-xs text-gray-500">
                    Member
                  </span>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ post.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ post.content }}</p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-700">{{ post.createdBy === 'system' ? 'CL' : getInitials(post.author?.username) }}</span>
                    </div>
                    <span class="text-sm text-gray-700">{{ post.createdBy === 'system' ? 'ChronoLink' : post.author?.username }}</span>
                  </div>
                  <div class="flex items-center space-x-3 text-sm text-gray-500">
                    <span class="flex items-center space-x-1">
                      <i class="far fa-heart"></i>
                      <span>{{ post.likeCount || 0 }}</span>
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

        <!-- Load More Button -->
        <div *ngIf="posts.length > 0" class="text-center mt-8">
          <button class="btn-primary">Load More Recommendations</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-recommendations-container {
      background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%);
    }

    .category-btn {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      border-color: #3b82f6;
    }

    .category-btn:hover:not(.active) {
      background: #e5e7eb;
    }

    .post-card {
      transition: all 0.3s ease;
    }

    .post-card:hover {
      transform: translateY(-4px);
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }
  `]
})
export class AiRecommendationsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  posts: Post[] = [];
  isLoading = false;
  selectedCategory = '';

  categories = [
    'Spirituality',
    'Literature',
    'Art',
    'Heritage',
    'Inspiration',
    'Technology',
    'Music',
    'History'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private gsapService: GSAPService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadRecommendations();
    this.animateEntry();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadRecommendations(): void {
    this.isLoading = true;
    this.postsService.getRecommendations(this.currentUser?.id)
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
          console.error('Error loading recommendations:', error);
        }
      });
  }

  selectCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    // In a real implementation, you would filter posts or make a new API call
    this.animateCategorySelection();
  }

  getInitials(username: string | undefined): string {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Spirituality': 'om',
      'Literature': 'book',
      'Art': 'palette',
      'Heritage': 'landmark',
      'Inspiration': 'lightbulb',
      'Technology': 'laptop',
      'Music': 'music',
      'History': 'scroll'
    };
    return icons[category] || 'circle';
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  private animateEntry(): void {
    this.gsapService.animateFrom('header', {
      duration: 0.8,
      y: -50,
      opacity: 0,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.ai-insight-banner', {
      duration: 0.8,
      scale: 0.95,
      opacity: 0,
      delay: 0.2,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.category-btn', {
      duration: 0.5,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      delay: 0.4,
      ease: 'power2.out'
    });

    this.gsapService.staggerAnimation('.post-card', {
      duration: 0.6,
      y: 30,
      opacity: 0,
      delay: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }

  private animateCategorySelection(): void {
    this.gsapService.animate('.category-filter', {
      duration: 0.3,
      scale: 0.98,
      ease: 'power2.out'
    });

    this.gsapService.animate('.category-filter', {
      duration: 0.3,
      scale: 1,
      delay: 0.3,
      ease: 'power2.out'
    });
  }
}
