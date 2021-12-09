import { DisjointSetBehaviour, DisjointSet } from '../disjoint'

interface Ticket {
  id: number
  title: string
}

describe('The disjoint functionality', () => {
  let disjointSet: DisjointSetBehaviour<Ticket>
  const ticket1 = { id: 1, title: 'Hello world' }
  const ticket2 = { id: 2, title: 'Hello panda' }
  const ticket3 = { id: 3, title: 'Hello monkey' }
  const ticket4 = { id: 4, title: 'Hello Ang' }
  const ticket5 = { id: 5, title: 'Hello Sauko' }
  const ticket6 = { id: 6, title: 'Hello Random' }

  beforeEach(() => {
    disjointSet = new DisjointSet([ticket1, ticket2, ticket3, ticket4])
  })

  it('Should be able to find the partition', () => {
    expect(disjointSet.findPartition(ticket1)).toEqual(ticket1)
  })

  it('Should return null if element is not present', () => {
    expect(disjointSet.findPartition({ ...ticket1, id: 2 })).toEqual(null)
  })

  it('Should be able to merge partitions', () => {
    expect(disjointSet.merge(ticket1, ticket2)).toEqual(true)
    expect(disjointSet.findPartition(ticket1)).toEqual(ticket1)
    expect(disjointSet.findPartition(ticket2)).toEqual(ticket1)
    expect(disjointSet.findPartition(ticket3)).toEqual(ticket3)
  })

  it('Does not merge elements absent', () => {
    expect(disjointSet.merge(ticket1, { ...ticket1, id: 10 })).toEqual(false)
  })

  it('Does not merge repeatedly', () => {
    expect(disjointSet.merge(ticket1, ticket2)).toEqual(true)
    expect(disjointSet.merge(ticket1, ticket2)).toEqual(false)
  })

  it('Merges in rank order', () => {
    expect(disjointSet.merge(ticket1, ticket2)).toEqual(true)
    expect(disjointSet.merge(ticket3, ticket4)).toEqual(true)
    disjointSet.add(ticket5)
    expect(disjointSet.merge(ticket3, ticket5)).toEqual(true)
    expect(disjointSet.merge(ticket1, ticket3)).toEqual(true)
    expect(disjointSet.areDisjoint(ticket5, ticket2)).toEqual(false)
  })

  it('Should be able to find disjoints', () => {
    expect(disjointSet.merge(ticket1, ticket2)).toEqual(true)
    expect(disjointSet.areDisjoint(ticket1, ticket2)).toEqual(false)
    expect(disjointSet.areDisjoint(ticket1, ticket3)).toEqual(true)
    expect(disjointSet.merge(ticket2, ticket3)).toEqual(true)
    expect(disjointSet.areDisjoint(ticket1, ticket3)).toEqual(false)
    expect(disjointSet.areDisjoint(ticket4, ticket1)).toEqual(true)
  })

  it('Should return the expected size', () => {
    expect(disjointSet.size()).toEqual(4)
    expect(disjointSet.add(ticket5))
    expect(disjointSet.size()).toEqual(5)
    expect(disjointSet.merge(ticket1, ticket5)).toEqual(true)
    expect(disjointSet.size()).toEqual(5)
  })

  it('Does not increase the size if duplicates are added', () => {
    disjointSet.add(ticket1)
    expect(disjointSet.size()).toEqual(4)
  })
})
