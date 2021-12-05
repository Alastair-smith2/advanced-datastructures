import { BloomFilter, BloomFilterable } from '../bloom-filter'

describe('Bloom filter functionality', () => {
  let bloom: BloomFilterable<{ id: number; title: string }>
  const ticket = { id: 1, title: 'Setup project' }
  const missingTicket = { ...ticket, id: 2 }
  beforeEach(() => {
    bloom = new BloomFilter(10)
  })

  it('Should start off empty', () => {
    expect(bloom.size()).toEqual(0)
  })

  it('Should be able to insert elements', () => {
    expect(bloom.insert(ticket).size()).toEqual(1)
  })

  describe('Insertion', () => {
    it('Should be able to verify an element is present', () => {
      expect(bloom.insert(ticket).size()).toEqual(1)
      expect(bloom.contains(ticket)).toEqual(true)
    })
  })

  describe('Size', () => {
    it('Should increment size when non-duplicate elements are added', () => {
      expect(
        bloom
          .insert(ticket)
          .insert({ ...ticket, id: 3 })
          .size()
      ).toEqual(2)
    })

    it('Should not increment size when duplicate elements are added', () => {
      expect(bloom.insert(ticket).insert(ticket).size()).toEqual(1)
    })

    it('Should be able to verify an element is not present', () => {
      expect(bloom.insert(ticket).size()).toEqual(1)
      expect(bloom.contains(missingTicket)).toEqual(false)
    })
  })

  describe('Remaining capacity', () => {
    it('Should decrement remaining capacity when multiple elements are added', () => {
      expect(
        bloom
          .insert(ticket)
          .insert({ ...ticket, id: 3 })
          .maxRemainingCapacity()
      ).toEqual(8)
    })

    it('Should not decrement remaining capacity when duplicates are added', () => {
      expect(
        bloom.insert(ticket).insert(ticket).maxRemainingCapacity()
      ).toEqual(9)
    })
  })

  describe('Confidence', () => {
    it('Should be 1 for empty Bloom filter', () => {
      expect(bloom.confidence()).toEqual(1)
    })

    it('Should be < 1 after a single insertion Bloom filter', () => {
      expect(bloom.insert(ticket).confidence()).toBeLessThan(1)
    })

    it('Should be smaller than 1 minus max expected tolerance when maxCapacity is exceeded', () => {
      ;[...Array(11).keys()].forEach((i) =>
        bloom.insert({ id: i, title: `New ticket ${i}` })
      )
      expect(bloom.confidence()).toBeLessThan(1 - 0.01)
    })
  })
})
