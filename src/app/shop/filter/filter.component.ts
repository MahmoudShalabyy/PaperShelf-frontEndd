import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiBaseUrl + '/books';
const APIAuthors_URL = environment.apiBaseUrl + '/books';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  toggles = {
    categories: true,
    authors: true,
    price: true,
    rating: true
  };

  @Output() filtersApplied = new EventEmitter<any>();

  categories: string[] = [];
  authors: string[] = [];
  ratings = [5, 4, 3, 2, 1];

  selectedCategory: string | null = null;
  selectedAuthors: string[] = [];
  selectedRating: number | null = null;

  priceFloor: number = 0;
  priceCeil: number = 5000;
  selectedPriceMin: number = 0;
  selectedPriceMax: number = 5000;

  isAuthorSelected: { [key: string]: boolean } = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadFilters();
  }

  toggleSection(section: keyof typeof this.toggles) {
    this.toggles[section] = !this.toggles[section];
  }

  loadFilters() {
    this.http.get<any>(`${API_URL}/categories`).subscribe(res => {
      if (res.success && res.data?.categories) {
        this.categories = res.data.categories
  .map((c: any) => c.name)
  .filter((name: string) => !!name && name.trim().length > 0)
  .sort((a: string, b: string) => a.localeCompare(b));
      }
    });

    this.http.get<any>(`${APIAuthors_URL}/authors`).subscribe(res => {
      if (res.success && res.data?.authors) {
        this.authors = res.data.authors.map((a: any) => a.name);
        console.log('Authors loaded:', this.authors);
      }
    });
  }

  toggleSelection(array: string[], value: string, checked: boolean) {
    if (checked) {
      array.push(value);
    } else {
      const index = array.indexOf(value);
      if (index !== -1) array.splice(index, 1);
    }
  }

  toggleAuthor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.toggleSelection(this.selectedAuthors, target.value, target.checked);
    this.applyFilters();
  }

  onAuthorModelChange(author: string, checked: boolean) {
    this.toggleSelection(this.selectedAuthors, author, checked);
    this.applyFilters();
  }

  changeCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  changeRating(rate: number) {
    this.selectedRating = rate;
    this.applyFilters();
  }

  getStars(rate: number): string {
    return '⭐'.repeat(rate) + '☆'.repeat(5 - rate);
  }

  clearAll() {
    this.selectedCategory = null;
    this.selectedAuthors = [];
    this.selectedRating = null;
    this.selectedPriceMin = 0;
    this.selectedPriceMax = 5000;
    this.isAuthorSelected = {};
    this.applyFilters();
  }

  applyFilters() {
    this.filtersApplied.emit({
      categories: this.selectedCategory ? [this.selectedCategory] : [],
      authors: this.selectedAuthors,
      rating: this.selectedRating,
      priceRange: {
        min: this.selectedPriceMin,
        max: this.selectedPriceMax
      }
    });
  }
}
