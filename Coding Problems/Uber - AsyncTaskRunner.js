// Async Task Runner -- run up to n tasks concurrently
// AsyncTaskRunner(concurrency)
// instance.push(task)

// concurrency = 3
// instance.push(example);  // runs immediately
// instance.push(example);  // runs immediately
// instance.push(example);
// instance.push(example);
// instance.push(example);

// run up to the first n tasks concurrently -- all other tasks should be invoked as the first three finish
const delayedMessage = (message, delay) => (done) => {
    setTimeout(() => {
        console.info(message);
        if (typeof done === 'function') {
            done();
        }
    }, delay); // runs in 2 seconds
}

function AsyncTaskRunner (concurrency = 0) {  // 2
    this.tasks = [];
    this.concurrentTasks = [];
    this.runCount = 0;

    this.push = function push(task) {
        if (this.runCount < concurrency) {
            this.concurrentTasks.push(new Promise((resolve) => {
                task(resolve);
            }));
            this.runCount += 1;
        }
        else {
            this.tasks.push(task);
            Promise.all(this.concurrentTasks).then(task);
        }
    };
    return this;
}

const runner = AsyncTaskRunner(2);

runner.push(delayedMessage('task 1', 2000));
runner.push(delayedMessage('task 2', 1000));
runner.push(delayedMessage('task 3', 3000));
runner.push(delayedMessage('task 4', 0));

