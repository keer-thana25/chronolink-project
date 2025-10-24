import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
              <!-- Navigation -->
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
        <!-- Navigation Arrows -->
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
                  {{ currentPost.generation === 'young' ? 'Young' : currentPost.generation === 'old' ? 'Old' : 'User' }}
                </span>
              </div>
            </div>

            <!-- Post Actions -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-4">
                  <button (click)="likePost()" class="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors duration-200">
                    <i class="far fa-heart text-2xl"></i>
                  </button>
                  <button (click)="commentPost()" class="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <i class="far fa-comment text-2xl"></i>
                  </button>
                  <button (click)="sharePost()" class="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors duration-200">
                    <i class="fas fa-share text-2xl"></i>
                  </button>
                </div>
                <div class="text-sm text-gray-500">
                  {{ currentPost.likeCount || 0 }} likes • {{ currentPost.commentCount || 0 }} comments
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
  currentPost: Post | null = null;
  currentIndex = 0;
  isLoading = false;
  currentUser: any = { username: 'Guest' };

  private destroy$ = new Subject<void>();
  private touchStartX = 0;
  private touchStartY = 0;

  constructor(
    private postsService: PostsService,
    private gsapService: GSAPService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGenerationPosts();
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

  flipCard(): void {
    const card = document.querySelector('.post-card');
    if (card) {
      card.classList.toggle('flipped');

      // Add flip animation
      const cardInner = card.querySelector('.post-card-inner');
      if (cardInner) {
        this.gsapService.animate(cardInner, {
          duration: 0.6,
          rotationY: card.classList.contains('flipped') ? 180 : 0,
          ease: 'power2.inOut'
        });
      }
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const diffX = this.touchStartX - currentX;
    const diffY = this.touchStartY - currentY;

    // If horizontal swipe is greater than vertical, prevent default
    if (Math.abs(diffX) > Math.abs(diffY)) {
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;

    const currentX = event.changedTouches[0].clientX;
    const diffX = this.touchStartX - currentX;

    // Swipe threshold
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe left - next post
        this.nextPost();
      } else {
        // Swipe right - previous post
        this.previousPost();
      }
    }

    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  nextPost(): void {
    this.currentIndex = (this.currentIndex + 1) % this.posts.length;
    this.currentPost = this.posts[this.currentIndex];
    this.animateCardSlide('left');
  }

  previousPost(): void {
    this.currentIndex = (this.currentIndex - 1 + this.posts.length) % this.posts.length;
    this.currentPost = this.posts[this.currentIndex];
    this.animateCardSlide('right');
  }

  likePost(): void {
    if (this.currentPost) {
      this.postsService.likePost(this.currentPost.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.currentPost!.likeCount = response.likes;
              // Update the post in the posts array as well
              const postIndex = this.posts.findIndex(p => p.id === this.currentPost!.id);
              if (postIndex !== -1) {
                this.posts[postIndex].likeCount = response.likes;
              }
            }
          },
          error: (error: any) => {
            console.error('Error liking post:', error);
          }
        });
    }
  }

  commentPost(): void {
    // For now, just log - in real app, open comment modal
    console.log('Comment on post:', this.currentPost?.id);
  }

  sharePost(): void {
    // For now, just log - in real app, open share modal
    console.log('Share post:', this.currentPost?.id);
  }

  getInitials(username: string | undefined): string {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
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
    // Animate header
    this.gsapService.animateFrom('header', {
      duration: 0.8,
      y: -50,
      opacity: 0,
      ease: 'power2.out'
    });

    // Animate arrows
    this.gsapService.animateFrom('.arrows-container', {
      duration: 1,
      scale: 0,
      opacity: 0,
      delay: 0.5,
      ease: 'back.out(1.7)'
    });

    // Animate post card
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

  onImageError(event: Event, generation: string): void {
    const target = event.target as HTMLImageElement;
    // Fallback to a placeholder image based on generation
    if (generation === 'young') {
      target.src = 'https://via.placeholder.com/800x800/ff6b9d/ffffff?text=🚀';
    } else {
      target.src = 'https://via.placeholder.com/800x800/4e54c8/ffffff?text=🧘';
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.posts.length === 0) return;

    if (event.key === 'ArrowLeft') {
      this.previousPost();
    } else if (event.key === 'ArrowRight') {
      this.nextPost();
    }
  }
}
