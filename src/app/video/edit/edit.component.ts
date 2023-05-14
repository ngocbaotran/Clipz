import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import { ModalService } from '../../services/modal.service';
import IClip from '../../models/clip.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {
  @Input() activeClip: IClip | null = null;

  constructor(
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy() {
    this.modal.unregister('editClip');
  }
}
