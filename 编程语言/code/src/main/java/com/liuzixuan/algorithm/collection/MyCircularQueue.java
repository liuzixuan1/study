package com.liuzixuan.algorithm.collection;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;

/**
 * @Description  循环队列  数组实现
 * @Author liuzixuan
 * @Date 2021/6/17 17:20
 */
class MyCircularQueue {

    /**
     * 固定数组
     */
    int[] data;
    /**
     * 循环队列头部
     */
    int head;
    int tail;
    int size;
    public MyCircularQueue(int k) {
        data = new int[k];
        head = -1;
        tail = -1;
        size = k;
    }

    public boolean enQueue(int value) {
        if(isFull()) {
            return false;
        }
        if(isEmpty()) {
            head = 0;
        }
        int[][] a = new int[2][2];
        Stack<Integer> s = new Stack<>();
        s.empty()
        Queue<Integer> queue = new LinkedList<>();
        tail = (tail + 1) % size;
        data[tail] = value;
        return true;
    }

    public boolean deQueue() {
        if(isEmpty()) {
            return false;
        }
        if(tail == head) {
            tail = -1;
            head = -1;
            return true;
        }
        head = (head + 1) % size;
        return true;
    }

    public int Front() {
        if(isEmpty()) {
            return -1;
        }
        return data[head];
    }

    public int Rear() {
        if(isEmpty()) {
            return -1;
        }
        return data[tail];
    }

    public boolean isEmpty() {
        return head == -1;
    }

    public boolean isFull() {
        return ((tail + 1) % size) == head;
    }
}

/**
 * Your MyCircularQueue object will be instantiated and called as such:
 * MyCircularQueue obj = new MyCircularQueue(k);
 * boolean param_1 = obj.enQueue(value);
 * boolean param_2 = obj.deQueue();
 * int param_3 = obj.Front();
 * int param_4 = obj.Rear();
 * boolean param_5 = obj.isEmpty();
 * boolean param_6 = obj.isFull();
 */
