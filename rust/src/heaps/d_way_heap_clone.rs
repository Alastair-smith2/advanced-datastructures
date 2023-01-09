use std::{collections::HashMap, hash::Hash};

type PositionHashMap<T> = HashMap<T, usize>;

#[derive(Debug)]
pub struct DHeap<T: Eq + Hash + Clone + PartialOrd + std::fmt::Debug> {
    elements: Vec<T>,
    element_positions: PositionHashMap<T>,
    branch_factor: u64,
}

// Anyway to do this without the clone?
impl<T> DHeap<T>
where
    T: Eq + Hash + Clone + PartialOrd + std::fmt::Debug,
{
    pub fn new(elements: Vec<T>, branching_factor: Option<u64>) -> Self {
        let branch_factor = branching_factor.unwrap_or(2);
        let element_positions: PositionHashMap<T> = HashMap::new();
        let mut d_heap = DHeap {
            elements,
            element_positions,
            branch_factor,
        };
        d_heap.heapify();
        d_heap
    }

    fn heapify(&mut self) {
        let element_length = self.elements.len();
        let parent_index = self.get_parent_index(element_length - 1);
        let starting_index = parent_index + 1;
        for index in starting_index..element_length {
            self.element_positions
                .insert(self.elements[index].clone(), index);
        }

        for index in (0..=parent_index).rev() {
            self.push_down(index);
        }
    }

    fn get_parent_index(&self, index: usize) -> usize {
        (index - 1) / self.branch_factor as usize
    }

    // does 'remove' instead of clone break the algorithm I wonder?

    fn bubble_up(&mut self, index: usize) {
        let current = self.elements[index].clone();
        let mut bubble_up_index = index;
        let mut parent_index;
        while bubble_up_index > 0 {
            parent_index = self.get_parent_index(bubble_up_index);
            let parent = self.elements[parent_index].clone();
            if current > parent {
                self.element_positions.insert(parent.clone(), parent_index);
                self.elements[bubble_up_index] = parent;
                bubble_up_index = parent_index
            } else {
                break;
            }
        }
        self.element_positions
            .insert(current.clone(), bubble_up_index);
        self.elements[bubble_up_index] = current;
    }

    fn get_first_child_index(&self, index: usize) -> usize {
        return (self.branch_factor as usize * index) + 1;
    }

    fn push_down(&mut self, index: usize) {
        let mut push_down_index = index;
        let size = self.elements.len();
        let current = self.elements[push_down_index].clone();
        let mut smallest_children_index = self.get_first_child_index(push_down_index);
        while smallest_children_index < size {
            let guard = std::cmp::min(
                self.get_first_child_index(push_down_index) + self.branch_factor as usize,
                size,
            );
            for children_index in smallest_children_index..guard {
                if self.elements[children_index] > self.elements[smallest_children_index] {
                    smallest_children_index = children_index;
                }
            }
            let child = self.elements[smallest_children_index].clone();
            // check priorities
            if child > current {
                self.element_positions
                    .insert(child.clone(), push_down_index);
                self.elements[push_down_index] = child;
                push_down_index = smallest_children_index;
                smallest_children_index = self.get_first_child_index(push_down_index)
            } else {
                break;
            }
        }

        self.element_positions
            .insert(current.clone(), push_down_index);
        self.elements[push_down_index] = current;
    }

    pub fn insert(&mut self, element: T) {
        self.elements.push(element);
        self.bubble_up(self.elements.len() - 1);
    }

    pub fn top(&mut self) -> Option<T> {
        let top_element = self.elements.pop();
        if self.elements.is_empty() {
            return top_element;
        } else {
            let first_element = self.elements[0].clone();
            self.elements[0] = top_element.unwrap();
            self.push_down(0);
            Some(first_element)
        }
    }

    pub fn peek(&self) -> Option<&T> {
        self.elements.get(0)
    }

    pub fn contains(&self, element: &T) -> bool {
        self.element_positions.contains_key(element)
    }

    pub fn is_empty(&self) -> bool {
        self.elements.is_empty()
    }

    pub fn remove(&mut self, element: T) {
        let size = self.elements.len();
        let potential_position = self.element_positions.get(&element);
        if size == 0 && potential_position == None {
            return;
        }
        // let else here?
        let position = *potential_position.unwrap();
        if position == size - 1 {
            self.elements.remove(position);
            self.element_positions.remove(&element);
        } else {
            let element_to_replace_with = self.elements[size - 1].clone();
            self.elements[position] = element_to_replace_with;
            self.elements.remove(size - 1);
            self.element_positions.remove(&element);
            self.push_down(position);
        }
    }

    pub fn update(&mut self, old_element: T, new_element: T) {
        if self.elements.is_empty() || !self.element_positions.contains_key(&old_element) {
            return;
        }
        let position = *self.element_positions.get(&old_element).unwrap();
        let must_push_down = new_element > old_element;
        self.elements[position] = new_element;
        if must_push_down {
            self.bubble_up(position);
        } else {
            self.push_down(position);
        }
    }

    pub fn size(&self) -> usize {
        self.elements.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_heap() -> DHeap<u64> {
        DHeap::new(vec![9, 10, 3, 5, 7, 8, 13], Some(3))
    }

    #[test]
    fn it_should_have_expected_order() {
        let expected_ordering = vec![13, 10, 9, 8, 7, 5, 3];
        let mut heap = create_heap();
        for number in expected_ordering {
            let actual = heap.top().unwrap();
            assert_eq!(actual, number);
        }
        assert!(heap.is_empty());
    }

    #[test]
    fn it_should_be_able_to_insert_elements() {
        let expected_ordering = vec![14, 13, 11, 10, 9, 8, 7, 5, 3];
        let mut heap = create_heap();
        heap.insert(14);
        heap.insert(11);
        assert_eq!(Some(&14), heap.peek());
        assert_eq!(9, heap.size());
        for number in expected_ordering {
            let actual = heap.top().unwrap();
            assert_eq!(actual, number);
        }
        assert_eq!(None, heap.peek());
        assert!(heap.is_empty());
    }

    #[test]
    fn it_should_be_able_to_remove_elements() {
        let expected_ordering = vec![13, 10, 7, 5, 3];
        let mut heap = create_heap();
        heap.remove(9);
        heap.remove(8);
        for number in expected_ordering {
            let actual = heap.top().unwrap();
            assert_eq!(actual, number);
        }
        assert_eq!(None, heap.peek());
        assert!(heap.is_empty());
    }

    #[test]
    fn it_should_be_able_to_update_elements() {
        let expected_ordering = vec![14, 13, 10, 9, 7, 5, 3];
        let mut heap = create_heap();
        heap.update(8, 14);
        assert_eq!(Some(&14), heap.peek());
        for number in expected_ordering {
            let actual = heap.top().unwrap();
            assert_eq!(actual, number);
        }
        assert!(heap.is_empty());
    }
}
