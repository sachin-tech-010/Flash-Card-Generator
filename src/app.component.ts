import { Component, ChangeDetectionStrategy, effect, signal, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { SlideshowComponent } from './components/slideshow/slideshow.component';
import { GeneratorComponent } from './components/generator/generator.component';
import { AboutComponent } from './components/about/about.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    HeroComponent,
    SlideshowComponent,
    GeneratorComponent,
    AboutComponent,
    FooterComponent
  ]
})
export class AppComponent {
  
  // A simple effect to add scroll animations to sections
  constructor() {
    afterNextRender(() => {
      const sections = document.querySelectorAll('.fade-in-section');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0');
          }
        });
      }, {
        threshold: 0.1
      });

      sections.forEach(section => {
        observer.observe(section);
      });
    });
  }
}
