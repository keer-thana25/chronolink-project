import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PostsService, CreatePostRequest } from '../../services/posts.service';
import { GSAPService } from '../../services/gsap.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="create-post-container min-h-screen bg-gray-50">
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
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Create New Post</h2>
          <p class="text-gray-600 mb-8">Share your story with the ChronoLink community</p>

          <form [formGroup]="postForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Title Field -->
            <div class="form-group">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chronolink-primary focus:border-transparent transition-all duration-200"
                placeholder="Enter your post title">
              <div *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="text-red-500 text-sm mt-1">
                Title is required
              </div>
            </div>

            <!-- Category Field -->
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                formControlName="category"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chronolink-primary focus:border-transparent transition-all duration-200">
                <option value="">Select a category</option>
                <option value="Spirituality">Spirituality</option>
                <option value="Literature">Literature</option>
                <option value="Art">Art</option>
                <option value="Heritage">Heritage</option>
                <option value="Inspiration">Inspiration</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="History">History</option>
                <option value="spiritual">spiritual</option>
                <option value="tech">tech</option>
                <option value="blend">blend</option>
              </select>
              <div *ngIf="postForm.get('category')?.invalid && postForm.get('category')?.touched" class="text-red-500 text-sm mt-1">
                Category is required
              </div>
            </div>

            <!-- Content Field -->
            <div class="form-group">
              <label for="content" class="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                id="content"
                formControlName="content"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chronolink-primary focus:border-transparent transition-all duration-200"
                placeholder="Write a caption for your post..."></textarea>
              <div *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched" class="text-red-500 text-sm mt-1">
                Caption is required
              </div>
            </div>

            <!-- Image Upload Area -->
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">Photos</label>

              <!-- Upload Area -->
              <div
                class="upload-area border-2 border-dashed border-gray-300 rounded-lg transition-all duration-200 cursor-pointer"
                [class.dragover]="isDragover"
                [class.upload-error]="selectedImages.length === 0 && formSubmitted"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()">
                <div class="text-center py-8">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
                  </div>
                  <p class="text-lg font-medium text-gray-900 mb-2">Drag photos here</p>
                  <p class="text-gray-500 mb-4">Select from your device</p>
                  <button type="button" class="btn-secondary">
                    Choose Photos
                  </button>
                </div>
              </div>

              <!-- Hidden file input -->
              <input
                type="file"
                #fileInput
                accept="image/*"
                multiple
                (change)="onFileSelect($event)"
                class="hidden">

              <!-- Image Previews -->
              <div *ngIf="selectedImages.length > 0" class="mt-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Selected Photos ({{ selectedImages.length }})</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div *ngFor="let image of selectedImages; let i = index" class="relative group">
                    <img [src]="image.preview" [alt]="'Preview ' + (i + 1)" class="w-full h-24 object-cover rounded-lg">
                    <button
                      type="button"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      (click)="removeImage(i)">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <i class="fas fa-eye text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="selectedImages.length === 0 && formSubmitted" class="text-red-500 text-sm mt-1">
                At least one photo is required
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="goBack()"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Cancel
              </button>

              <button
                type="submit"
                [disabled]="postForm.invalid || selectedImages.length === 0 || isLoading"
                class="px-8 py-3 bg-chronolink-primary text-white rounded-lg font-medium transition-all duration-200 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="isLoading" class="inline-flex items-center">
                  <div class="spinner mr-2"></div>
                  Creating Post...
                </span>
                <span *ngIf="!isLoading">Create Post</span>
              </button>
            </div>
          </form>

          <!-- Upload Progress -->
          <div *ngIf="isUploading" class="mt-4">
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              <div class="flex items-center">
                <div class="spinner mr-3"></div>
                <span>Uploading images... {{ uploadProgress }}%</span>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-post-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }
  `]
})
export class CreatePostComponent implements OnInit, OnDestroy {
  postForm: FormGroup;
  isLoading = false;
  isUploading = false;
  uploadProgress = 0;
  successMessage = '';
  errorMessage = '';
  currentUser: any = null;
  selectedImages: Array<{ file: File; preview: string }> = [];
  isDragover = false;
  formSubmitted = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private postsService: PostsService,
    private gsapService: GSAPService,
    private router: Router,
    private authService: AuthService
  ) {
    this.postForm = this.createForm();
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.currentUser = user;
        console.log('Current user in create-post:', user);
        if (!user) {
          console.log('No user found, redirecting to auth');
          this.router.navigate(['/auth']);
          return;
        }
      });
    this.animateEntry();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['', [Validators.required]]
    });
  }

  // Drag & Drop Handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }

  // File Input Handler
  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }

  // Image Processing
  private processFiles(files: FileList): void {
    Array.from(files).forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Only image files are allowed';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        this.selectedImages.push({
          file: file,
          preview: previewUrl
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.postForm.invalid || this.selectedImages.length === 0) return;

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Please log in first to create a post';
      this.router.navigate(['/auth']);
      return;
    }

    // Validate minimum requirements
    if (this.selectedImages.length === 0) {
      this.errorMessage = 'Please select at least one photo';
      return;
    }

    this.isLoading = true;
    this.isUploading = true;
    this.uploadProgress = 0;
    this.successMessage = '';
    this.errorMessage = '';

    console.log('🔄 Creating post with data:', {
      ...this.postForm.value,
      imagesCount: this.selectedImages.length
    });

    // Get the first image file
    const imageFile = this.selectedImages.length > 0 ? this.selectedImages[0].file : undefined;

    const postData: any = {
      ...this.postForm.value,
      mediaType: 'image'
    };

    console.log('📸 Sending post with image file to API...');

    this.postsService.createPost(postData, imageFile)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.isUploading = false;
          console.log('✅ Post created successfully:', response);
          if (response.success) {
            this.successMessage = 'Post created successfully!';
            this.selectedImages = []; // Clear images
            this.postForm.reset();
            this.formSubmitted = false;
            // Refresh posts in connect page
            window.dispatchEvent(new CustomEvent('postCreated'));
            setTimeout(() => {
              this.router.navigate(['/connect']);
            }, 2000);
          } else {
            throw new Error('Failed to create post');
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.isUploading = false;
          console.error('❌ Error creating post:', error);
          this.errorMessage = error.error?.message || error.message || 'Failed to create post. Please try again.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/connect']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getInitials(username: string | undefined): string {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  }

  private animateEntry(): void {
    this.gsapService.animateFrom('header', {
      duration: 0.6,
      y: -50,
      opacity: 0,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('h2', {
      duration: 0.6,
      y: -30,
      opacity: 0,
      delay: 0.2,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.form-group', {
      duration: 0.5,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      delay: 0.4,
      ease: 'power2.out'
    });
  }
}
