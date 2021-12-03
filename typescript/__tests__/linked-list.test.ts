import { ILinkedList, LinkedList } from '../core/linked-list'

describe('The linked list', () => {
  let list: ILinkedList<number>
  beforeEach(() => {
    list = new LinkedList()
  })

  it('Should verify isEmpty on an empty list', () => {
    expect(list.isEmpty()).toEqual(true)
  })

  it('Should verify isEmpty on a list that has values', () => {
    list.add(5)
    expect(list.isEmpty()).toEqual(false)
  })

  it('Should verify add', () => {
    list.add(5)
    expect(list.contains(5)).toEqual(true)
    list.add(10)
    list.add(15)
    expect(list.contains(10)).toEqual(true)
    expect(list.contains(5)).toEqual(true)
    expect(list.contains(100)).toEqual(false)
  })

  it('Should verify remove', () => {
    expect.assertions(6)
    const values = [1, 10, 5, 9, 22, 15]
    values.reverse()
    list.addAll(values)
    values.forEach((element) => {
      expect(list.remove(element)?.getValue()).toEqual(element)
    })
  })

  it('Should verify size', () => {
    expect(list.size()).toEqual(0)
    list.add(5)
    expect(list.size()).toEqual(1)
    list.add(10)
    expect(list.size()).toEqual(2)
    list.remove(10)
    expect(list.size()).toEqual(1)
    list.remove(8)
    expect(list.size()).toEqual(1)
  })

  it('Should verify removeTail', () => {
    const values = [1, 5, 7, 9, 10]
    list.addAll(values)
    expect(list.size()).toEqual(5)
    expect(list.removeTail()!.getValue()).toEqual(1)
    expect(list.removeTail()!.getValue()).toEqual(5)
    expect(list.search(5)).toEqual(null)
    expect(list.removeTail()!.getValue()).toEqual(7)
  })

  it('Should verify remove', () => {
    const values = [1, 5, 7, 9, 10]
    list.addAll(values)
    expect(list.size()).toEqual(5)
    list.clear()
    expect(list.size()).toEqual(0)
    expect(list.contains(5)).toEqual(false)
    expect(list.isEmpty()).toEqual(true)
    expect(list.search(5)).toEqual(null)
  })
})
