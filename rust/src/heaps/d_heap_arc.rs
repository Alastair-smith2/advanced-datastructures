use core::hash::Hash;
use std::collections::HashMap;
use std::sync::Arc;

type PositionHashMap<T> = HashMap<Arc<T>, usize>;

#[derive(Debug)]
pub struct DHeap<T: Eq + Hash + PartialOrd + std::fmt::Debug, const B: usize> {
    elements: Vec<Arc<T>>,
    element_positions: PositionHashMap<T>,
}

impl<T, const B: usize> DHeap<T, B>
where
    T: Eq + Hash + PartialOrd + std::fmt::Debug,
{
    pub fn new(elements: Vec<T>) -> Self {
        let element_positions: PositionHashMap<T> = HashMap::new();
        let mut d_heap = DHeap {
            elements: elements.into_iter().map(|e| Arc::new(e)).collect(),
            element_positions,
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
        (index - 1) / B
    }

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
        return (B * index) + 1;
    }

    fn push_down(&mut self, index: usize) {
        let mut push_down_index = index;
        let size = self.elements.len();
        let current = self.elements[push_down_index].clone();
        let mut smallest_children_index = self.get_first_child_index(push_down_index);
        while smallest_children_index < size {
            let guard = std::cmp::min(self.get_first_child_index(push_down_index) + B, size);
            for children_index in smallest_children_index..guard {
                if self.elements[children_index] > self.elements[smallest_children_index] {
                    smallest_children_index = children_index;
                }
            }
            let child = self.elements[smallest_children_index].clone();
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
        let item = Arc::new(element);
        self.elements.push(item);
        self.bubble_up(self.elements.len() - 1);
    }

    pub fn top(&mut self) -> Option<T> {
        let top_element = self.elements.pop();
        // convert to map...
        if self.elements.is_empty() {
            let el = top_element.unwrap();
            self.element_positions
                .remove(&el)
                .expect("mismatched keys A");
            Some(
                Arc::try_unwrap(el)
                    .ok()
                    .expect("Too many owners for element of top"),
            )
        } else {
            let first_element = self.elements[0].clone();
            self.elements[0] = top_element.unwrap();
            self.push_down(0);
            self.element_positions
                .remove(&first_element)
                .expect("mismatched keys B");
            Some(
                Arc::try_unwrap(first_element)
                    .ok()
                    .expect("Too many owners for else branch of element"),
            )
        }
    }

    fn peek(&self) -> Option<&T> {
        self.elements.get(0).map(|arc| &**arc)
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
        self.elements[position] = Arc::new(new_element);
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

    fn create_heap() -> DHeap<u64, 3> {
        DHeap::new(vec![9, 10, 3, 5, 7, 8, 11])
    }

    #[test]
    fn it_should_have_expected_order() {
        let expected_ordering = vec![11, 10, 9, 8, 7, 5, 3];
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
        heap.insert(13);
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
        let expected_ordering = vec![11, 10, 7, 5, 3];
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
        let expected_ordering = vec![14, 11, 10, 9, 7, 5, 3];
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
