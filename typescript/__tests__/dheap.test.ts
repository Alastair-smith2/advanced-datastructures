import { DHeap as Heap } from '../heap'
import { PriorityQueue } from '../heap/interface'

interface Ticket {
  title: string
  priority: number
}

describe('The priority queue behaviour', () => {
  let heap: PriorityQueue<Ticket>

  beforeEach(() => {
    const compare = (elementA: Ticket, elementB: Ticket) => {
      return elementA.priority > elementB.priority
    }
    heap = new Heap(
      [
        { title: 'Example A', priority: 6 },
        { title: 'Example B', priority: 3 },
        { title: 'Example C', priority: 2 },
        { title: 'Example D', priority: 15 },
        { title: 'Example E', priority: 18 },
        { title: 'Example F', priority: 8 },
        { title: 'Example G', priority: 10 },
        { title: 'Example H', priority: 25 },
        { title: 'Example I', priority: 20 },
      ],
      2,
      compare
    )
  })

  it('Should return the highest priority element in the queue', () => {
    expect(heap.peek()).toEqual({ title: 'Example H', priority: 25 })
  })

  it('Should return the next highest priority element in the queue', () => {
    expect(heap.top()).toMatchObject({ priority: 25 })
    expect(heap.top()).toMatchObject({ priority: 20 })
    expect(heap.top()).toMatchObject({ priority: 18 })
    expect(heap.top()).toMatchObject({ priority: 15 })
    expect(heap.top()).toMatchObject({ priority: 10 })
    expect(heap.top()).toMatchObject({ priority: 8 })
    expect(heap.top()).toMatchObject({ priority: 6 })
    expect(heap.top()).toMatchObject({ priority: 3 })
    expect(heap.top()).toMatchObject({ priority: 2 })
    expect(heap.top()).toEqual(null)
  })

  it('Should return true if the element exists', () => {
    expect(heap.contains({ title: 'Example C', priority: 2 })).toEqual(true)
  })

  it('Should return false if the element is absent', () => {
    expect(heap.contains({ title: 'Example D', priority: 4 })).toEqual(false)
  })

  it('Should can update an existing element', () => {
    heap.update(
      { title: 'Example A', priority: 6 },
      { title: 'Example A', priority: 21 }
    )
    expect(heap.peek()).toEqual({ title: 'Example H', priority: 25 })
    heap.top()
    expect(heap.peek()).toEqual({ title: 'Example A', priority: 21 })
    heap.top()
    expect(heap.peek()).toEqual({ title: 'Example I', priority: 20 })
    heap.top()
    expect(heap.peek()).toEqual({ title: 'Example E', priority: 18 })
  })

  it('Should be able to remove an element', () => {
    heap.remove({ title: 'Example H', priority: 25 })
    expect(heap.top()).toEqual({ title: 'Example I', priority: 20 })
    expect(heap.peek()).toMatchObject({ priority: 18 })
  })

  it('Should be able to insert an element', () => {
    const element = { title: 'Example H', priority: 28 }
    heap.insert(element, element.priority)
    expect(heap.top()).toMatchObject({ priority: 28 })
    expect(heap.top()).toMatchObject({ priority: 25 })
    expect(heap.peek()).toMatchObject({ priority: 20 })
  })
})
