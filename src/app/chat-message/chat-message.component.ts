import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpenaiService } from '../service/openai.service';
import { ActivatedRoute } from '@angular/router';

import { Router } from '@angular/router';
@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {
  messageForm!: FormGroup;
  messages: { role: string, content: string }[] = [];
  error: string | null = null;
  threadId: string | null = null;
  assistantId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private openaiService: OpenaiService,
    private route: ActivatedRoute,  // Ajouté
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.route.queryParams.subscribe(params => {
      this.assistantId = params['assistantId'] || null;
      this.createThread(); 
    });
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  createThread(): void {
    this.openaiService.createThread().subscribe({
      next: (data) => {
        console.log('Thread ID reçu:', data);
        try {
          const responseJson = JSON.parse(data);
          if (responseJson && responseJson.id) {
            this.threadId = responseJson.id;
          } else {
            this.error = 'ID du thread non trouvé dans la réponse';
          }
        } catch (e) {
          this.error = 'Erreur lors de la parsing de la réponse JSON';
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création du thread:', err);
        this.error = err.message || 'Une erreur est survenue lors de la création du thread';
      }
    });
  }

  onSubmit(): void {
    if (this.messageForm.invalid) {
      return;
    }

    const message = this.messageForm.value.message;
    if (this.threadId) {
      this.sendMessage(message);
    } else {
      this.error = 'Le thread n\'est pas encore créé';
    }
  }

  sendMessage(message: string): void {
    if (!this.threadId) return;

    this.messages.push({ role: 'user', content: message });

    this.openaiService.sendMessageToThread(this.threadId, 'user', message).subscribe({
      next: () => {
        this.error = null;
        this.runAssistantOnThread();
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi du message:', err);
        this.error = err.message || 'Une erreur est survenue lors de l\'envoi du message';
      }
    });
    this.messageForm.reset();
  }

  runAssistantOnThread(): void {
    if (!this.threadId || !this.assistantId) return;

    this.openaiService.runAssistantOnThread(this.threadId, this.assistantId).subscribe({
      next: (data) => {
        console.log('Assistant exécuté sur le thread:', data);
      
        setTimeout(() => {
          this.loadMessages();
        }, 1500); 
      },
      error: (err) => {
        console.error('Erreur lors de l\'exécution de l\'assistant:', err);
        this.error = err.message || 'Erreur lors de l\'exécution de l\'assistant';
      }
    });
  }

  loadMessages(): void {
    if (!this.threadId) return;

    console.log('threadId:', this.threadId);

    this.openaiService.getMessagesFromThread(this.threadId).subscribe({
      next: (response: any) => {
        console.log('Réponse brute de l\'API:', response);

        if (typeof response === 'string') {
          // Si la réponse est une chaîne, la traiter comme tel
          this.messages.push({ role: 'assistant', content: response });
          console.log('Messages chargés:', this.messages);
        } else if (response && response.data && Array.isArray(response.data)) {
          // Si la réponse est au format JSON attendu
          const newMessages = response.data.map((message: any) => {
            return {
              id: message.id,
              role: message.role,
              createdAt: message.created_at,
              content: message.content.map((c: any) => c.text.value).join(' '),
              attachments: message.attachments.length > 0 ? message.attachments : null,
              metadata: message.metadata
            };
          });

          this.messages = [...this.messages, ...newMessages];
          console.log('Messages chargés:', this.messages);
        } else {
          this.error = 'Format de réponse inattendu ou absence de données';
          console.error('Réponse inattendue:', response);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des messages:', err);
        this.error = err.message || 'Une erreur est survenue lors du chargement des messages';
      }
    });
  }
}