package com.liuzixuan.algorithm.sort;

/**
 * @Description 冒泡算法实现
 * @Author liuzixuan
 * @Date 2021/6/24 16:14
 */
public class BubbleSort {

    public static void main(String[] args) {
        int[] nums = new int[]{1,2,4,5,3,9,4};
        int[] a =  bubbleSort(nums);
        for (int index : a) {
            System.out.println(index);
        }
    }

    /**
     * 相邻比较，每次内循环结束把最大值，放到最后位
     * 最佳情况：T(n) = O(n)   最差情况：T(n) = O(n2)   平均情况：T(n) = O(n2)
     * @param nums
     * @return
     */
    public static int[] bubbleSort(int[] nums) {
        for(int i = 0;i < nums.length;i++) {
            for (int j = 1;j < nums.length -i -1;j++) {
                //相邻元素对比
                if (nums[j] > nums[j+1]) {
                    //交换
                    int temp = nums[j];
                    nums[j] = nums[j+1];
                    nums[j+1] = temp;
                }
            }
        }
        return nums;
    }
}
