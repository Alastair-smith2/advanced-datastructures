import { BST, SearchTree } from '../core/tree'

describe('The binary search tree', () => {
  let tree: SearchTree<number>
  beforeEach(() => {
    tree = new BST()
  })

  it('Should be able to add elements', () => {
    expect(tree.isEmpty()).toEqual(true)
    tree.add(5)
    expect(tree.isEmpty()).toEqual(false)
    expect(tree.size()).toEqual(1)
    expect(tree.height()).toEqual(1)
    expect(tree.search(5)).toEqual(5)
    tree.add(7)
    expect(tree.size()).toEqual(2)
    expect(tree.height()).toEqual(2)
    tree.add(12)
    expect(tree.height()).toEqual(3)
  })

  it('Should be able to remove elements', () => {
    const elements = [10, 7, 11, 15, 9, 12, 20, 25, 15, 22, 18, 17]
    elements.forEach((element) => {
      tree.add(element)
    })
    const reverseArray = elements.reverse()
    reverseArray.forEach((element) => {
      expect(tree.remove(element)).toEqual(true)
    })
  })

  it('Should be able to clear', () => {
    tree.add(10)
    tree.add(7)
    tree.add(11)
    tree.add(15)
    tree.add(9)
    tree.clear()
    expect(tree.min()).toEqual(null)
    expect(tree.max()).toEqual(null)
    expect(tree.size()).toEqual(0)
    expect(tree.height()).toEqual(0)
    tree.add(5)
    expect(tree.size()).toEqual(1)
    expect(tree.isEmpty()).toEqual(false)
  })

  it('Should be able to get the expected min', () => {
    tree.add(10)
    tree.add(7)
    tree.add(11)
    tree.add(15)
    tree.add(9)
    expect(tree.min()).toEqual(7)
    tree.remove(7)
    expect(tree.min()).toEqual(9)
  })

  it('Should be able to get the expected max', () => {
    tree.add(10)
    tree.add(7)
    tree.add(11)
    tree.add(15)
    tree.add(9)
    expect(tree.max()).toEqual(15)
    tree.remove(15)
    expect(tree.max()).toEqual(11)
  })

  it('Should be able to search', () => {
    tree.add(10)
    tree.add(7)
    tree.add(11)
    tree.add(15)
    tree.add(9)
    expect(tree.search(10)).toEqual(10)
    expect(tree.search(9)).toEqual(9)
    expect(tree.search(15)).toEqual(15)
  })
})
