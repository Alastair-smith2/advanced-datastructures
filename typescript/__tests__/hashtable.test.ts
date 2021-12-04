import { Hash, HashTable } from '../core/hashtable'

describe('The hashtable', () => {
  let hashTable: Hash<string, { id: number; title: string }>

  beforeEach(() => {
    hashTable = new HashTable(10)
  })

  it('Should be able to add elements', () => {
    const key = 'ticket1'
    const ticket = { id: 10, title: 'Order pizza' }
    hashTable.add(key, ticket)
    expect(hashTable.search(key)).toEqual(ticket)
  })

  // This is to fix using chaining, current linked list doesn't allow us to retrieve elements by a hash
  it.skip('Should be able to add elements without collisions', () => {
    const key = 'ticket1'
    const ticket = { id: 10, title: 'Order pizza' }
    hashTable.add(key, ticket)
    hashTable.add('1ticket', { id: 11, title: 'Buy new games console' })
    expect(hashTable.search(key)).toEqual(ticket)
  })

  it('Should be able to remove elements', () => {
    const key = 'ticket1'
    const ticket = { id: 10, title: 'Order pizza' }
    hashTable.add(key, ticket)
    expect(hashTable.search(key)).toEqual(ticket)
    hashTable.remove(key)
    expect(hashTable.search(key)).toEqual(null)
  })
})
