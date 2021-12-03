export interface SearchTree<T> {
  add: (element: T) => boolean;
  remove: (element: T) => boolean;
  clear: () => void;
  min: () => T | null;
  max: () => T | null;
  search: (element: T) => T | null;
  isEmpty: () => boolean;
  size: () => number;
  height: () => number;
}

class BSTNode<T> {
  private value: T;
  private right: BSTNode<T> | null = null;
  private left: BSTNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
  public add = (element: T): BSTNode<T> => {
    if (element <= this.value) {
      const node = this.left ? this.left.add(element) : new BSTNode(element);
      this.left = node;
    } else {
      const node = this.right ? this.right.add(element) : new BSTNode(element);
      this.right = node;
    }
    return this;
  };

  public getValue = () => this.value;

  public size = (): number => {
    return 1 + (this.left?.size() ?? 0) + (this.right?.size() ?? 0);
  };

  public height = (): number => {
    return (
      1 +
      Math.max(this.left?.height() ?? 0, Math.max(this.right?.height() ?? 0))
    );
  };

  public search = (element: T): BSTNode<T> | null => {
    if (element === this.value) {
      return this;
    }
    let result = null;
    if (element < this.value) {
      result = this.left?.search(element) ?? null;
    }

    if (!result && element > this.value) {
      result = this.right?.search(element) ?? null;
    }
    return result;
  };

  private isLeaf = () => {
    return !this.left && !this.right;
  };

  public max = (): T | null => {
    return this.right ? this.right.max() : this.value;
  };

  public min = (): T | null => {
    return this.left ? this.left.min() : this.value;
  };

  // This method needs to be tidied up, in the Java example by reference works neater than it does here
  public remove = (
    element: T,
    wasRemoved: boolean = false
  ): { node: BSTNode<T> | null; wasRemoved: boolean } => {
    let node = null;
    if (element === this.value) {
      wasRemoved = true;
      if (this.isLeaf()) {
        return { node, wasRemoved };
      } else if (!this.right || (this.left !== null && Math.random() > 0.5)) {
        const prevKey = this.left?.max() ?? null;
        if (prevKey) {
          this.value = prevKey;
          // this is ideal but doesn't override the wasRemoved property...
          const result = this.left?.remove(prevKey, wasRemoved);
          if (result) {
            this.left = result.node;
            wasRemoved = result.wasRemoved;
          } else {
            this.left = null;
          }
          //   this.left = this.left?.remove(prevKey, wasRemoved).node ?? null;
        }
      } else {
        const nextKey = this.right?.min() ?? null;
        if (nextKey) {
          this.value = nextKey;
          // this is ideal but doesn't override the wasRemoved property...
          //   this.right = this.right?.remove(nextKey, wasRemoved).node ?? null;
          const result = this.right?.remove(nextKey, wasRemoved);
          if (result) {
            this.right = result.node;
            wasRemoved = result.wasRemoved;
          } else {
            this.right = null;
          }
        }
      }
      return { node: this, wasRemoved };
    }
    if (element < this.value) {
      // this is ideal but doesn't override the wasRemoved property...
      //   this.left = this.left ? this.left.remove(element, wasRemoved).node : null;
      const result = this.left?.remove(element, wasRemoved);
      if (result) {
        this.left = result.node;
        wasRemoved = result.wasRemoved;
      } else {
        this.left = null;
      }
    } else {
      // this is ideal but doesn't override the wasRemoved property...
      //   this.right = this.right
      //     ? this.right.remove(element, wasRemoved).node
      //     : null;
      const result = this.right?.remove(element, wasRemoved);
      if (result) {
        this.right = result.node;
        wasRemoved = result.wasRemoved;
      } else {
        this.right = null;
      }
    }
    return { node: this, wasRemoved };
  };
}

export class BST<T> implements SearchTree<T> {
  private root: BSTNode<T> | null;
  constructor(root = null) {
    this.root = root;
  }

  public add = (element: T) => {
    this.root ? this.root.add(element) : (this.root = new BSTNode(element));
    return true;
  };

  public remove = (element: T) => {
    return this.root ? this.root.remove(element).wasRemoved : false;
  };

  public clear = () => {
    this.root = null;
  };

  public min = () => (this.root ? this.root.min() : null);

  public max = () => (this.root ? this.root.max() : null);

  public search = (element: T) => {
    return this.root ? this.root.search(element)?.getValue() ?? null : null;
  };

  public isEmpty = () => {
    return this.root ? false : true;
  };

  public size = () => {
    return this.root ? this.root.size() : 0;
  };

  public height = () => {
    return this.root ? this.root.height() : 0;
  };
}
