import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { fromEvent, mergeMap, Subscription, takeUntil, tap } from 'rxjs';
interface IPoint { x: number; y: number; }
@Directive({
  selector: '[appDragModal]',
  standalone: true
})
export class DragModalDirective implements AfterViewInit, OnDestroy {

  private subscription$ = new Subscription();
  private start: IPoint = { x: 0, y: 0 };
  private offset: IPoint = { x: 0, y: 0 };
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Timeout para asegurar que Bootstrap o NG-Zorro hayan renderizado el modal
    setTimeout(() => {
      this.makeItDraggable();
    });
  }

  private makeItDraggable() {
    // Buscamos el contenedor real (Organism) que queremos desplazar
    const modalDialogElement = this.el.nativeElement.closest(".modal-dialog");

    if (!modalDialogElement) {
      console.error('DragModalDirective: No se encontró el elemento .modal-dialog');
      return;
    }

    // Estilos visuales para el "Handle" (Cabecera)
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'move');
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
    
    // Eliminamos transiciones para que el movimiento sea fluido (sin lag)
    this.renderer.setStyle(modalDialogElement, 'transition', 'none');

    const down$ = fromEvent<MouseEvent>(this.el.nativeElement, 'mousedown');
    const move$ = fromEvent<MouseEvent>(document, 'mousemove');
    const up$ = fromEvent<MouseEvent>(document, 'mouseup');

    const drag$ = down$.pipe(
      tap(($event: MouseEvent) => {
        this.start = {
          x: $event.clientX - this.offset.x,
          y: $event.clientY - this.offset.y
        };
      }),
      mergeMap(() => move$.pipe(takeUntil(up$)))
    );

    this.subscription$.add(
      drag$.subscribe(($event: MouseEvent) => {
        this.offset = {
          x: $event.clientX - this.start.x,
          y: $event.clientY - this.start.y
        };

        this.renderer.setStyle(
          modalDialogElement,
          'transform',
          `translate(${this.offset.x}px, ${this.offset.y}px)`
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }

}
