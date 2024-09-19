export class RequestPool {
  private maxConcurrency: number; // 最大并发数
  private currentConcurrency: number; // 当前并发数
  private taskQueue: (() => Promise<void>)[]; // 任务队列

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency;
    this.currentConcurrency = 0;
    this.taskQueue = [];
  }

  // 添加任务到队列中
  addTask<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskWrapper = async () => {
        try {
          this.currentConcurrency++;
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentConcurrency--;
          this.next();
        }
      };
      this.taskQueue.push(taskWrapper);
      this.next();
    });
  }

  // 尝试执行下一个任务
  private next(): void {
    if (this.currentConcurrency < this.maxConcurrency && this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        nextTask();
      }
    }
  }
}

// 示例使用：
const pool = new RequestPool(3); // 创建一个最大并发数为3的请求池

// 模拟异步请求
function createTask(taskName: string, delay: number): () => Promise<string> {
  return () =>
    new Promise((resolve) => {
      console.log(`${taskName} started`);
      setTimeout(() => {
        console.log(`${taskName} completed`);
        resolve(taskName);
      }, delay);
    });
}


