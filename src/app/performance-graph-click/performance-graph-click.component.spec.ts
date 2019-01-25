import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceGraphClickComponent } from './performance-graph-click.component';

describe('PerformanceGraphClickComponent', () => {
  let component: PerformanceGraphClickComponent;
  let fixture: ComponentFixture<PerformanceGraphClickComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceGraphClickComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceGraphClickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
