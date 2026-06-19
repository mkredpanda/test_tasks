import { computed, Injectable, signal } from '@angular/core';
import {
  ActionCheck,
  BranchFilter,
  EnrollmentRequest,
  RawAppData,
  RawEnrollmentRequest,
  StatusFilter,
  TypeFilter,
  User,
} from '../models/enrollment.models';

@Injectable({ providedIn: 'root' })
export class EnrollmentStore {
  private readonly requests = signal<EnrollmentRequest[]>([]);
  private readonly user = signal<User | null>(null);

  readonly statusFilter = signal<StatusFilter>('all');
  readonly typeFilter = signal<TypeFilter>('all');
  readonly branchFilter = signal<BranchFilter>('all');

  readonly currentUser = this.user.asReadonly();

  readonly branches = computed(() =>
    [...new Set(this.requests().map((request) => request.branch))].sort(),
  );

  readonly visibleRequests = computed(() => {
    const status = this.statusFilter();
    const type = this.typeFilter();
    const branch = this.branchFilter();

    return this.requests()
      .filter(
        (request) =>
          (status === 'all' || request.status === status) &&
          (type === 'all' || request.type === type) &&
          (branch === 'all' || request.branch === branch),
      )
      .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
  });

  readonly counters = computed(() => {
    const visible = this.visibleRequests();
    return {
      total: visible.length,
      pending: visible.filter((request) => request.status === 'pending').length,
      approved: visible.filter((request) => request.status === 'approved').length,
      rejected: visible.filter((request) => request.status === 'rejected').length,
      course: visible.filter((request) => request.type === 'course').length,
      bundle: visible.filter((request) => request.type === 'bundle').length,
    };
  });

  load(data: RawAppData): void {
    this.user.set(data.currentUser);
    this.requests.set(data.requests.map(this.toRequest));
  }

  /** Маппинг сырой фикстуры на доменную модель (anti-corruption layer). */
  private toRequest(raw: RawEnrollmentRequest): EnrollmentRequest {
    const { requester, target, paymentState, ...rest } = raw;
    return {
      ...rest,
      student: requester,
      course: target,
      paymentStatus: paymentState,
    };
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter.set(value);
  }

  setTypeFilter(value: TypeFilter): void {
    this.typeFilter.set(value);
  }

  setBranchFilter(value: BranchFilter): void {
    this.branchFilter.set(value);
  }

  canActOn(request: EnrollmentRequest): ActionCheck {
    const user = this.user();

    if (request.status !== 'pending') {
      return { allowed: false, reason: 'already_resolved' };
    }
    if (!user || request.collegeId !== user.collegeId) {
      return { allowed: false, reason: 'wrong_college' };
    }
    if (
      user.allowedBranches.length > 0 &&
      !user.allowedBranches.includes(request.branch)
    ) {
      return { allowed: false, reason: 'wrong_branch' };
    }

    return { allowed: true };
  }

  approve(id: number): void {
    this.resolve(id, 'approved');
  }

  reject(id: number, reason: string): void {
    const trimmed = reason.trim();
    if (!trimmed) return;
    this.resolve(id, 'rejected', trimmed);
  }

  private resolve(
    id: number,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ): void {
    const user = this.user();

    this.requests.update((requests) =>
      requests.map((request) => {
        if (request.id !== id || !this.canActOn(request).allowed) {
          return request;
        }

        return {
          ...request,
          status,
          resolvedAt: new Date().toISOString(),
          resolvedBy: user?.name ?? 'Unknown admin',
          ...(rejectionReason ? { rejectionReason } : {}),
        };
      }),
    );
  }
}
