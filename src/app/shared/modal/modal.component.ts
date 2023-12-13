import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  // providers: [ModalService]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalID = '';
  @Output() closedEvent = new EventEmitter<string>();

  constructor(
    public modalService: ModalService,
    public el: ElementRef
  ) {
    // code
  }

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }

  ngOnDestroy() {
    document.body.removeChild(this.el.nativeElement);
  }

  closeModal() {
    this.modalService.toggleModal(this.modalID);
    this.closedEvent.emit();
  }
}
