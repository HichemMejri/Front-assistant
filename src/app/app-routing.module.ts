import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAssistantComponent } from './create-assistant/create-assistant.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
const routes: Routes = [
  { path: 'create-assistant', component: CreateAssistantComponent },
  { path: 'chat-message', component: ChatMessageComponent },
  { path: '', redirectTo: 'create-assistant', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
