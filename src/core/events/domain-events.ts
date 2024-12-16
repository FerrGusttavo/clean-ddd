import type { AggregateRoot } from '../entities/aggregate-root'
import type { UniqueEntityID } from '../entities/unique-entity-id'
import type { DomainEvent } from './domain-event'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type DomainEventCallback = (event: any) => void

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DomainEvents {
	private static handlersMap: Record<string, DomainEventCallback[]> = {}
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private static markedAggregates: AggregateRoot<any>[] = []

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public static markAggregateForDispatch(aggregate: AggregateRoot<any>) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id)

		if (!aggregateFound) {
			// biome-ignore lint/complexity/noThisInStatic: <explanation>
			this.markedAggregates.push(aggregate)
		}
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private static dispatchAggregateEvents(aggregate: AggregateRoot<any>) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		// biome-ignore lint/complexity/noForEach: <explanation>
		aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
	}

	private static removeAggregateFromMarkedDispatchList(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		aggregate: AggregateRoot<any>,
	) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		this.markedAggregates.splice(index, 1)
	}

	private static findMarkedAggregateByID(
		id: UniqueEntityID,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	): AggregateRoot<any> | undefined {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
	}

	public static dispatchEventsForAggregate(id: UniqueEntityID) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		const aggregate = this.findMarkedAggregateByID(id)

		if (aggregate) {
			// biome-ignore lint/complexity/noThisInStatic: <explanation>
			this.dispatchAggregateEvents(aggregate)
			aggregate.clearEvents()
			// biome-ignore lint/complexity/noThisInStatic: <explanation>
			this.removeAggregateFromMarkedDispatchList(aggregate)
		}
	}

	public static register(
		callback: DomainEventCallback,
		eventClassName: string,
	) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		const wasEventRegisteredBefore = eventClassName in this.handlersMap

		if (!wasEventRegisteredBefore) {
			// biome-ignore lint/complexity/noThisInStatic: <explanation>
			this.handlersMap[eventClassName] = []
		}

		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		this.handlersMap[eventClassName].push(callback)
	}

	public static clearHandlers() {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		this.handlersMap = {}
	}

	public static clearMarkedAggregates() {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		this.markedAggregates = []
	}

	private static dispatch(event: DomainEvent) {
		const eventClassName: string = event.constructor.name

		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		const isEventRegistered = eventClassName in this.handlersMap

		if (isEventRegistered) {
			// biome-ignore lint/complexity/noThisInStatic: <explanation>
			const handlers = this.handlersMap[eventClassName]

			for (const handler of handlers) {
				handler(event)
			}
		}
	}
}
