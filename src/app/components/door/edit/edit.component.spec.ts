import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDoorComponent } from './edit.component';

describe('EditComponent', () => {
  let component: EditDoorComponent;
  let fixture: ComponentFixture<EditDoorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDoorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
