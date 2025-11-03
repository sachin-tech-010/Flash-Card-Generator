import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FlashCard } from '../../models/flashcard.model';

interface Example {
  topic: string;
  paragraph: string;
  cards: FlashCard[];
}

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideshowComponent {
  readonly examples = signal<Example[]>([
    {
      topic: 'Generative AI',
      paragraph: 'Generative AI is a type of artificial intelligence that can create new and original content, such as text, images, music, and code. It learns patterns from existing data and then uses that knowledge to generate novel outputs.',
      cards: [
        { question: 'What is Generative AI?', answer: 'AI that creates new, original content like text, images, or code.' },
        { question: 'How does Generative AI work?', answer: 'It learns patterns from vast amounts of data to generate new content.' },
        { question: 'Name a prominent Generative AI model.', answer: 'Google\'s Gemini.' }
      ]
    },
    {
      topic: 'Software Development Life Cycle',
      paragraph: 'The Software Development Life Cycle (SDLC) is a process used by the software industry to design, develop, and test high-quality software. It aims to produce software that meets or exceeds customer expectations.',
      cards: [
        { question: 'What does SDLC stand for?', answer: 'Software Development Life Cycle.' },
        { question: 'What is the main goal of SDLC?', answer: 'To design, develop, and test high-quality software efficiently.' },
        { question: 'Name two common SDLC models.', answer: 'Waterfall and Agile.' }
      ]
    },
    {
      topic: 'Computer Networks',
      paragraph: 'A computer network is a set of computers sharing resources located on or provided by network nodes. They use common communication protocols over digital interconnections to communicate.',
      cards: [
        { question: 'What is a computer network?', answer: 'A set of computers sharing resources via common communication protocols.' },
        { question: 'What is the best-known example of a computer network?', answer: 'The Internet.' },
        { question: 'What do LAN and WAN stand for?', answer: 'Local Area Network and Wide Area Network.' }
      ]
    }
  ]);

  currentTopicIndex = signal(0);
  currentCardIndex = signal(0);
  isFlipped = signal(false);

  currentExample = computed(() => this.examples()[this.currentTopicIndex()]);
  currentCard = computed(() => this.currentExample().cards[this.currentCardIndex()]);

  selectTopic(index: number) {
    if (this.currentTopicIndex() === index) return;
    this.isFlipped.set(false);
    this.currentTopicIndex.set(index);
    this.currentCardIndex.set(0);
  }

  nextCard() {
    this.isFlipped.set(false);
    this.currentCardIndex.update(i => (i + 1) % this.currentExample().cards.length);
  }

  prevCard() {
    this.isFlipped.set(false);
    this.currentCardIndex.update(i => (i - 1 + this.currentExample().cards.length) % this.currentExample().cards.length);
  }

  flipCard() {
    this.isFlipped.update(v => !v);
  }
}
