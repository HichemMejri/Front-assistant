import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAssistantComponent } from './create-assistant.component';

describe('CreateAssistantComponent', () => {
  let component: CreateAssistantComponent;
  let fixture: ComponentFixture<CreateAssistantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAssistantComponent]
    });
    fixture = TestBed.createComponent(CreateAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
