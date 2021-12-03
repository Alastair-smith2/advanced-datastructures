class LLNode<T> {
  public next: LLNode<T> | null = null;
  public prev: LLNode<T> | null = null;
  constructor(private data: T) {}
  public getValue = (): T => {
    return this.data;
  };
}

export interface ILinkedList<T> {
  add(data: T): LLNode<T>;
  remove: (element: T) => LLNode<T> | null;
  removeTail: () => LLNode<T> | null;
  addAll(data: T[]): boolean;
  clear(): void;
  size(): number;
  isEmpty(): boolean;
  contains: (element: T) => boolean;
  search(value: T): LLNode<T> | null;
}

export class LinkedList<T> implements ILinkedList<T> {
  private head: LLNode<T> | null = null;
  private tail: LLNode<T> | null = null;
  private count: number = 0;

  public remove = (value: T) => {
    const node = this.search(value);
    if (!node) {
      return node;
    }
    const nodeValue = node.getValue();
    if (nodeValue === this.tail?.getValue()) {
      this.tail = this.tail?.prev;
    }
    if (nodeValue === this.head?.getValue()) {
      this.head = this.head?.next;
    }
    if (!node.prev) {
      node.prev = node.next;
    }
    this.count -= 1;
    return node;
  };

  public removeTail = () => {
    const oldTail = this.tail;

    if (!oldTail) {
      return oldTail;
    }

    if (oldTail.getValue() === this.head?.getValue()) {
      this.tail = this.head;
    } else {
      this.tail = oldTail.prev;
      // ! here is dangerous and relies upon correct implementation
      this.tail!.next = null;
    }
    this.count -= 1;
    return oldTail;
  };

  public addAll = (data: T[]) => {
    for (const element of data) {
      this.add(element);
    }
    return true;
  };
  public clear = () => {
    this.count = 0;
    this.head = null;
    this.tail = null;
  };
  public size = () => {
    return this.count;
  };

  public search = (value: T) => {
    let currentSearch = this.head;
    while (currentSearch !== null) {
      if (value === currentSearch.getValue()) {
        return currentSearch;
      } else if (currentSearch.next !== null) {
        currentSearch = currentSearch.next;
      } else {
        return currentSearch.getValue() === value ? currentSearch : null;
      }
    }
    return null;
  };

  public isEmpty = () => {
    return this.count === 0;
  };

  public add = (value: T) => {
    const node = new LLNode(value);
    this.count += 1;
    if (this.head) {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    } else {
      this.head = new LLNode(value);
    }
    if (!this.tail) {
      this.tail = this.head;
    }
    return node;
  };

  public contains = (value: T): boolean => {
    let currentSearch = this.head;
    if (currentSearch === null) {
      return false;
    }

    while (currentSearch !== null) {
      if (value === currentSearch.getValue()) {
        return true;
      } else if (currentSearch.next !== null) {
        currentSearch = currentSearch.next;
      } else {
        break;
      }
    }
    return false;
  };
}
