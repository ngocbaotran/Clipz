import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';

import { ClipService } from '../../services/clip.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Your clip is being upload.';
  isSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  uploadForm = new FormGroup({
    title: this.title
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService
  ) {
    auth.user.subscribe(user => this.user = user);
  }

  ngOnInit(): void {
  }

  storeFile($event: Event) {
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being upload.';
    this.isSubmission = true;
    this.showPercentage = true;
    const clipFileName = uuid();
    const clipPath = `clip/${clipFileName}.mp4`;
    const task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100;
    });
    task.snapshotChanges()
      .pipe(last(), switchMap(() => clipRef.getDownloadURL()))
      .subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url
          };

          await this.clipsService.createClip(clip);
          this.alertColor = 'green';
          this.alertMsg = 'Success! Your clip is now ready to share with the world!';
          this.showPercentage = false;
        },
        error: (error) => {
          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later.';
          this.isSubmission = true;
          this.showPercentage = false;
        }
      });
  }
}