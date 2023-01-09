use criterion::{criterion_group, criterion_main, Criterion};

use advanced_datastructures::heaps::d_heap::DHeap;
use advanced_datastructures::heaps::d_heap_arc::DHeap as ArcDHeap;
use advanced_datastructures::heaps::d_way_heap_clone::DHeap as BasicDHeap;
use rand::seq::SliceRandom;
use rand::thread_rng;

fn process_elements(values: Vec<i32>, copy: Vec<i32>) {
    let mut heap: DHeap<i32, 3> = DHeap::new(values);
    let element_mid = copy.len() / 2;
    for element_index in element_mid..copy.len() {
        let exists = heap.contains(&copy[element_index]);
        assert!(exists);
    }
    for n in &copy {
        let num = heap.top().unwrap();
        assert_eq!(*n, num)
    }
}

fn process_elements_arc(values: Vec<i32>, copy: Vec<i32>) {
    let mut heap: ArcDHeap<i32, 3> = ArcDHeap::new(values);
    let element_mid = copy.len() / 2;
    for element_index in element_mid..copy.len() {
        let exists = heap.contains(&copy[element_index]);
        assert!(exists);
    }
    for n in &copy {
        let num = heap.top().unwrap();
        assert_eq!(*n, num)
    }
}

fn process_elements_basic(values: Vec<i32>, copy: Vec<i32>) {
    let mut heap: BasicDHeap<i32> = BasicDHeap::new(values, Some(3));
    let element_mid = copy.len() / 2;
    for element_index in element_mid..copy.len() {
        let exists = heap.contains(&copy[element_index]);
        assert!(exists);
    }
    for n in &copy {
        let num = heap.top().unwrap();
        assert_eq!(*n, num)
    }
}

fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("d_heap_one_ten_thousand");
    let count = 10_000;
    let mut values: Vec<i32> = (0..count).collect();
    values.shuffle(&mut thread_rng());
    let mut copy = values.clone();
    copy.sort();
    copy.reverse();
    group.significance_level(0.1).sample_size(20);
    group.bench_function("arc", |b| {
        b.iter(|| process_elements_arc(values.clone(), copy.clone()))
    });
    group.bench_function("basic", |b| {
        b.iter(|| process_elements_basic(values.clone(), copy.clone()))
    });
    group.bench_function("unsafe", |b| {
        b.iter(|| process_elements(values.clone(), copy.clone()))
    });
    group.finish()
}

// https://bheisler.github.io/criterion.rs/book/faq.html#cargo-bench-gives-unrecognized-option-errors-for-valid-command-line-options
// cargo bench --bench d_heap -- --plotting-backend plotters

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
