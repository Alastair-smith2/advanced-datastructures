import { PriorityQueue } from "./interface";

type Compare<T> = (elementA: T, elementB: T) => boolean;

export class DHeap<T> implements PriorityQueue<T> {
  private elements: T[];
  // Can't use object as the map key unless we're being passed in the exact instance of the object
  // instead we can JSON.stringify the element to make it a string
  // can refactor this to do a check if value passed is non primitive
  private elementPositions: Map<string, number>;
  private branchFactor: number;
  private compare: Compare<T>;

  constructor(
    elements: T[] = [],
    branchFactor: number = 2,
    compareFunction: Compare<T>
  ) {
    this.branchFactor = branchFactor;
    this.elements = elements;
    this.elementPositions = new Map();
    this.compare = compareFunction;
    const arrayLength = elements.length;
    for (
      let index = this.getParentIndex(arrayLength - 1) + 1;
      index < arrayLength;
      index++
    ) {
      this.elementPositions.set(JSON.stringify(elements[index]), index);
    }

    for (
      let index = this.getParentIndex(arrayLength - 1);
      index >= 0;
      index--
    ) {
      // Performs a push-down for every element with at least one children, starting from last
      // This way each sub-tree rooted at index i will be a valid sub-heap
      this.pushDown(index);
    }
  }

  top = () => {
    if (this.elements.length === 0) {
      return null;
    }
    const arrayLength = this.elements.length;
    const top = this.elements[0];
    if (arrayLength > 1) {
      // pop is a nicer api but returns T | undefined where the above check means we know there's an element here
      const lastElement = this.elements.splice(this.elements.length - 1, 1);
      this.elements[0] = lastElement[0];
      this.pushDown(0);
    } else {
      this.elements.pop();
    }
    this.elementPositions.delete(JSON.stringify(top));
    return top;
  };

  peek = () => {
    return this.elements.length === 0 ? null : this.elements[0];
  };

  insert = (element: T) => {
    if (this.elementPositions.has(JSON.stringify(element))) {
      return false;
    }
    this.elements.push(element);
    this.bubbleUp(this.elements.length - 1);
    return true;
  };

  remove = (element: T) => {
    const arrayLength = this.elements.length;
    const jsonElement = JSON.stringify(element);
    const position = this.elementPositions.get(jsonElement);
    // we don't use contains method directly here as TS can't infer position as not optional
    if (arrayLength === 0 || position === undefined) {
      return false;
    }

    if (position === arrayLength - 1) {
      this.elements.splice(position, 1);
      this.elementPositions.delete(jsonElement);
    } else {
      this.elements[position] = this.elements[arrayLength - 1];
      this.elements.splice(arrayLength - 1);
      this.elementPositions.delete(jsonElement);
      this.pushDown(position);
    }
    return true;
  };

  update = (element: T, newValue: T) => {
    const arrayLength = this.elements.length;
    const jsonElement = JSON.stringify(element);
    const position = this.elementPositions.get(jsonElement);
    // we don't use contains method directly here as TS can't infer position as not optional
    // can refactor this out...
    if (arrayLength === 0 || position === undefined) {
      return false;
    }
    this.elements[position] = newValue;
    if (this.compare(newValue, element)) {
      this.bubbleUp(position);
    } else {
      this.pushDown(position);
    }
    return true;
  };

  contains = (element: T) => {
    return this.elementPositions.has(JSON.stringify(element));
  };

  private bubbleUp = (index = this.elements.length - 1) => {
    let current = this.elements[index];
    let parentIndex: number;
    while (index > 0) {
      parentIndex = this.getParentIndex(index);
      const parent = this.elements[parentIndex];
      if (this.compare(current, parent)) {
        this.elements[index] = parent;
        this.elementPositions.set(JSON.stringify(parent), parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
    this.elements[index] = current;
    this.elementPositions.set(JSON.stringify(current), index);
  };

  private pushDown = (index: number) => {
    const arrayLength = this.elements.length;
    let smallestChildrenIndex = this.getFirstChildIndex(index);
    const element = this.elements[index];

    while (smallestChildrenIndex < arrayLength) {
      const lastChildrenIndexGuard = Math.min(
        this.getFirstChildIndex(index) + this.branchFactor,
        arrayLength
      );
      // Find all
      for (
        let childrenIndex = smallestChildrenIndex;
        childrenIndex < lastChildrenIndexGuard;
        childrenIndex++
      ) {
        if (
          this.compare(
            this.elements[childrenIndex],
            this.elements[smallestChildrenIndex]
          )
        ) {
          smallestChildrenIndex = childrenIndex;
        }
      }
      const child = this.elements[smallestChildrenIndex];
      if (this.compare(child, element)) {
        this.elements[index] = child;
        this.elementPositions.set(JSON.stringify(child), index);
        index = smallestChildrenIndex;
        smallestChildrenIndex = this.getFirstChildIndex(index);
      } else {
        break;
      }
    }
    this.elements[index] = element;
    this.elementPositions.set(JSON.stringify(element), index);
  };

  private getFirstChildIndex = (index: number) => {
    return this.branchFactor * index + 1;
  };

  private getParentIndex = (index: number) => {
    return Math.floor((index - 1) / this.branchFactor);
  };

  checkHeapInvariants = (): boolean => {
    for (let i = 0, n = this.elements.length; i < n; i++) {
      let element = this.elements[i];

      for (
        let j = this.getFirstChildIndex(i),
          last = this.getFirstChildIndex(i + 1);
        j < last;
        j++
      ) {
        if (j < n) {
          if (this.compare(this.elements[j], element)) {
            return false;
          }
        }
      }
    }
    return true;
  };
}
