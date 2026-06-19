import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ActionCheck,
  BLOCK_MESSAGES,
  EnrollmentRequest,
} from '../models/enrollment.models';

@Component({
  selector: 'app-request-item',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './request-item.component.html',
  styleUrl: './request-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestItemComponent {
  readonly request = input.required<EnrollmentRequest>();
  readonly check = input.required<ActionCheck>();

  readonly approve = output<EnrollmentRequest>();
  readonly reject = output<EnrollmentRequest>();

  readonly disabledReason = computed(() => {
    const check = this.check();
    return check.allowed ? '' : BLOCK_MESSAGES[check.reason];
  });
}
