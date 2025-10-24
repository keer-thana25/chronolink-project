import { Injectable } from '@angular/core';
import { gsap } from 'gsap';

@Injectable({
  providedIn: 'root'
})
export class GSAPService {

  constructor() {}

  animate(target: string | Element, options: any): any {
    return gsap.to(target, options);
  }

  animateFrom(target: string | Element, options: any): any {
    return gsap.from(target, options);
  }

  animateFromTo(target: string | Element, fromOptions: any, toOptions: any): any {
    return gsap.fromTo(target, fromOptions, toOptions);
  }

  timeline(options?: any): any {
    return gsap.timeline(options);
  }

  set(target: string | Element, options: any): any {
    return gsap.set(target, options);
  }

  // Specific animation methods for common use cases
  fadeIn(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    });
  }

  fadeOut(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animate(target, {
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    });
  }

  slideInLeft(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      x: -100,
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    });
  }

  slideInRight(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      x: 100,
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    });
  }

  slideInUp(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      y: 50,
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    });
  }

  slideInDown(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      y: -50,
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out'
    });
  }

  scaleIn(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      scale: 0,
      opacity: 0,
      duration,
      delay,
      ease: 'back.out(1.7)'
    });
  }

  bounceIn(target: string | Element, duration: number = 1, delay: number = 0): any {
    return this.animateFrom(target, {
      y: -100,
      opacity: 0,
      duration,
      delay,
      ease: 'bounce.out'
    });
  }

  staggerAnimation(targets: string | Element | (string | Element)[], options: any): any {
    if (Array.isArray(targets)) {
      return (targets as any).forEach((target: string | Element) => {
        this.animate(target, options);
      });
    }
    return this.animate(targets, {
      ...options,
      stagger: options.stagger || 0.1
    });
  }

  // Scroll-triggered animations
  scrollTrigger(target: string | Element, options: any): any {
    return this.animate(target, {
      scrollTrigger: {
        trigger: target,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options.scrollTrigger
      },
      ...options
    });
  }

  // Number counting animation
  countUp(target: string | Element, endValue: number, duration: number = 2, delay: number = 0): any {
    return this.animate(target, {
      textContent: endValue,
      duration,
      delay,
      ease: 'power2.out',
      snap: { textContent: 1 }
    });
  }
}
