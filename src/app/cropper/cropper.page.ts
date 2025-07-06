import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.page.html',
  styleUrls: ['./cropper.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CropperPage implements OnInit {

  @ViewChild('image', { static: false }) imageElement!: ElementRef;
  imageUrl: string | null = null;
  private cropper!: Cropper;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    this.imageUrl = image.dataUrl || null;

    // Wait for view to update
    setTimeout(() => {
      if (this.imageElement && this.imageUrl) {
        this.cropper = new Cropper(this.imageElement.nativeElement, {
          container: '.cropper-container'
        });
      }
    }, 100);
  }

  async cropAndUpload() {
    if (!this.cropper) return;

    // Correct method in CropperJS v2
    const canvas = this.cropper.getCropperCanvas() as unknown as HTMLCanvasElement;

    if (!canvas) {
      console.error('Canvas not returned by cropper');
      return;
    }

    // New in v2: convertToBlob() is async and returns a Promise<Blob>
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Blob conversion failed'));
      }, 'image/jpeg', 0.9);
    });

    // Convert Blob to File
    const file = new File([blob], 'cropped-image.jpg', { type: blob.type });

    // Create FormData and upload
    const formData = new FormData();
    formData.append('file', file);

    this.http.post('https://your-server.com/upload', formData).subscribe({
      next: (res) => console.log('Upload success:', res),
      error: (err) => console.error('Upload failed:', err),
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject('Failed to convert blob to base64');
      reader.onload = () => resolve((reader.result as string).split(',')[1]); // Remove data:image/jpeg;base64,
      reader.readAsDataURL(blob);
    });
  }
}
