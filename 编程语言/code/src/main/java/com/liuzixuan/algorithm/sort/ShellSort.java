package com.liuzixuan.algorithm.sort;

/**
 * @Description  希尔排序
 * @Author liuzixuan
 * @Date 2021/6/25 17:00
 */
public class ShellSort {

    public static void main(String[] args) {
        int[] nums = new int[]{1,2,4,5,3,9,4};
        int[] a =  shellSort(nums);
        for (int index : a) {
            System.out.println(index);
        }
    }

    private static int[] shellSort(int[] nums) {
        int length = nums.length;
        for(int i = length / 2;i > 1;i /= 2) {
            for(int j = i; j < length;j++) {
                int tem = nums[j];
            }
        }


        return nums;
    }
}
