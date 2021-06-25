package com.liuzixuan.algorithm.sort;

/**
 * @Description  选择排序
 * @Author liuzixuan
 * @Date 2021/6/24 16:31
 */
public class SelectionSort {


    public static void main(String[] args) {
        int[] nums = new int[]{1,2,4,5,3,9,4};
        int[] a =  selectionSort(nums);
        for (int index : a) {
            System.out.println(index);
        }
    }

    /**
     * 选择排序：--找出未排序队列中的最小值  ，放在未排序队列的最前面，i此循环可将前i个数排好序
     * 最佳情况：T(n) = O(n2)  最差情况：T(n) = O(n2)  平均情况：T(n) = O(n2)
     * @param nums
     * @return
     */
    public static int[] selectionSort(int[] nums) {
        int minIndex = 0;
        for (int i = 0;i < nums.length;i++) {
            //未排序数组  以下标i开头
            minIndex = i;
            //在未排序数组中，寻找最小值
            for (int j = i +1; j < nums.length  ;j++) {
                if (nums[j] < nums[minIndex]) {
                    //将最小的数索引保存
                    minIndex = j;
                }
            }
            //将最小值，放在未排序数组开头开头
            int temp = nums[minIndex];
            nums[minIndex] = nums[i];
            nums[i] = temp;
        }

        return nums;
    }
}
