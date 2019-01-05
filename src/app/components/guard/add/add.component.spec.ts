import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGuardComponent } from './add.component';

describe('AddComponent', () => {
  let component: AddGuardComponent;
  let fixture: ComponentFixture<AddGuardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGuardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
