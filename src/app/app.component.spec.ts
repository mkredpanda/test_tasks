import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    // constructor fires a GET for the assignment data
    TestBed.inject(HttpTestingController).expectOne('test_input.json').flush({
      currentUser: {
        id: 1,
        name: 'Admin',
        role: 'admin',
        collegeId: 1,
        permissions: [],
        allowedBranches: [],
      },
      requests: [],
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
