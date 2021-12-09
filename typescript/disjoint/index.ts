// export interface DisjointSetBehaviour<T> {
//   init: (universe: T) => void
//   findPartition: (element: T) => boolean
//   merge: (a: T, b: T) => void
//   areDisjoint: (a: T, b: T) => void
// }

export interface DisjointSetBehaviour<T> {
  // this is private?
  findPartition: (element: T) => T | null
  add: (element: T) => boolean
  merge: (a: T, b: T) => boolean
  areDisjoint: (a: T, b: T) => boolean
  size: () => number
}

class Info<T> {
  private _root: T
  private _rank: number
  /**
   * @constructor
   *
   * Creates a named pair with root and rank, modeling the properties of a single element in the disjoint-set.
   * NOTE: we use public properties because (1) this class is private and thus only used locally, and (2) there is no way
   * to declare them private and properly encapsulated, not accessible by DisjointSet.
   *
   * @param elem The element to store.
   */
  constructor(element: T) {
    this._root = element
    this._rank = 1
  }

  get rank() {
    return this._rank
  }

  set rank(newRank: number) {
    this._rank = newRank
  }

  get root() {
    return this._root
  }

  set root(newRoot: T) {
    this._root = newRoot
  }
}

export class DisjointSet<T> implements DisjointSetBehaviour<T> {
  private elements: Map<T, Info<T>> = new Map()
  constructor(universe: T[]) {
    for (const element of universe) {
      if (this.elements.has(element)) {
        throw new Error(`${element} is already present`)
      }
      this.elements.set(element, new Info(element))
    }
  }
  public size = () => this.elements.size

  public add = (element: T) => {
    if (this.elements.has(element)) {
      return false
    }
    this.elements.set(element, new Info(element))
    return true
  }

  public findPartition = (element: T) => {
    const info = this.elements.get(element)
    if (!info) {
      return null
    }
    if (info.root === element) {
      return element
    }

    const result = this.findPartition(info.root)
    if (!result) {
      return null
    }
    info.root = result
    return info.root
  }

  public merge = (a: T, b: T) => {
    let r1 = this.findPartition(a)
    let r2 = this.findPartition(b)

    if (!r1 || !r2) {
      return false
    }

    if (r1 === r2) {
      return false
    }
    let info1 = this.elements.get(r1)
    let info2 = this.elements.get(r2)

    if (!info1 || !info2) {
      return false
    }

    if (info1.rank >= info2.rank) {
      info2.root = info1.root
      info1.rank += info2.rank
    } else {
      // r1 < r2
      info1.root = info2.root
      info2.rank += info1.rank
    }
    return true
  }

  public areDisjoint = (a: T, b: T) => {
    let p1 = this.findPartition(a) // this validates the input and might throw
    let p2 = this.findPartition(b) // this validates the input and might throw

    return p1 !== p2
  }
}
