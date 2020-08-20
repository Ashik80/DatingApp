import { AlertifyService } from './../../_services/alertify.service';
import { UserService } from './../../_services/user.service';
import { tokenGetter } from './../../app.module';
import { AuthService } from './../../_services/auth.service';
import { environment } from './../../../environments/environment';
import { Photo } from './../../_models/photo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTrashAlt, faUpload, faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();
  faTrashAlt = faTrashAlt;
  faUpload = faUpload;
  faBan = faBan;
  faTrash = faTrash;
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMain: Photo;

  constructor(private authService: AuthService, private userService: UserService, private alertify: AlertifyService) { }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader(): void {
    this.uploader = new FileUploader({
      url: `${this.baseUrl}/users/${this.authService.decodedToken.nameid}/photos`,
      authToken: `Bearer ${tokenGetter()}`,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo: Photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);
      }
    };
  }

  setMainPhoto(photo: Photo): void {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
      this.alertify.success('Photo added as main');
      this.currentMain = this.photos.filter(p => p.isMain)[0];
      this.currentMain.isMain = false;
      photo.isMain = true;
      this.authService.changeMemberPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
    }, error => {
      this.alertify.error(error);
    });
  }

  deletePhoto(id: number): void {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
        this.alertify.success('Photo has been deleted');
      }, error => {
        this.alertify.error('Failed to delete the photo');
      });
    });
  }

}
