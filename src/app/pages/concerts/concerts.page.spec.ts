import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConcertsPage } from './concerts.page';

describe('ConcertsPage', () => {
  let component: ConcertsPage;
  let fixture: ComponentFixture<ConcertsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcertsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
