package com.liuzixuan.algorithm.dynamic;

/**
 * @Description 石子游戏   博弈   动态规划
 * 亚历克斯和李用几堆石子在做游戏。偶数堆石子排成一行，每堆都有正整数颗石子 piles[i] 。
 *
 * 游戏以谁手中的石子最多来决出胜负。石子的总数是奇数，所以没有平局。
 *
 * 亚历克斯和李轮流进行，亚历克斯先开始。 每回合，玩家从行的开始或结束处取走整堆石头。
 *
 * 这种情况一直持续到没有更多的石子堆为止，此时手中石子最多的玩家获胜。
 *
 * 假设亚历克斯和李都发挥出最佳水平，当亚历克斯赢得比赛时返回 true ，当李赢得比赛时返回 false 
 *
 * @Author liuzixuan
 * @Date 2021/6/17 10:22
 */
public class StoneGame {

    /**
     * 区间动态规划  博弈游戏
     *  对于石子堆  int[] piles,长度为 n
     * 定义dp[i][j]数组为考虑区间[i,j]，即数组dp[i][j]的值为 在双方做最好选择情况下,在[i,j]区间，先手与后手的最大得分差值
     *
     * 那么dp[0][n-1] 则为考虑所有石子的值，先手与后手的最大得分差值
     *
     * 1、如果dp[0][n-1] > 0,则先手必胜；
     * 2、如果dp[0][n-1] < 0,则先手必败；
     *
     * 如何构建状态方程 dp[i][j] ,根据题意，只能从两端取石堆 ，所以共两种情况
     *
     * 1、从左端取石堆，价值为piles[i] ; 取完石子后，原先的后手变先手，从[i+1,j]区间 做最优决策，所得价值为dp[i+1,j].
     *  因此本次先手从左端点取石堆的话，双方差值为：
     *
     *                  piles[i] - dp[i+1][j]
     *
     * 2、从右端取石堆，价值为piles[j] ;取完石堆后，原先的后手变先手，从[i,j-1]区间 做最优决策，所得价值为dp[i,j-1].
     *  因此本次先手从右端点取石堆的话，双方差值为：
     *
     *                  piles[j] - dp[i][j-1]
     *
     * 所以 要取dp[i][j] 的最优解，则为两种情况中的最大值  也就是状态转移方程：
     *
     *                  dp[i][j] = Max((piles[i] - dp[i+1][j]) , (piles[j] - dp[i][j-1]))
     *
     * 其中包含的  dp[0][n-1] 则为考虑 n 个石堆的值，先手与后手的最大得分差值。
     *
     * 根据状态转移方程   得出  ，大区间的状态值依赖于小区间的状态值，，，即需确定小区间的临界值
     *
     * 剩下一个石堆的时候  ，即 i==j  ,dp[i][j] = piles[i]
    *
     *
     * @param piles
     * @return
     */
    public static boolean stoneGame(int[] piles) {
        int size = piles.length;
        int[][] dp = new int[size+1][size+1];
        for (int i = 0; i < size;i++) {
            dp[i][i] = piles[i];
        }
        for (int i = 0;i < size;i++ ) {
            for (int j = i+1;j<size;j++) {
                dp[i][j] = Math.max((piles[i] -dp[i+1][j]),(piles[j] - dp[i][j-1]));
            }
        }
        return dp[0][size -1] > 0;
    }

    public static void main(String[] args) {
        int[] a = {3,4,5,6,7};
        System.out.println(stoneGame(a));
    }

}
