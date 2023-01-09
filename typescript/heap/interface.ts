export interface PriorityQueue<T> {
  top: () => T | null
  peek: () => T | null
  insert: (element: T, priority: number) => boolean
  remove: (element: T) => boolean
  update: (element: T, newValue: T) => boolean
  contains: (element: T) => boolean
  isEmpty: () => boolean
}
