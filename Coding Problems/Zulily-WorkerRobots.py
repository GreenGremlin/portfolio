from sys import stdin
from math import floor, log, pow

#Read the input using stdin
input = stdin.readline()
input_tasks = sorted([int(x) for x in input.split(",")], key=int, reverse=True)
input_divide_cost = int(stdin.readline())

class Robot:
    def __init__(self, child_cost, start_time, task):
        self.children = []
        self.start_time = start_time
        self.end_time = start_time + task
        self.child_cost = child_cost

    def firstDone(self):
        if len(self.children) == 0:
            return self
        possible_first = [c.firstDone() for c in self.children]
        possible_first.append(self)
        return min(possible_first, key=lambda c: c.end_time)

    def lastDone(self):
        if len(self.children) == 0:
            return self
        possible_last = [c.lastDone() for c in self.children]
        possible_last.append(self)
        return max(possible_last, key=lambda c: c.end_time)

    def getCompletionTime(self):
        return self.lastDone().end_time

    def addChild(self, task):
        self.start_time += self.child_cost
        self.children.append(Robot(task=task,
                             child_cost=self.child_cost,
                             start_time=self.start_time))
        self.end_time += self.child_cost

    def addTask(self, task):
        next_robot = self.firstDone()
        next_robot.addChild(task)

    def printStats(self, indent=0):
        print_string = ('{indent}task: {task} start: {start}'
                        ' end: {end} done: {done} children: {children}')
        print(print_string.format(task=self.end_time - self.start_time,
                                  start=self.start_time,
                                  end=self.end_time,
                                  done=self.getCompletionTime(),
                                  children=len(self.children),
                                  indent=' ' * indent))
        for child in self.children:
            child.printStats(indent + 2)


robot = Robot(task=input_tasks[0],
              child_cost=input_divide_cost,
              start_time=0)

for task in input_tasks[1:]:
    robot.addTask(task)

print(robot.getCompletionTime())
robot.printStats()

