import { SingleList, SingleLinkedList } from '../core/linked-list/single'

describe('The single linked list', () => {
  let list: SingleList<number>
  beforeEach(() => {
    list = new SingleLinkedList((a, b) => a === b)
  })

  it('Should be able to append elements', () => {
    list.append(5)
    expect(list.size()).toEqual(1)
    list.append(10)
    expect(list.size()).toEqual(2)
    expect(list.size()).toEqual(2)
  })

  it('Should be able to add elements to the beginning', () => {
    list.append(10)
    list.append(5)
    list.addFirst(20)
    expect(list.traversal()).toEqual([20, 10, 5])
  })

  it('Should be able to remove elements', () => {
    list.append(5)
    list.append(10)
    list.delete(5)
    expect(list.size()).toEqual(1)
    expect(list.search(10)!.getValue()).toEqual(10)
  })

  it('Should be able to traverse', () => {
    list.append(5)
    list.append(10)
    expect(list.traversal()).toEqual([5, 10])
  })

  it('Should be able to remove the first element', () => {
    list.append(5)
    list.append(10)
    expect(list.removeFirst()!.getValue()).toEqual(5)
    expect(list.size()).toEqual(1)
    expect(list.removeFirst()!.getValue()).toEqual(10)
    expect(list.removeFirst()).toEqual(null)
    expect(list.size()).toEqual(0)
  })

  it('Should be able to remove the last element', () => {
    list.append(5)
    list.append(10)
    list.append(20)
    expect(list.removeLast()!.getValue()).toEqual(20)
    expect(list.removeLast()!.getValue()).toEqual(10)
    expect(list.removeLast()!.getValue()).toEqual(5)
    expect(list.removeLast()).toEqual(null)
    expect(list.size()).toEqual(0)
  })
})
