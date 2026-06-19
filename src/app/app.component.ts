import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnrollmentStore } from './services/enrollment.store';
import { EnrollmentRequest, RawAppData } from './models/enrollment.models';
import { RequestItemComponent } from './request-item/request-item.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RequestItemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly store = inject(EnrollmentStore);
  readonly rejecting = signal<EnrollmentRequest | null>(null);
  readonly rejectReason = signal('');

  private readonly http = inject(HttpClient);

  constructor() {
    this.http
      .get<RawAppData>('test_input.json')
      .subscribe((data) => this.store.load(data));
  }

  openReject(request: EnrollmentRequest): void {
    this.rejectReason.set('');
    this.rejecting.set(request);
  }

  cancelReject(): void {
    this.rejecting.set(null);
    this.rejectReason.set('');
  }

  confirmReject(): void {
    const request = this.rejecting();
    const reason = this.rejectReason().trim();

    if (!request || !reason) return;

    this.store.reject(request.id, reason);
    this.cancelReject();
  }
}
