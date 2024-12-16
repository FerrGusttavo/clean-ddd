import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository"
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository"
import { SendNotificationUseCase } from "../use-cases/send-notification"
import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository"
import { makeQuestion } from "test/factories/make-question"
import type { MockInstance } from 'vitest'
import { waitFor } from "test/utils/wait-for"
import { OnQuestionCommentCreated } from "./on-question-comment-created"
import { InMemoryQuestionCommentsRepository } from "test/repositories/in-memory-question-comments-repository"
import { makeQuestionComment } from "test/factories/make-question-comment"

let inMemoryQuestionAttachments: InMemoryQuestionAttachmentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance

describe('On Question Comment Created', () => {
  beforeEach(() => {
    inMemoryQuestionAttachments = new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachments)
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository()
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sendNotificationUseCase = new SendNotificationUseCase(inMemoryNotificationsRepository)

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnQuestionCommentCreated(inMemoryQuestionCommentsRepository, sendNotificationUseCase)
  })

  it('should send a notification when question has new comment', async () => {
    const question = makeQuestion()

    inMemoryQuestionsRepository.create(question)

    const questionComment = makeQuestionComment({
      questionId: question.id
    })

    inMemoryQuestionCommentsRepository.create(questionComment)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})