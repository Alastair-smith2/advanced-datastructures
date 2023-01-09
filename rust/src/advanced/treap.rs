use std::{
    cell::RefCell,
    rc::{Rc, Weak},
};

// Sanity check this...
#[derive(PartialEq)]
struct TreapEntry<K, P: std::cmp::PartialOrd> {
    pub key: K,
    pub priority: P,
}

impl<K, P> std::cmp::PartialOrd for TreapEntry<K, P>
where
    P: std::cmp::PartialOrd,
    K: PartialEq,
{
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.priority.partial_cmp(&other.priority)
    }
}
// need to implement cmp

#[derive(Debug)]
struct TreapNode<K, P> {
    key: K,
    priority: P,
    left: Option<NodeLink<K, P>>,
    right: Option<NodeLink<K, P>>,
    parent: Option<Weak<NodeLink<K, P>>>,
}

type NodeLink<K, P> = Rc<RefCell<TreapNode<K, P>>>;

impl<K, P> TreapNode<K, P>
where
    K: std::cmp::PartialOrd,
    P: Ord,
{
    pub fn new(key: K, priority: P) -> Self {
        TreapNode {
            key,
            priority,
            parent: None,
            left: None,
            right: None,
        }
    }
    pub fn add_element(&mut self, value: K, priority: P) {
        let potential_child = if &value < &self.key {
            &mut self.left
        } else {
            &mut self.right
        };
        match potential_child {
            Some(child) => child.add_element(value, priority),
            None => {
                let treap_node = TreapNode::new(value, priority);
                *potential_child = Some(Box::new(treap_node));
            }
        }
    }
}

// struct Treap<T: std::cmp::PartialOrd, E: Ord> {
//     root: Node<T, E>,
// }

// Try using arena based...?
