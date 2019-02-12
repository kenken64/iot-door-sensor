import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeedbackComponent } from './add.component';

describe('AddFeedbackComponent', () => {
  let component: AddFeedbackComponent;
  let fixture: ComponentFixture<AddFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
