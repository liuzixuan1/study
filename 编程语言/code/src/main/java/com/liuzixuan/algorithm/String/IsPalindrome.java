package com.liuzixuan.algorithm.String;

import java.util.HashMap;

/**
 * @Description 判断字符串是否是回文串
 * 回文串：排除特殊字符，正反序 都相同的字符串
 * @Author liuzixuan
 * @Date 2021/7/12 15:51
 */
public class IsPalindrome {
    public static void main(String[] args){

        System.out.println(isPalindrome("abbaa"));
    }

        public static boolean isPalindrome(String s) {
            if(s.length() == 0) {
                return true;
            }
            int left=0,right=s.length()-1;
            while(left < right) {
                while(left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                    left++;
                }
                while(left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                    right--;
                }
                if(Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                    return false;
                }
                left++;
                right--;
            }
            return true;
        }
}

