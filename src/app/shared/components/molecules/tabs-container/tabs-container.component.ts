import {
  Component,
  ContentChildren,
  EventEmitter,
  Output,
  QueryList,
} from "@angular/core";

import { CommonModule } from "@angular/common";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NzIconModule } from "ng-zorro-antd/icon";
import { TabItemComponent } from "../../atoms/tab-item/tab-item.component";

@Component({
  selector: "app-tabs-container",
  standalone: true,
  imports: [CommonModule, NzTabsModule, NzIconModule],
  templateUrl: "./tabs-container.component.html",
  styleUrls: ["./tabs-container.component.scss"],
})
export class TabsContainerComponent {
  @ContentChildren(TabItemComponent)
  tabs!: QueryList<TabItemComponent>;

  @Output() selectedIndexChange = new EventEmitter<number>();

  selectedIndex = 0;

  onSelectedIndexChange(index: number): void {
    this.selectedIndex = index;
    this.selectedIndexChange.emit(index);
  }
}
