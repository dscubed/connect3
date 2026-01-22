// scripts/kb/priorityQueue.ts
// Binary heap max-priority queue (higher score first). Stable-ish via seq.
export type PQItem<T> = { score: number; seq: number; value: T };

export class MaxPriorityQueue<T> {
  private heap: PQItem<T>[] = [];
  private seq = 0;

  size() {
    return this.heap.length;
  }

  push(value: T, score: number) {
    const item: PQItem<T> = { value, score, seq: this.seq++ };
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top.value;
  }

  peek(): T | undefined {
    return this.heap[0]?.value;
  }

  private greater(a: PQItem<T>, b: PQItem<T>) {
    // higher score wins; tie-breaker: earlier seq wins
    return a.score > b.score || (a.score === b.score && a.seq < b.seq);
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.greater(this.heap[p], this.heap[i])) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  private bubbleDown(i: number) {
    const n = this.heap.length;
    while (true) {
      const l = i * 2 + 1;
      const r = i * 2 + 2;
      let best = i;

      if (l < n && this.greater(this.heap[l], this.heap[best])) best = l;
      if (r < n && this.greater(this.heap[r], this.heap[best])) best = r;

      if (best === i) break;
      [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
      i = best;
    }
  }
}