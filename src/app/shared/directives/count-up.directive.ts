import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnChanges {
  @Input() appCountUp: number = 0;
  @Input() duration: number = 800;
  @Input() prefix: string = '';
  @Input() suffix: string = '';
  @Input() decimals: number = 0;

  private currentValue: number = 0;
  private startTime: number = 0;
  private animationFrame: number = 0;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.animateValue(this.duration);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appCountUp']) {
      this.animateValue(this.duration);
    }
  }

  private animateValue(duration: number): void {
    const startValue = this.currentValue;
    const endValue = this.appCountUp;
    const startTime = performance.now();

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      this.currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      const formattedValue = this.currentValue.toFixed(this.decimals);
      this.el.nativeElement.textContent = this.prefix + formattedValue + this.suffix;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.currentValue = endValue;
        this.el.nativeElement.textContent = this.prefix + endValue.toFixed(this.decimals) + this.suffix;
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}