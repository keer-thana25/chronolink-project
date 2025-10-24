import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { GSAPService } from '../../services/gsap.service';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  template: `
    <div class="splash-container min-h-screen flex items-center justify-center relative overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-older-generation-100 via-white to-younger-generation-100"></div>

      <!-- Animated Elements -->
      <div class="relative z-10 text-center">
        <!-- Logo -->
        <div class="logo-container mb-8">
          <h1 class="text-6xl md:text-8xl font-bold text-chronolink-primary mb-4 font-display">
            ChronoLink
          </h1>
        </div>

        <!-- Tagline -->
        <div class="tagline-container mb-12">
          <p class="text-xl md:text-2xl text-gray-700 font-light italic">
            "Timeless Stories, Ageless Minds"
          </p>
        </div>

        <!-- Loading Animation -->
        <div class="loading-container">
          <div class="animate-bounce-subtle">
            <div class="w-3 h-3 bg-chronolink-primary rounded-full mx-1 inline-block"></div>
            <div class="w-3 h-3 bg-chronolink-secondary rounded-full mx-1 inline-block"></div>
            <div class="w-3 h-3 bg-chronolink-accent rounded-full mx-1 inline-block"></div>
          </div>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="absolute top-10 left-10 w-20 h-20 border-4 border-older-generation-300 rounded-full opacity-20"></div>
      <div class="absolute bottom-10 right-10 w-16 h-16 border-4 border-younger-generation-300 rounded-full opacity-20"></div>
      <div class="absolute top-1/2 left-5 w-12 h-12 bg-chronolink-secondary opacity-10 rounded-full"></div>
      <div class="absolute top-1/3 right-5 w-8 h-8 bg-chronolink-accent opacity-10 rounded-full"></div>
    </div>
  `,
  styles: [`
    .splash-container {
      background: linear-gradient(135deg, #fdf8f6 0%, #ffffff 50%, #f0f9ff 100%);
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }

    .animate-bounce-subtle {
      animation: bounceSubtle 2s infinite;
    }

    @keyframes bounceSubtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class SplashScreenComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private gsapService: GSAPService
  ) {}

  ngOnInit(): void {
    // Auto-redirect after animation completes
    setTimeout(() => {
      this.router.navigate(['/auth']);
    }, 4000);
  }

  ngAfterViewInit(): void {
    this.animateSplash();
  }

  private animateSplash(): void {
    // Logo zoom in animation
    this.gsapService.animate('.logo-container h1', {
      duration: 1.5,
      scale: 1.2,
      ease: 'power2.out'
    });

    // Tagline fade in
    this.gsapService.animate('.tagline-container p', {
      duration: 1,
      opacity: 1,
      y: 20,
      delay: 1,
      ease: 'power2.out'
    });

    // Loading dots animation
    this.gsapService.animate('.loading-container div', {
      duration: 0.8,
      scale: 1.2,
      stagger: 0.2,
      delay: 2,
      ease: 'power2.out',
      yoyo: true,
      repeat: -1
    });
  }
}
