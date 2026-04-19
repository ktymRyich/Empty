export class ObjectPool<T> {
  private free: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initial = 0) {
    this.factory = factory;
    for (let i = 0; i < initial; i++) this.free.push(factory());
  }

  acquire(): T {
    return this.free.pop() ?? this.factory();
  }

  release(item: T) {
    this.free.push(item);
  }

  get availableCount() {
    return this.free.length;
  }
}
