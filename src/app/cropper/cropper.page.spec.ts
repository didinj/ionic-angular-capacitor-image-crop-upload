import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CropperPage } from './cropper.page';

describe('CropperPage', () => {
  let component: CropperPage;
  let fixture: ComponentFixture<CropperPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CropperPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
