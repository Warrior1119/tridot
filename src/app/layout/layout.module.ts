import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { LayoutComponent } from './layout.component';
import { MobileSidebarComponent } from './mobile/sidebar/mobile-sidebar.component';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CoachSidebarComponent } from './coach-sidebar/coach-sidebar.component';
import { CoachMobileSidebarComponent } from './mobile/coach-sidebar/coach-mobile-sidebar.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,

    // Move to CoreModule
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 5000,
      positionClass: 'inline',
      maxOpened: 1,
      autoDismiss: true,
      preventDuplicates: true,
    }),
    ToastContainerModule,
  ],
  declarations: [
    LayoutComponent, 
    MobileSidebarComponent, 
    CoachMobileSidebarComponent,
    SidebarComponent,
    CoachSidebarComponent,
    HeaderComponent,
  ],
  exports: [
    LayoutComponent,
    SidebarComponent,
    MobileSidebarComponent,
    CoachMobileSidebarComponent,
  ]
})
export class LayoutModule { }
