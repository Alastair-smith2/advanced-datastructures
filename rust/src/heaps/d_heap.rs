use std::{
    mem::{swap, ManuallyDrop},
    ptr,
};

pub struct DHeap<T: Ord + PartialEq, const B: usize> {
    elements: Vec<T>,
}

struct Hole<'a, T: 'a + Ord> {
    data: &'a mut [T],
    elt: ManuallyDrop<T>,
    pos: usize,
}

impl<'a, T> Hole<'a, T>
where
    T: Ord,
{
    /// Create a new `Hole` at index `pos`.
    ///
    /// Unsafe because pos must be within the data slice.
    #[inline]
    unsafe fn new(data: &'a mut [T], pos: usize) -> Self {
        debug_assert!(pos < data.len());
        // SAFE: pos should be inside the slice
        let elt = unsafe { ptr::read(data.get_unchecked(pos)) };
        Hole {
            data,
            elt: ManuallyDrop::new(elt),
            pos,
        }
    }

    #[inline]
    fn pos(&self) -> usize {
        self.pos
    }

    /// Returns a reference to the element removed.
    #[inline]
    fn element(&self) -> &T {
        &self.elt
    }

    /// Returns a reference to the element at `index`.
    ///
    /// Unsafe because index must be within the data slice and not equal to pos.
    #[inline]
    unsafe fn get(&self, index: usize) -> &T {
        debug_assert!(index != self.pos);
        debug_assert!(index < self.data.len());
        unsafe { self.data.get_unchecked(index) }
    }

    /// Move hole to new location
    ///
    /// Unsafe because index must be within the data slice and not equal to pos.
    #[inline]
    unsafe fn move_to(&mut self, index: usize) {
        debug_assert!(index != self.pos);
        debug_assert!(index < self.data.len());
        unsafe {
            let ptr = self.data.as_mut_ptr();
            let index_ptr: *const _ = ptr.add(index);
            let hole_ptr = ptr.add(self.pos);
            ptr::copy_nonoverlapping(index_ptr, hole_ptr, 1);
        }
        self.pos = index;
    }

    /// Get smallest child index from other elements
    #[inline]
    fn get_smallest_neighbour_index(
        &self,
        current_index: usize,
        branch_size: usize,
        mut smallest_child_index: usize,
    ) -> usize {
        let guard = std::cmp::min(
            get_first_child_index(current_index, branch_size) + branch_size,
            self.data.len(),
        );
        for child_index in smallest_child_index..guard {
            if self.data[child_index] > self.data[smallest_child_index] {
                smallest_child_index = child_index;
            }
        }
        smallest_child_index
    }
}

impl<T> Drop for Hole<'_, T>
where
    T: Ord,
{
    #[inline]
    fn drop(&mut self) {
        // fill the hole again
        unsafe {
            let pos = self.pos;
            ptr::copy_nonoverlapping(&*self.elt, self.data.get_unchecked_mut(pos), 1);
        }
    }
}

impl<T: Ord, const B: usize> DHeap<T, B> {
    pub fn new(elements: Vec<T>) -> Self {
        let mut heap = DHeap { elements };
        if heap.elements.len() > 0 {
            heap.heapify()
        }
        heap
    }

    fn heapify(&mut self) {
        let element_length = self.elements.len();
        let parent_index = get_parent_index(element_length - 1, B);

        for index in (0..=parent_index).rev() {
            self.push_down(index);
        }
    }

    fn push_down(&mut self, index: usize) {
        let mut current_index = index;
        let array_size = self.elements.len();

        let mut smallest_child_index = get_first_child_index(current_index, B);
        let mut hole = unsafe { Hole::new(&mut self.elements, current_index) };
        while smallest_child_index < array_size {
            smallest_child_index =
                hole.get_smallest_neighbour_index(current_index, B, smallest_child_index);
            if unsafe { hole.get(smallest_child_index) } > hole.element() {
                unsafe { hole.move_to(smallest_child_index) };
                current_index = smallest_child_index;
                smallest_child_index = get_first_child_index(current_index, B);
            } else {
                break;
            }
        }
    }

    fn bubble_up(&mut self, index: usize) {
        let mut hole = unsafe { Hole::new(&mut self.elements, index) };
        let mut parent_index;
        while hole.pos > 0 {
            parent_index = get_parent_index(hole.pos(), B);
            if hole.element() > unsafe { hole.get(parent_index) } {
                unsafe { hole.move_to(parent_index) };
            } else {
                break;
            }
        }
    }

    pub fn insert(&mut self, element: T) {
        self.elements.push(element);
        self.bubble_up(self.elements.len() - 1);
    }

    pub fn top(&mut self) -> Option<T> {
        self.elements.pop().map(|mut item| {
            if !self.is_empty() {
                swap(&mut item, &mut self.elements[0]);
                // SAFETY: !self.is_empty() means that self.len() > 0
                self.push_down(0);
            }
            item
        })
    }

    pub fn peek(&self) -> Option<&T> {
        self.elements.get(0)
    }

    pub fn is_empty(&self) -> bool {
        self.elements.is_empty()
    }

    pub fn size(&self) -> usize {
        self.elements.len()
    }

    pub fn remove(&mut self, element: T) {
        let size = self.elements.len();
        let potential_position = self.elements.iter().position(|e| e == &element);
        if size == 0 && potential_position == None {
            return;
        }
        // let else here?
        if let Some(position) = potential_position {
            if position == size - 1 {
                self.elements.remove(position);
            } else {
                self.elements.swap(position, size - 1);
                self.elements.remove(size - 1);
                self.push_down(position);
            }
        }
    }

    pub fn contains(&self, element: &T) -> bool {
        self.elements.contains(element)
    }

    pub fn update(&mut self, old_element: T, new_element: T) {
        if self.elements.is_empty() {
            return;
        }

        let must_push_down = new_element > old_element;
        let position = self
            .elements
            .iter()
            .position(|e| e == &old_element)
            .unwrap();
        self.elements[position] = new_element;
        if must_push_down {
            self.bubble_up(position);
        } else {
            self.push_down(position);
        }
    }
}

fn get_parent_index(index: usize, branch_factor: usize) -> usize {
    (index - 1) / branch_factor
}

fn get_first_child_index(index: usize, branch_factor: usize) -> usize {
    branch_factor * index + 1
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_heap() -> DHeap<u64, 3> {
        DHeap::new(vec![9, 10, 9, 8, 7, 5, 3, 8])
    }

    #[test]
    fn it_should_have_expected_order() {
        let expected_ordering = vec![10, 9, 9, 8, 8, 7, 5, 3];
        let mut heap = create_heap();
        for number in expected_ordering {
            let actual = heap.top().unwrap();
            assert_eq!(actual, number);
        }
        assert!(heap.is_empty());
    }

    #[test]
    fn it_should_be_able_to_insert_elements() {
        let expected_ordering = vec![13, 11, 10, 9, 9, 8, 8, 7, 5, 3];
        let mut heap = create_heap();
        heap.insert(13);
        heap.insert(11);
        assert_eq!(Some(&13), heap.peek());
        assert_eq!(10, heap.size());
        for number in expected_ordering {
            let actual = heap.top().unwrap();
            assert_eq!(actual, number);
        }
        assert_eq!(None, heap.peek());
        assert!(heap.is_empty());
    }

    #[test]
    fn it_should_be_able_to_remove_elements() {
        let expected_ordering = vec![10, 9, 8, 7, 5, 3];
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
        let expected_ordering = vec![14, 10, 9, 9, 8, 7, 5, 3];
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
