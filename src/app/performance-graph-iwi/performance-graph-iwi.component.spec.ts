import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceGraphIwiComponent } from './performance-graph-iwi.component';

describe('PerformanceGraphIwiComponent', () => {
  let component: PerformanceGraphIwiComponent;
  let fixture: ComponentFixture<PerformanceGraphIwiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceGraphIwiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceGraphIwiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
