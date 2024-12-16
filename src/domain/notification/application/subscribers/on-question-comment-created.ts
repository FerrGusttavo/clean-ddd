import { DomainEvents } from "@/core/events/domain-events";
import type { EventHandler } from "@/core/events/event-handler";
import type { SendNotificationUseCase } from "../use-cases/send-notification";
import { QuestionCommentCreatedEvent } from "@/domain/forum/enterprise/events/question-comment-created-event";
import type { QuestionCommentsRepository } from "@/domain/forum/application/repositories/question-comments-repository";

export class OnQuestionCommentCreated implements EventHandler {
  constructor(
    private questionCommentsRepository: QuestionCommentsRepository,
    private sendNotification: SendNotificationUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.sendQuestionCommentCreatedNotification.bind(this), QuestionCommentCreatedEvent.name)
  }

  private async sendQuestionCommentCreatedNotification({ questionComment }: QuestionCommentCreatedEvent) {
    const question = await this.questionCommentsRepository.findById(questionComment.id.toString())

    if (question) {
      await this.sendNotification.execute({
        recipientId: question.authorId.toString(),
        title: 'Novo comentário no seu tópico.',
        content: `${question.content.substring(0, 40).concat('...')}`
      })
    }
  }
}