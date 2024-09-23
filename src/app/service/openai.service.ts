import { Injectable } from '@angular/core';
import { Assistant } from '../Models/Assistant';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { pipe } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiUrl = 'http://localhost:8089/api/openai';

  constructor(private http: HttpClient) { }

  // Méthode pour créer un assistant
  createAssistant(assistant: Assistant): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<string>(`${this.apiUrl}/assistant`, assistant, { headers, responseType: 'string' as 'json' })
      .pipe(catchError(this.handleError));
  }

  // Méthode pour envoyer un message à un thread
  sendMessageToThread(threadId: string, role: string, content: string): Observable<any> {
    const body = { role, content };
  
    return this.http.post(`${this.apiUrl}/send-message?threadId=${threadId}`, body, { responseType: 'text' as 'json' })
      .pipe(
        catchError(this.handleError) // Gestion des erreurs
      );
  }
  
  // Méthode pour exécuter un assistant sur un thread
  runAssistantOnThread(threadId: string, assistantId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/run-assistant?threadId=${threadId}`, { assistant_id: assistantId });
  }
  
getMessagesFromThread(threadId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/thread/${threadId}/assistant-response`,{responseType: 'text' as 'json'}).pipe(
    catchError(this.handleError) // Gestion des erreurs
  );
}

 
  
   createThread(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/create-thread`, { responseType: 'text' as 'json' })
      .pipe(catchError(this.handleError));
  }
  // Méthode pour gérer les erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue!';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}