export interface Hash<T, K> {
  add: (key: T, value: K) => void
  search: (key: T) => K | null
  remove: (key: T) => void
}

export class HashTable<T, K> implements Hash<T, K> {
  private elements: K[] = []
  private size: number
  constructor(size: number = 5) {
    this.size = size
  }

  private createHash = (key: T): number => {
    const stringKey = String(key)
    const sum = stringKey
      .split('')
      .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    return sum % this.size
  }
  public add = (key: T, value: K) => {
    const index = this.createHash(key)
    this.elements[index] = value
  }
  public search = (key: T) => {
    const index = this.createHash(key)
    return this.elements[index] ? this.elements[index] : null
  }
  public remove = (key: T) => {
    const index = this.createHash(key)
    delete this.elements[index]
  }
}
