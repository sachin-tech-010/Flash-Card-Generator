import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { FlashCard } from '../../models/flashcard.model';

type GeneratorStep = 'initial' | 'analyzing' | 'options' | 'generating' | 'results';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class GeneratorComponent {
  private geminiService = inject(GeminiService);

  step = signal<GeneratorStep>('initial');
  inputText = signal('');
  generatedCards = signal<FlashCard[]>([]);
  error = signal<string | null>(null);
  flippedCardIndex = signal<number | null>(null);
  cardCountOptions = signal<number[]>([]);
  selectedCardCount = signal<number | null>(null);

  isAnalyzing = computed(() => this.step() === 'analyzing');
  isGenerating = computed(() => this.step() === 'generating');
  isLoading = computed(() => this.isAnalyzing() || this.isGenerating());

  async analyzeText() {
    if (this.inputText().trim().length === 0) {
      this.error.set('Please enter some text to analyze.');
      return;
    }
    
    this.step.set('analyzing');
    this.error.set(null);
    this.cardCountOptions.set([]);

    try {
      const range = await this.geminiService.analyzeTextForCardCount(this.inputText());
      
      const finalMin = Math.max(4, range.min);
      const finalMax = Math.min(10, range.max);

      if (finalMin > finalMax) {
        throw new Error("Could not determine a valid number of flash cards to generate. The text might be too short.");
      }

      const options: number[] = [];
      for (let i = finalMin; i <= finalMax; i++) {
        if (i % 2 === 0) {
          options.push(i);
        }
      }
      
      if (options.length === 0) {
        options.push(finalMin);
      }

      if (options.length === 0) {
         throw new Error("Not enough content to generate a sufficient number of flash cards.");
      }

      this.cardCountOptions.set(options);
      this.step.set('options');

    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred during analysis.');
      this.step.set('initial');
    }
  }

  async generateCards(count: number) {
    if (this.step() === 'results' && this.selectedCardCount() === count) {
      return;
    }
      
    this.step.set('generating');
    this.error.set(null);
    this.generatedCards.set([]);
    this.flippedCardIndex.set(null);
    this.selectedCardCount.set(count);

    try {
      const cards = await this.geminiService.generateFlashCards(this.inputText(), count);
      this.generatedCards.set(cards);
      this.step.set('results');
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
      this.step.set('options'); // Go back to options on failure
      this.selectedCardCount.set(null);
    }
  }

  flipCard(index: number) {
    this.flippedCardIndex.update(currentIndex => {
      return currentIndex === index ? null : index;
    });
  }

  backToEdit() {
    this.step.set('initial');
    this.cardCountOptions.set([]);
    this.error.set(null);
    this.selectedCardCount.set(null);
  }

  reset() {
    this.inputText.set('');
    this.generatedCards.set([]);
    this.error.set(null);
    this.flippedCardIndex.set(null);
    this.cardCountOptions.set([]);
    this.step.set('initial');
    this.selectedCardCount.set(null);
  }
}