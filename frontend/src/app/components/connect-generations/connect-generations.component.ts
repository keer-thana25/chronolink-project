import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PostsService, Post } from '../../services/posts.service';
import { GSAPService } from '../../services/gsap.service';

@Component({
  selector: 'app-connect-generations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="connect-container min-h-screen bg-gray-50 relative overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-chronolink-primary font-display">ChronoLink</h1>
            </div>
            <div class="flex items-center space-x-4">
              <nav class="hidden md:flex space-x-6">
                <a routerLink="/home" class="text-gray-600 hover:text-chronolink-primary transition-colors duration-200">Home</a>
                <a routerLink="/connect" class="text-chronolink-primary font-medium">Connect</a>
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
      <div class="flex items-center justify-center min-h-screen px-4 relative">
        <button (click)="previousPost()" class="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200">
          <i class="fas fa-chevron-left text-2xl text-gray-600"></i>
        </button>

        <button (click)="nextPost()" class="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200">
          <i class="fas fa-chevron-right text-2xl text-gray-600"></i>
        </button>

        <!-- Post Card -->
        <div class="post-card-container relative w-full max-w-md mx-auto">
          <div *ngIf="posts.length === 0 && !isLoading" class="text-center py-12">
            <div class="animate-pulse">
              <div class="w-full h-96 bg-gray-200 rounded-2xl mb-4"></div>
              <div class="w-3/4 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
              <div class="w-1/2 h-4 bg-gray-200 rounded mx-auto"></div>
            </div>
            <p class="text-gray-500 text-lg mt-4">Loading generation connection stories...</p>
          </div>

          <div *ngIf="currentPost" class="post-card bg-white rounded-2xl shadow-2xl overflow-hidden"
               (touchstart)="onTouchStart($event)"
               (touchmove)="onTouchMove($event)"
               (touchend)="onTouchEnd($event)">
            
            <!-- Post Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-chronolink-primary rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ currentPost.createdBy === 'system' ? 'CL' : getInitials(currentPost.author?.username) }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ currentPost.createdBy === 'system' ? 'ChronoLink' : currentPost.author?.username }}</p>
                  <p class="text-xs text-gray-500">{{ currentPost.createdBy === 'system' ? 'System' : 'Member' }}</p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>

            <!-- Post Image -->
            <div class="relative">
              <img [src]="currentPost.imageUrl || currentPost.mediaUrl" [alt]="currentPost.caption" class="w-full h-96 object-cover"
                   loading="lazy" (error)="onImageError($event, currentPost.generation)">
              <div class="absolute top-4 right-4">
                <span class="px-2 py-1 bg-black bg-opacity-50 text-white rounded-full text-xs font-medium">
                  {{ currentPost.generation === 'young' ? 'Younger Generation' : currentPost.generation === 'old' ? 'Older Generation' : 'Unknown Generation' }}
                </span>
              </div>
            </div>

            <!-- Post Actions -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-6">
                  <!-- Like Button -->
                  <button (click)="likePost()" class="flex items-center space-x-1 transition-colors duration-200 focus:outline-none">
                    <i
                      [ngClass]="{
                        'fas fa-heart text-2xl text-red-500': currentPost?.isLiked,
                        'far fa-heart text-2xl text-gray-600': !currentPost?.isLiked
                      }">
                    </i>
                  </button>

                  <!-- Follow Button (only show if not own post and user is authenticated) -->
                  <button *ngIf="currentPost && currentPost.author && currentPost.author.id !== currentUser?.id && authService.isAuthenticated()"
                          (click)="toggleFollow()"
                          class="flex items-center space-x-1 transition-colors duration-200 focus:outline-none">
                    <i class="fas fa-user-plus text-2xl text-blue-500"></i>
                    <span class="text-sm font-medium">{{ isFollowing ? 'Following' : 'Follow' }}</span>
                  </button>

                  <button (click)="commentPost()" class="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <i class="far fa-comment text-2xl"></i>
                  </button>
                </div>
                <div class="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{{ currentPost.likeCount || 0 }} likes</span>
                  <span>{{ currentPost.commentCount || 0 }} comments</span>
                </div>
              </div>
            </div>

            <!-- Post Caption -->
            <div class="p-4">
              <p class="text-gray-900 leading-relaxed">
                <span class="font-semibold">{{ currentPost.createdBy === 'system' ? 'ChronoLink' : currentPost.author?.username }}</span>
                {{ currentPost.caption }}
              </p>
            </div>
          </div>

          <!-- Post Counter -->
          <div *ngIf="posts.length > 0" class="text-center mt-4">
            <span class="text-gray-500">{{ currentIndex + 1 }} / {{ posts.length }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connect-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .post-card {
      transition: all 0.3s ease;
    }

    .post-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }
  `]
})
export class ConnectGenerationsComponent implements OnInit, OnDestroy, AfterViewInit {
  posts: Post[] = [];
  currentPost: any = null;
  currentIndex = 0;
  isLoading = false;
  currentUser: any = { username: 'Guest' };
  isFollowing = false;

  private destroy$ = new Subject<void>();
  private touchStartX = 0;
  private touchStartY = 0;

  constructor(
    private postsService: PostsService,
    private gsapService: GSAPService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGenerationPosts();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Listen for post creation events
    window.addEventListener('postCreated', () => {
      this.loadGenerationPosts();
    });
  }

  ngAfterViewInit(): void {
    this.animateEntry();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGenerationPosts(): void {
    this.isLoading = true;
    // Load all posts from all users for the connect page
    this.postsService.getGenerationConnection()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            this.posts = response.posts;
            this.currentPost = this.posts[0] || null;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error loading generation posts:', error);
        }
      });
  }

  likePost(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.currentPost) return;

    this.postsService.likePost(this.currentPost.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Update the current post with the definitive state from the backend
            this.currentPost.isLiked = response.isLiked;
            this.currentPost.likeCount = response.likes;
          }
        },
        error: (error) => {
          console.error('Error liking post:', error);
          // Optionally, you could add UI feedback here to inform the user that the like failed.
        }
      });
  }

  commentPost(): void {
    console.log('Comment on post:', this.currentPost?.id);
  }

  sharePost(): void {
    console.log('Share post:', this.currentPost?.id);
  }

  nextPost(): void {
    this.currentIndex = (this.currentIndex + 1) % this.posts.length;
    this.currentPost = this.posts[this.currentIndex];
    this.checkFollowStatus();
    this.animateCardSlide('left');
  }

  previousPost(): void {
    this.currentIndex = (this.currentIndex - 1 + this.posts.length) % this.posts.length;
    this.currentPost = this.posts[this.currentIndex];
    this.checkFollowStatus();
    this.animateCardSlide('right');
  }

  getInitials(username: string | undefined): string {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  onImageError(event: Event, generation: string): void {
    const target = event.target as HTMLImageElement;
    target.src = generation === 'young'
      ? 'https://via.placeholder.com/800x800/ff6b9d/ffffff?text=🚀'
      : 'https://via.placeholder.com/800x800/4e54c8/ffffff?text=🧘';
  }

  private animateEntry(): void {
    this.gsapService.animateFrom('header', {
      duration: 0.8,
      y: -50,
      opacity: 0,
      ease: 'power2.out'
    });
    this.gsapService.animateFrom('.post-card', {
      duration: 0.8,
      scale: 0.8,
      opacity: 0,
      delay: 1,
      ease: 'back.out(1.7)'
    });
  }

  private animateCardSlide(direction: 'left' | 'right'): void {
    const card = document.querySelector('.post-card');
    if (card) {
      this.gsapService.animate(card, {
        duration: 0.3,
        x: direction === 'left' ? -50 : 50,
        opacity: 0,
        ease: 'power2.inOut',
        onComplete: () => {
          this.gsapService.animate(card, {
            duration: 0.3,
            x: 0,
            opacity: 1,
            ease: 'power2.out'
          });
        }
      });
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = this.touchStartX - touchEndX;
    const diffY = this.touchStartY - touchEndY;
    
    // Prevent vertical scrolling while swiping horizontally
    if (Math.abs(diffX) > Math.abs(diffY)) {
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const diffX = this.touchStartX - touchEndX;
    
    const SWIPE_THRESHOLD = 50;
    
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX > 0) {
        // Swiped left, show next post
        this.nextPost();
      } else {
        // Swiped right, show previous post
        this.previousPost();
      }
    }
    
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.posts.length === 0) return;
    if (event.key === 'ArrowLeft') this.previousPost();
    else if (event.key === 'ArrowRight') this.nextPost();
  }

  toggleFollow(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.currentPost || !this.currentPost.author) return;

    const userId = this.currentPost.author.id;
    const followObservable = this.isFollowing
      ? this.authService.unfollowUser(userId)
      : this.authService.followUser(userId);

    followObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.isFollowing = !this.isFollowing;
            // Update follower/following counts if available
            if (this.currentUser) {
              if (this.isFollowing) {
                this.currentUser.followingCount = (this.currentUser.followingCount || 0) + 1;
              } else {
                this.currentUser.followingCount = Math.max(0, (this.currentUser.followingCount || 0) - 1);
              }
            }
          }
        },
        error: (error) => {
          console.error('Error toggling follow:', error);
        }
      });
  }

  private checkFollowStatus(): void {
    if (!this.authService.isAuthenticated() || !this.currentPost || !this.currentPost.author) {
      this.isFollowing = false;
      return;
    }

    // Check if current user is following this post's author
    // This is a simplified check - in a real app, you'd check against the user's following list
    this.isFollowing = this.currentUser?.following?.includes(this.currentPost.author.id) || false;
  }
}
