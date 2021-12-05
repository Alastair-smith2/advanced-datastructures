// Comments on most of these methods come from the book implementation
// https://github.com/mlarocca/AlgorithmsAndDataStructuresInAction/blob/master/JavaScript/src/bloom_filter/bloom_filter.js
import { fnv1Hash32, murmurHash32 } from './hashes'
import { consistentStringify } from './stringify'

export interface BloomFilterable<T> {
  insert(value: T): this
  contains(value: T): boolean
  size: () => number
  confidence: () => number
  maxRemainingCapacity: () => number
}

const LN_2 = Math.log(2)

type HashInit = (h1: number, h2: number) => number

// If we needed larger bitsArray could look to migrate from Uint8Array to BigUInt64Array
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigUint64Array
export class BloomFilter<T> implements BloomFilterable<T> {
  private count: number = 0
  private maxSize: number
  private seed: number
  private numOfBits: number
  private numberHashFunctions: number
  private hashFunctions: HashInit[]
  // Array of 8-bit unsigned ints
  // Bytes / element = 1
  private bitsArray: Uint8Array
  constructor(
    maxSize: number,
    maxTolerance: number = 0.01,
    seed = Number.MIN_SAFE_INTEGER +
      Math.floor(
        Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER)
      )
  ) {
    this.maxSize = maxSize
    this.seed = seed
    this.numOfBits = -Math.ceil(
      (maxSize * Math.log(maxTolerance)) / LN_2 / LN_2
    )
    if (this.numOfBits > Number.MAX_SAFE_INTEGER) {
      throw new Error('Overflow')
    }
    this.numberHashFunctions = -Math.ceil(Math.log(maxTolerance) / LN_2)
    const numberOfElements = Math.ceil(
      this.numOfBits / Uint8Array.BYTES_PER_ELEMENT
    )
    this.bitsArray = new Uint8Array(numberOfElements)
    this.hashFunctions = this.initHahshes(
      this.numberHashFunctions,
      this.numOfBits
    )
  }

  /**
   *
   * Stores a new value into the filter.
   * If the value is unique with the respect to the one already stored, also increments the size of the filter.
   * NOTE: false positives are treated as duplicate keys.
   *
   */
  public insert = (value: T): this => {
    let positions = this.keyToPositions(value)
    const increaseSize = positions.map(this.writeBit).some((b) => b)
    if (increaseSize) {
      this.count += 1
    }
    return this
  }

  /**
   *
   * Check if a value contains been stored into the Bloom filter.
   *
   * Returns false only if the value contains never been added to the Bloom filter, true if it contains, or for false positives.
   */
  public contains = (value: T): boolean => {
    const positions = this.keyToPositions(value)
    return positions.every((i) => this.readBit(i) !== 0)
  }

  public size = () => this.count

  /**
   *
   * How confident we are about the result we provide. Depends on the number of elements inserted in the Bloom filter,
   * and on the initialization parameters. It is a pessimistic estimate, as we only keep track of the number of elements
   * added, instead of the unique number of elements.
   * By definition it's equal to 1 - falsePositiveProbability.
   *
   * Returns current confidence, as a double between 0 and 1..
   */
  public confidence = () => 1 - this.falsePositiveProbability()

  /**
   *
   * The maximum number of elements that can be added to the Bloom filter while guaranteeing the initial requirements for
   * the probability of false positives.
   *
   * Returns residual capacity.
   */
  public maxRemainingCapacity = () => Math.max(0, this.maxSize - this.count)

  /**
   *
   * Initialize the k hash functions needed to map each key (already transformed into a string) into a set of k indices,
   * the bits that will hold the information about the given key.
   */
  private initHahshes = (
    numberOfHashes: number,
    numBits: number
  ): HashInit[] => {
    return [...Array(numberOfHashes).keys()].map(
      (item) => (h1: number, h2: number) => {
        return (h1 + item * h2 + item * item) % numBits
      }
    )
  }

  // Read a bit from the internal storage.
  // Returns 1 or 0, depending on the value set for that bit.
  private readBit = (index: number) => {
    const { bufferIndex, bitOffset } = this.findBitCoordinates(index)
    // x >> n is the same as n / Math.pow(2, x)
    // if starting with negative, all empty spaces get filled with 1s (otherwise 0s)
    // essentially preserves the sign
    return (this.bitsArray[bufferIndex] & (1 << bitOffset)) >> bitOffset
  }

  /**
   *
   * Stores a bit on the internal bits array.
   * We can only store 1s, so there is no need to pass the value to store.
   *
   * Returns true if at least one bit was flipped, false otherwise (meaning the key was already stored in the
   *                    filter, or would result in a false positive anyway).
   */
  private writeBit = (index: number) => {
    const { bufferIndex, bitOffset } = this.findBitCoordinates(index)
    const oldElement = this.bitsArray[bufferIndex]
    // n << x is the same as n * Math.pow(2, x)
    // 00100101 (37) becomes 00101000 when 37 << 3
    this.bitsArray[bufferIndex] = oldElement | (1 << bitOffset)
    return oldElement !== this.bitsArray[bufferIndex]
  }

  /**
   *
   * Read a bit from the internal storage.
   *
   * Returns 1 or 0, depending on the value set for that bit.
   */
  private findBitCoordinates = (index: number) => {
    const bitsInElement = 8 * this.bitsArray.BYTES_PER_ELEMENT
    const bufferIndex = Math.floor(index / bitsInElement)
    const bitOffset = index % bitsInElement
    return { bufferIndex, bitOffset }
  }

  /**
   *
   * Given a set of hash functions, a seed, and a key, returns the indices of the bits that should be used to store the key.
   *
   * seed: A seed for the hash functions. This is needed to be able to provide deterministic behaviour
   *                       in different runs, both for testing and serialization/deserialization use cases.
   * Returns An array with k indices between 0 and this.numBits - 1.
   */
  private keyToPositions = (value: T) => {
    const key = consistentStringify(value)
    let h1 = murmurHash32(key, this.seed)
    let h2 = fnv1Hash32(key)
    return this.hashFunctions.map((h) => h(h1, h2))
  }

  /**
   *
   * Actual estimated value for the maximum error rate (the probability of a false positive), given the elements currently
   * added to the Bloom filter, and the construction parameters.
   * The false positive probability (the probability that the Bloom filter erroneously claims that an element x is
   * in the set when x is not) is roughly p = (1 - e^(-numHashes * size / width)) ^ numHashes
   *
   * However, the true set cardinality may not be known. From empirical evidence, though.
   * Here we make a pessimistic assumption, i.e. that out of n insertions, all n keys were distinct.
   *
   * Returns Current probability of a false positive, as a double between 0 and 1.
   */
  private falsePositiveProbability = () => {
    return Math.pow(
      1 -
        Math.pow(
          Math.E,
          (-this.numberHashFunctions * this.count) / this.numOfBits
        ),
      this.numberHashFunctions
    )
  }
}
