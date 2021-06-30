package com.liuzixuan.algorithm.sort;

/**
 * @Description 插入排序
 * @Author liuzixuan
 * @Date 2021/6/25 16:26
 */
public class InsertionSort {

    public static void main(String[] args) {
        int[] nums = new int[]{1,2,4,5,3,9,4};
        int[] a =  insertionSort(nums);
        for (int index : a) {
            System.out.println(index);
        }
    }

    /**
     *  插入排序，算法思路：通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。
     * 1、 从第一个元素开始，该元素可以认为已经被排序；
     * 2、 取出下一个元素，在已经排序的元素序列中从后向前扫描；
     * 3、 如果该元素（已排序）大于新元素，将该元素移到下一位置；
     * 4、 重复步骤3，直到找到已排序的元素小于或者等于新元素的位置；
     * 5、 将新元素插入到该位置后；
     * 6、 重复步骤2~5。
     *
     *  最佳情况：T(n) = O(n)   最坏情况：T(n) = O(n2)   平均情况：T(n) = O(n2)
     * @param nums
     * @return
     */
    private static int[] insertionSort(int[] nums) {
        for (int i = 1;i < nums.length;i++) {
            //保存当前遍历的值
            int current = nums[i];
            //遍历已排好序的，前面的队列
            int preIndex = i - 1;
            //当前面的值 大于 当前需要排序的值时，往后挪
            while (preIndex >=0 && nums[preIndex] > current) {
                //把大的值往后挪
                nums[preIndex + 1] = nums[preIndex];
                //在已排好序的队列  ，往前遍历
                preIndex--;
            }
            //将需要排序的值，插入小于它的值后面
            nums[preIndex + 1] = current;
        }

        return nums;
    }
}
