import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDoorComponent } from './add.component';

describe('AddComponent', () => {
  let component: AddDoorComponent;
  let fixture: ComponentFixture<AddDoorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDoorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
