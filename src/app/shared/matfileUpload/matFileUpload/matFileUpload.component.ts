import { Component, EventEmitter, Input, OnDestroy, Output, Inject, forwardRef, QueryList, ContentChildren } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subscription ,  merge } from 'rxjs';
import { startWith } from 'rxjs/operators';

/**
 * A material design file upload component.
 */
@Component({
    selector: 'mat-file-upload',
    templateUrl: `./matFileUpload.component.html`,
    exportAs: 'matFileUpload',
    host: {
      'class': 'mat-file-upload',
    },
    styleUrls: ['./matFileUploadQueue.scss'],
  })
  export class MatFileUpload implements OnDestroy {

    constructor(
      private HttpClient: HttpClient
      ,@Inject(forwardRef(() => MatFileUploadQueue)) private matFileUploadQueue: MatFileUploadQueue
    ) {

        if(matFileUploadQueue) {
          this.httpUrl = matFileUploadQueue.httpUrl || this.httpUrl;
          console.log(matFileUploadQueue.httpRequestHeaders);
          console.log(this.httpRequestHeaders);
          
          this.httpRequestHeaders = matFileUploadQueue.httpRequestHeaders || this.httpRequestHeaders;
          this.httpRequestParams = matFileUploadQueue.httpRequestParams || this.httpRequestParams;
          this.fileAlias = matFileUploadQueue.fileAlias || this.fileAlias;
        }

    }

    isUploading:boolean = false;



    /* Http request input bindings */
    @Input()
    httpUrl: string = 'http://localhost:8080';

    @Input()
    httpRequestHeaders: HttpHeaders | {
      [header: string]: string | string[];
    } = new HttpHeaders();

    @Input()
    httpRequestParams: HttpParams | {
      [param: string]: string | string[];
    } = new HttpParams();

    @Input()
    fileAlias: string = "file";

    @Input()
    get file(): any {
      return this._file;
    }
    set file(file: any) {
      this._file = file;
      this.total = this._file.size;
    }

    @Input()
    set id(id: number) {
      this._id = id;
    }
    get id(): number {
      return this._id;
    }

    /** Output  */
    @Output() removeEvent = new EventEmitter<MatFileUpload>();
    @Output() onUpload = new EventEmitter();

    progressPercentage: number = 0;
    public loaded: number = 0;
    total: number = 0;
    _file: any;
    _id: number;
    fileUploadSubscription: any;

    public upload(): void {
      this.isUploading = true;
      let formData = new FormData();
      formData.set(this.fileAlias, this._file, this._file.name);
      this.fileUploadSubscription = this.HttpClient.post(this.httpUrl, formData, {
        headers: this.httpRequestHeaders,
        observe: "events",
        params: this.httpRequestParams,
        reportProgress: true,
        responseType: "json"
      }).subscribe((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressPercentage = Math.floor( event.loaded * 100 / event.total );
          this.loaded = event.loaded;
          this.total = event.total;
        }
        this.onUpload.emit({ file: this._file, event: event });
      }, (error: any) => {
        if (this.fileUploadSubscription) {
          this.fileUploadSubscription.unsubscribe();
        }
        this.isUploading = false;
        this.onUpload.emit({ file: this._file, event: event });
      });
    }

    public remove(): void {
      if (this.fileUploadSubscription) {
        this.fileUploadSubscription.unsubscribe();
      }
      this.removeEvent.emit(this);
    }

    ngOnDestroy() {
      console.log('file '+ this._file.name + ' destroyed...');
    }

}

/**
 * A material design file upload queue component.
 */
@Component({
  selector: 'mat-file-upload-queue',
  templateUrl: `matFileUploadQueue.component.html`,
  exportAs: 'matFileUploadQueue',
})
export class MatFileUploadQueue implements OnDestroy {

  @ContentChildren(forwardRef(() => MatFileUpload)) fileUploads: QueryList<MatFileUpload>;

  /** Subscription to remove changes in files. */
  _fileRemoveSubscription: Subscription | null;

  /** Subscription to changes in the files. */
  _changeSubscription: Subscription;

  /** Combined stream of all of the file upload remove change events. */
  get fileUploadRemoveEvents() {
      return merge(...this.fileUploads.map(fileUpload => fileUpload.removeEvent));
  }

  files: Array<any> = [];

  /* Http request input bindings */
  @Input()
  httpUrl: string;

  @Input()
  httpRequestHeaders: HttpHeaders | {
    [header: string]: string | string[];
  } = new HttpHeaders();

  @Input()
  httpRequestParams: HttpParams | {
    [param: string]: string | string[];
  } = new HttpParams();

  @Input()
  fileAlias: string = "file";

  ngAfterViewInit() {
    // When the list changes, re-subscribe
    this._changeSubscription = this.fileUploads.changes.pipe(startWith(null)).subscribe(() => {
      if (this._fileRemoveSubscription) {
        this._fileRemoveSubscription.unsubscribe();
      }
      this._listenTofileRemoved();
    });
  }

  private _listenTofileRemoved(): void {
    this._fileRemoveSubscription = this.fileUploadRemoveEvents.subscribe((event: MatFileUpload) => {
      this.files.splice(event.id, 1);
    });
  }

  add(file: any) {
    this.files.push(file);
  }

  public uploadAll() {
    this.fileUploads.forEach((fileUpload) => { fileUpload.upload() });
  }

  public removeAll() {
    this.files.splice(0, this.files.length);
  }

  ngOnDestroy() {
    if (this.files) {
      this.removeAll();
    }
  }

}