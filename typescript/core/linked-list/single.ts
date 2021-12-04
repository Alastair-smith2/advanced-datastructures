class SingleNode<T> {
  next: SingleNode<T> | null = null
  constructor(private data: T) {}
  public getValue = () => this.data
}

export interface SingleList<T> {
  append: (element: T) => void
  addFirst: (element: T) => void
  removeFirst: () => SingleNode<T> | null
  removeLast: () => SingleNode<T> | null
  delete: (element: T) => void
  search: (element: T) => SingleNode<T> | null
  traversal: () => T[]
  size: () => number
}

type Compare<T> = (a: T, b: T) => boolean

export class SingleLinkedList<T> implements SingleList<T> {
  private head: SingleNode<T> | null = null
  private count: number = 0
  private comparator: Compare<T>

  constructor(comparator: Compare<T>) {
    this.comparator = comparator
  }

  public append = (element: T) => {
    if (!this.head) {
      this.head = new SingleNode(element)
    } else {
      let current = this.head
      while (current.next != null) {
        current = current.next
      }
      current.next = new SingleNode(element)
    }
    this.incrementCount()
  }

  public addFirst = (element: T) => {
    const node = new SingleNode(element)
    node.next = this.head
    this.head = node
    this.incrementCount()
  }

  public removeFirst = () => {
    if (!this.head) {
      return null
    }
    const node = this.head
    this.head = this.head.next
    this.decrementCount()
    return node
  }

  public removeLast = () => {
    let current = this.head
    let node = null
    if (current && current.next) {
      while (current && current.next && current.next.next) {
        current = current.next
      }
      node = current.next
      current.next = null
    } else {
      this.head = null
      node = current
    }
    if (node) {
      this.decrementCount()
    }
    return node
  }

  public delete = (element: T) => {
    if (!this.head) return
    if (this.comparator(this.head.getValue(), element)) {
      this.head = this.head.next
      this.decrementCount()
      return
    }

    let current = this.head.next
    let previous = this.head

    /**
     * Search for the node to be removed and keep track of its previous node
     *
     * If it were a double linked list, we could simply search the node
     * and it would have a pointer to the previous node
     **/
    while (current) {
      if (this.comparator(current.getValue(), element)) {
        current = null
      } else {
        previous = current
        current = current.next
      }
    }

    /**
     * set previous.next to the target.next, if the node target is not found,
     * the 'previous' will point to the last node,
     * since the last node hasn't next, nothing will happen
     **/
    previous.next = previous.next ? previous.next.next : null
    this.decrementCount()
  }

  public traversal = () => {
    let current = this.head
    const items = []
    while (current) {
      items.push(current.getValue())
      current = current.next
    }
    return items
  }

  public search = (element: T) => {
    let current = this.head
    while (current) {
      if (this.comparator(current.getValue(), element)) {
        return current
      }
      current = current.next
    }
    return null
  }

  public size = () => this.count

  private incrementCount = () => {
    this.count++
  }

  private decrementCount = () => {
    this.count--
  }
}
