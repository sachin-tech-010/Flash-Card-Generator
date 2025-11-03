import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  scrollToGenerator(): void {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  }
}