import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  constructor() { }

  @Input() isShow = false;
  @Output() onClose = new EventEmitter<void>();

  ngOnInit(): void {
  }

  close() {
    this.onClose.emit();
  }

}
