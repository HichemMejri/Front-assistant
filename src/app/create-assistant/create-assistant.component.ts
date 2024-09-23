import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpenaiService } from '../service/openai.service'
import { Assistant } from '../Models/Assistant';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-assistant',
  templateUrl: './create-assistant.component.html',
  styleUrls: ['./create-assistant.component.css']
})
export class CreateAssistantComponent {
  assistantForm!: FormGroup;
  response: any;
  error: string | null = null;
  responseId: string | null = null; // Nouvelle propriété pour stocker l'ID

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private openaiService: OpenaiService
  ) {
    this.createForm();
  }

  // Initialize the form with validation rules
  createForm() {
    this.assistantForm = this.fb.group({
      instruction: ['', Validators.required],
      description: ['', Validators.required],
      function: ['', Validators.required] 
      
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.assistantForm.invalid) {
      // Gérer les erreurs de validation ici
      return;
    }

    // Créez l'objet Assistant à partir des valeurs du formulaire
    const assistant: Assistant = {
      instruction: this.assistantForm.value.instruction,
      description: this.assistantForm.value.description,
      function: this.assistantForm.value.function 
    };

    // Appelez le service pour créer l'assistant
    this.openaiService.createAssistant(assistant).subscribe({
      next: (data) => {
        console.log('Response:', data);
        this.response = data;
        this.error = null;

        // Extraire l'ID de la réponse si elle est sous forme de chaîne
        this.responseId = this.extractIdFromResponse(data);
        console.log('Response Id:', this.responseId);
        this.router.navigate(['/chat-message'], { queryParams: { assistantId: this.responseId } });
      },
      error: (err) => {
        console.error('Error:', err);
        this.response = null;
        this.error = err.message || 'Une erreur est survenue';
      }
    });
  }

  // Fonction pour extraire l'ID d'une chaîne
  private extractIdFromResponse(response: string): string | null {
    const idMatch = response.match(/id=(\w+)/);
    return idMatch ? idMatch[1] : null;
  }
}